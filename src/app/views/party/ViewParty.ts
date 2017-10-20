import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl,} from '@angular/forms';
import {routerTransition} from '../../utils/Animations';
import {ToastyService} from 'ng2-toasty';
import {PartyService} from "../../services/PartyService";
import {Party} from "../../models/Party";
import {PartyQueue} from "../../models/PartyQueue";
import {QueueService} from "../../services/QueueService";
import {WebSocketService} from "../../services/WebSocketService";
import {environment} from "../../../environments/environment";
import {MatInput} from "@angular/material";
import {WSMessage} from "../../models/WSMessage";
import {ChatMessage} from "../../models/ChatMessage";

@Component({
  selector: 'view-party',
  templateUrl: './ViewParty.html',
  styleUrls: ['./ViewParty.scss'],
  animations: [routerTransition()],
})
export class ViewPartyComponent implements OnInit {
  party: Party;
  queue: PartyQueue;

  websocketAuthenticated = false;
  messages: ChatMessage[] = [];

  @ViewChild("chatInput") chatInput: ElementRef;

  constructor(private router: Router,
              private partyService: PartyService,
              private toastyService: ToastyService,
              private queueService: QueueService,
              private route: ActivatedRoute,
              private webSocketService: WebSocketService,
              fb: FormBuilder,) {
  }

  ngOnInit() {
    this.webSocketService.connect(`${environment.wsHost}/api/v1/partySocket`, true);

    this.route.params.subscribe(params => {
      this.partyService.joinParty(+params["id"]).subscribe(party => {
        this.party = party;

        this.webSocketService.socket.subscribe((next) => {
          const wsMessage = JSON.parse(next.data) as WSMessage;
          switch(wsMessage.opcode) {
            case "AUTH":
              const success = wsMessage.body === 'true';
              if (success) {
                this.webSocketService.socket.next(new MessageEvent("chat", {data: new WSMessage("VIEW_PARTY", this.party.id)}));
                this.websocketAuthenticated = true;
              }
              break;
            case "CHAT_MSG":
              const messageEvent = JSON.parse(wsMessage.body) as ChatMessage;

              this.addChatMessage(messageEvent);
              break;
            case "CHAT_MSGS":
              const messageEvents = JSON.parse(wsMessage.body) as ChatMessage[];

              messageEvents.forEach(event => this.addChatMessage(event));
              break;
          }
        });
      });
    });

    setInterval(() => {
      this.refresh();
    }, 10000);
    this.refresh();
  }

  addChatMessage(message: ChatMessage) {
    if (this.messages.length > 100) {
      this.messages.slice(1);
    }

    this.messages = this.messages.concat(message);
  }

  sendChatMessage(event) {
    if (event != null && event.keyCode != 13) {
      return;
    }

    const message = this.chatInput.nativeElement.value;
    if (message != null) {
      const trimmed = message.trim();
      if (trimmed.length > 0) {
        this.webSocketService.socket.next(new MessageEvent("chat", {data: new WSMessage("CHAT", {message: message, partyId: this.party.id})}))
        this.chatInput.nativeElement.value = "";
      }
    }
  }

  private refresh() {
    this.queueService.getQueue().subscribe(res => {
      this.queue = res;
    }, err => {
      this.toastyService.error("Couldn't retrieve queue for party.");
    });
  }

  getState() {
    return this.route.data['state'];
  }

  getMessageColor(message: ChatMessage) {
    if (message.isServer) {
      return 'rgb(98, 71, 103)';
    } else if (message.isOwner) {
      return 'rgb(199, 60, 169)';
    } else if (message.isStaff) {
      return 'red';
    }
    return '#0075ad';
  }
}
