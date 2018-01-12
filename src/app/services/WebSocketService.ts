import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import {WSMessage} from "../models/WSMessage";
import {UserAccountService} from "./UserAccountService";
import {UserAccount} from "../models/UserAccount";
import {LoginService} from "./LoginService";
import {IntervalObservable} from "rxjs/observable/IntervalObservable";
import {Subscription} from "rxjs/Subscription";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class WebSocketService {

  private account: UserAccount;

  constructor(private loginService: LoginService) {
    this.loginService.account.subscribe(res => {
      this.account = res;
    });
  }

  input: BehaviorSubject<MessageEvent> = new BehaviorSubject(null);
  output: BehaviorSubject<MessageEvent> = new BehaviorSubject(null);
  private ws: WebSocket;
  private pingInterval: Subscription;
  private authInterval: Subscription;

  private authOptions: any = {};

  public connect(url, refresh: boolean = false, authOptions = {}) {
    this.authOptions = authOptions;
    if (!this.ws || refresh) {
      this.create(url);
    }
  }

  private create(url) {
    if (this.ws) {
      this.ws.close();
    }
    this.ws = new WebSocket(url);

    if (this.pingInterval != null) {
      this.pingInterval.unsubscribe();
    }
    if (this.authInterval != null) {
      this.authInterval.unsubscribe();
    }

    this.pingInterval = IntervalObservable.create(5000).subscribe(res => {
      this.ping();
    });
    this.authInterval = IntervalObservable.create(1000).subscribe(res => {
      this.authenticate();
    });

    this.ws.onmessage = (msg) => {
      if (msg != null) {
        this.input.next(msg);
      }
    };

    this.output.subscribe(msg => {
      if (msg != null && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(msg.data));
      }
    });
  }


  private ping() {
    this.output.next(new MessageEvent("ping", {data: new WSMessage("PING", {})}));
  }

  authenticate() {
    if (this.ws != null && this.ws.readyState === WebSocket.OPEN) {
      this.authInterval.unsubscribe();
      this.output.next(new MessageEvent("message", {
        data: new WSMessage("AUTH", Object.assign(
          {},
          {
            userId: this.account.id,
            loginToken: this.account.loginToken.token
          },
          this.authOptions
        ))
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    if (this.pingInterval != null) {
      this.pingInterval.unsubscribe();
    }
    if (this.authInterval != null) {
      this.authInterval.unsubscribe();
    }
  }
}
