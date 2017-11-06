import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import {WSMessage} from "../models/WSMessage";
import {UserAccountService} from "./UserAccountService";
import {UserAccount} from "../models/UserAccount";
import {LoginService} from "./LoginService";

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
  private pingInterval: any = -1;
  private authTimeout: any = -1;

  public connect(url, refresh: boolean = false): Subject<MessageEvent> {
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
    this.ws = new WebSocket(url);

    if (this.pingInterval >= 0) {
      clearInterval(this.pingInterval);
    }
    if (this.authTimeout >= 0) {
      clearTimeout(this.authTimeout);
    }

    this.pingInterval = setInterval(this.ping.bind(this), 5000);
    this.authTimeout = setTimeout(this.authenticate.bind(this), 1000);

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
          console.log(evt.data)
          this.ws.send(JSON.stringify(evt.data));
        }
      },
    };
    return Subject.create(observer, observable);
  }

  private ping() {
    this.socket.next(new MessageEvent("ping", {data: new WSMessage("PING", {})}));
  }

  private authenticate() {
    if (this.socket == null || this.ws == null || this.ws.readyState !== WebSocket.OPEN) {
      this.authTimeout = setTimeout(this.authenticate.bind(this), 1000);
    } else {
      this.socket.next(new MessageEvent("message", {
        data: new WSMessage("AUTH", {
          userId: this.account.id,
          loginToken: this.account.loginToken.token
        })
      }));
    }
  }
}
