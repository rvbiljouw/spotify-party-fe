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
import {LoginToken} from "../models/LoginToken";
import {Party} from "../models/Party";
import {PartyService} from "./PartyService";
import {environment} from "../../environments/environment";
import {NotificationsService} from "angular2-notifications";

@Injectable()
export class WebSocketService {
  private handlers = {
    "AUTH_RESPONSE": [(e: MessageEnvelope) => this.onAuthResponse(e)]
  };
  private account: UserAccount;
  private token: LoginToken;

  private authenticating: boolean = false;
  private authenticated: boolean = false;

  input: BehaviorSubject<MessageEvent> = new BehaviorSubject(null);
  output: BehaviorSubject<MessageEvent> = new BehaviorSubject(null);
  connected: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private awaitingAuth = [];
  private ws: WebSocket;

  private pingInterval: Subscription;

  private connectionErrorNotice: any;

  constructor(private loginService: LoginService,
              private notificationsService: NotificationsService) {
    this.loginService.token.subscribe(res => {
      this.token = res;
      if (res != null) {
        this.account = res.account;
        this.sendAuthRequest();
      }
    });

    this.input.subscribe(r => {
      if (r != null) {
        this.handleMessage(JSON.parse(r.data) as MessageEnvelope)
      }
    });


    this.output.subscribe(msg => {
      if (msg != null && this.ws != null && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(msg.data));
      }
    });

    this.pingInterval = IntervalObservable.create(5000).subscribe(res => {
      this.output.next(new MessageEvent("ping", {data: new WSMessage("PING", {})}));
    });

    this.connected.subscribe(res => {
      if (this.token != null) {
        this.sendAuthRequest();
      }
    });
  }

  private connect(url, refresh: boolean = false) {
    if (!this.ws || refresh) {
      this.create(url);
    }
  }

  private create(url) {
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(url);

    this.ws.onmessage = (msg) => {
      if (msg != null) {
        this.input.next(msg);
      }
    };

    this.ws.onclose = (msg) => {
      this.connected.next(false);
      this.authenticated = false;

      console.log("Socket disconnected - reconnecting in 5s");
      setTimeout(() => {
        if (this.connectionErrorNotice == null || this.connectionErrorNotice.destroyedAt != null) {
          this.connectionErrorNotice = this.notificationsService.error('Uh-oh!', "We're having some issues connecting you to the party. Reconnecting in 5 seconds.", {timeOut: 0});
        }
        this.create(url);
      }, 5000);
    };

    this.ws.onopen = (msg) => {
      this.connected.next(true);
      if (this.connectionErrorNotice != null) {
        this.notificationsService.remove(this.connectionErrorNotice.id);
        this.connectionErrorNotice = null;
        this.notificationsService.info('Success!', "You are now connected to Awsum.io");
      }
    };
  }

  private handleMessage(envelope: MessageEnvelope) {
    if (this.handlers[envelope.opcode]) {
      this.handlers[envelope.opcode].forEach(handler => {
        handler(envelope);
      });
    } else {
      console.log("No handler registered for " + envelope.opcode);
      console.log(JSON.stringify(envelope));
    }
  }

  private sendMessage(envelope: MessageEnvelope) {
    this.output.next(new MessageEvent(envelope.opcode, {data: envelope}));
  }

  init() {
    this.connect(`${environment.wsHost}/api/v1/socket`, true);
  }

  postEnvelope(opcode: string, message: any) {
    let msg = new MessageEnvelope(opcode, message);
    if (!this.authenticated) {
      this.awaitingAuth.push(msg);
    } else {
      this.sendMessage(msg);
    }
  }

  sendAuthRequest() {
    if (!this.authenticated && !this.authenticating && this.connected.value) {
      this.authenticating = true;
      this.sendMessage(new MessageEnvelope("AUTH_REQUEST", {accountId: this.account.id, loginToken: this.token.token}));
    }
  }

  sendJoinPartyRequest(partyId: number) {
    let msg = new MessageEnvelope("JOIN_PARTY_REQUEST", {partyId: partyId});
    if (!this.authenticated) {
      this.awaitingAuth.push(msg);
    } else {
      this.sendMessage(msg);
    }
  }

  onAuthResponse(envelope: MessageEnvelope) {
    let authResponse = JSON.parse(envelope.body);
    if (authResponse.success) {
      console.log("Authentication succeeded.");
      this.authenticated = true;
      this.authenticating = false;

      this.awaitingAuth.forEach(msg => {
        this.sendMessage(msg);
      });
      this.awaitingAuth = [];
    } else {
      console.log("Authentication failed.");
      this.awaitingAuth = [];
      this.authenticated = false;
      this.authenticating = false;
    }
  }

  registerHandler(opcode: string, handler: any) {
    if (!this.handlers[opcode]) {
      this.handlers[opcode] = [];
    }
    this.handlers[opcode].push(handler);
  }

  unregisterHandler(opcode: string, handler: any) {
    let idx = this.handlers[opcode].indexOf(handler);
    this.handlers[opcode].splice(idx, 1);
  }

  isAuthenticated() {
    return this.authenticated;
  }

}

export class MessageEnvelope {
  opcode: string;
  body: string;

  constructor(opcode: string, body: any) {
    this.opcode = opcode;
    this.body = (typeof body === 'object') ? JSON.stringify(body) : `${body}`;
  }
}
