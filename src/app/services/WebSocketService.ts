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

@Injectable()
export class WebSocketService {

  private account: UserAccount;

  constructor(private loginService: LoginService) {
    this.loginService.account.subscribe(res => {
      this.account = res;
    });
  }

  socket: Subject<MessageEvent>;
  private ws: WebSocket;
  private pingInterval: Subscription;
  private authInterval: Subscription;

  private authOptions: any = {};

  public connect(url, refresh: boolean = false, authOptions = {}): Subject<MessageEvent> {
    this.authOptions = authOptions;
    if (!this.socket || refresh) {
      if (this.socket != null) {
        this.socket.complete();
        this.socket = null;
      }
      this.socket = this.create(url);
    }

    return this.socket;
  }

  private create(url): Subject<MessageEvent> {
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

    const observable = Observable.create((obs: Observer<MessageEvent>) => {
      // this.ws.onopen = this.authenticate.bind(this);
      this.ws.onmessage = obs.next.bind(obs);
      this.ws.onerror = obs.error.bind(obs);
      this.ws.onclose = obs.complete.bind(obs);

      return this.ws.close.bind(this.ws);
    });
    const observer = {
      next: (evt: MessageEvent) => {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(evt.data));
        }
      },
    };
    return Subject.create(observer, observable);
  }

  private ping() {
    this.socket.next(new MessageEvent("ping", {data: new WSMessage("PING", {})}));
  }

  authenticate() {
    if (this.socket != null && this.ws != null && this.ws.readyState === WebSocket.OPEN) {
      this.authInterval.unsubscribe();
      this.socket.next(new MessageEvent("message", {
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
