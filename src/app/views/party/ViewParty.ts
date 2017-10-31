import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl,} from '@angular/forms';
import {routerTransition} from '../../utils/Animations';
import {ToastyService} from 'ng2-toasty';
import {PartyService} from "../../services/PartyService";
import {Party} from "../../models/Party";
import {PartyQueue, PartyQueueEntry} from "../../models/PartyQueue";
import {QueueService, VoteRequest} from "../../services/QueueService";
import {DomSanitizer} from "@angular/platform-browser";
import {WebSocketService} from "../../services/WebSocketService";
import {environment} from "../../../environments/environment";
import {MatDialog, MatInput} from "@angular/material";
import {WSMessage} from "../../models/WSMessage";
import {ChatMessage} from "../../models/ChatMessage";
import {IntervalObservable} from "rxjs/observable/IntervalObservable";
import {Subscription} from "rxjs/Subscription";
import {ManagePartyComponent} from "./ManageParty";
import {LoginService} from "../../services/LoginService";
import {UserAccount} from "../../models/UserAccount";
import {ListResponse} from "../../services/ApiService";

@Component({
  selector: 'view-party',
  templateUrl: './ViewParty.html',
  styleUrls: ['./ViewParty.scss'],
  animations: [routerTransition(),
  ],
})
export class ViewPartyComponent implements OnInit, OnDestroy {
  party: Party;
  queue: PartyQueue;
  history: ListResponse<PartyQueueEntry> = new ListResponse([], 0, 0);

  progress: number = 0;

  partyName: string = "Connecting...";

  websocketAuthenticated = false;
  messages: ChatMessage[] = [];

  @ViewChild("chatInput") chatInput: ElementRef;

  refreshTimer: Subscription;
  progressTimer: Subscription;

  account: UserAccount;
  admin: boolean = false;

  constructor(private router: Router,
              private partyService: PartyService,
              private toastyService: ToastyService,
              private queueService: QueueService,
              private route: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private webSocketService: WebSocketService,
              private loginService: LoginService,
              private dialog: MatDialog,
              fb: FormBuilder) {
  }

  ngOnInit() {
    this.webSocketService.connect(`${environment.wsHost}/api/v1/partySocket`, true);

    this.route.params.subscribe(params => {
      this.partyService.joinParty(+params["id"]).subscribe(party => {
        this.loginService.account.subscribe(acc => {
          this.account = acc;
          this.admin = party.owner.id == acc.id;
        });

        this.party = party;
        this.partyName = this.party.name;

        this.toastyService.info('Active party changed to ' + party.name);
        this.refresh();

        this.webSocketService.socket.subscribe((next) => {
          const wsMessage = JSON.parse(next.data) as WSMessage;
          switch (wsMessage.opcode) {
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

            case "QUEUE_UPDATE":
              this.refresh();
              break;

            default:
              console.log(wsMessage);
              break;
          }
        });
      });
    });

    this.refreshTimer = IntervalObservable.create(10000).subscribe(res => {
      this.refresh();
    });
    this.progressTimer = IntervalObservable.create(1000).subscribe(res => {
      if (this.queue != null && this.queue.nowPlaying != null) {
        this.progress = this.calculateProgress(this.queue.nowPlaying);
      }
    });
    this.refresh();
  }

  ngOnDestroy() {
    this.refreshTimer.unsubscribe();
    this.progressTimer.unsubscribe();
    console.log("Destroyed");
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
        this.webSocketService.socket.next(new MessageEvent("chat", {
          data: new WSMessage("CHAT", {
            message: message,
            partyId: this.party.id
          })
        }))
        this.chatInput.nativeElement.value = "";
      }
    }
  }

  private refresh() {
    this.queueService.getHistory(25, 0).subscribe(res => {
      this.history = res;
    });

    this.queueService.getQueue().subscribe(res => {
      this.queue = res;
    }, err => {
      this.toastyService.error("Couldn't retrieve queue for party.");
    });
  }


  getArtistThumbnail(entry: PartyQueueEntry, style: boolean) {
    let thumbnail = 'http://via.placeholder.com/400x400';
    if (entry.thumbnail) {
      thumbnail = entry.thumbnail;
    }

    if (style) {
      return this.sanitizer.bypassSecurityTrustStyle(
        'url(' + thumbnail + ')',
      );
    } else {
      return this.sanitizer.bypassSecurityTrustResourceUrl(thumbnail);
    }
  }


  calculateProgress(entry: PartyQueueEntry) {
    let date = new Date();
    return ((date.getTime() - entry.playedAt) / entry.duration) * 100;
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

  openSettings() {
    let dialogRef = this.dialog.open(ManagePartyComponent, {
      height: '60%',
      width: '60%',
      data: {
        party: this.party
      }
    });
    dialogRef.afterClosed().subscribe(res => {
      this.partyService.refresh();
    })
  }

  leave() {
    this.partyService.leaveParty(this.party.id).subscribe(res => {
      this.toastyService.info('You\'ve left the party.');
      this.router.navigate(['/parties']);
    }, err => {
      this.toastyService.error('Couldn\'t leave to party - you\'re stuck here forever!');
    });
  }

  vote(entry: PartyQueueEntry, up: boolean) {
    let voteReq = new VoteRequest();
    voteReq.id = entry.id;
    voteReq.up = up;
    this.queueService.voteSong(voteReq).subscribe(res => {
      this.toastyService.info('Your vote has been counted.');
    }, err => {
      this.toastyService.error('Sorry, we couldn\'t process your vote... please try again later.');
    });
  }

}
