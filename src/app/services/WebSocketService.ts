import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class WebSocketService {
  public messages: Subject<any>;

  constructor() {}

  private socket: Subject<MessageEvent>;

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
    let ws = new WebSocket(url);
    let observable = Observable.create((obs: Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return ws.close.bind(ws);
    });
    let observer = {
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      },
    };
    return Subject.create(observer, observable);
  }
}
