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
import {YoutubePlayerComponent} from "../../widgets/YoutubePlayer";
import {MediaChange, ObservableMedia} from "@angular/flex-layout";

@Component({
  selector: 'view-party',
  templateUrl: './ViewParty.html',
  styleUrls: ['./ViewParty.scss'],
  animations: [routerTransition(),
  ],
})
export class ViewPartyComponent implements OnInit, OnDestroy {
  party: Party;
  queue: PartyQueue = new PartyQueue();
  history: ListResponse<PartyQueueEntry> = new ListResponse([], 0, 0);

  progress: number = 0;

  partyName: string = "Connecting...";

  websocketAuthenticated = false;
  messages: ChatMessage[] = [];

  showNoSpotify: boolean = false;

  @ViewChild("chatInput") chatInput: ElementRef;

  @ViewChild(YoutubePlayerComponent) youtubeFrame: YoutubePlayerComponent;

  partyType: string = "SPOTIFY";

  refreshTimer: Subscription;
  progressTimer: Subscription;

  account: UserAccount;
  admin: boolean = false;

  isMobileView: boolean;
  largeYtPlayer: boolean;

  constructor(private router: Router,
              private partyService: PartyService,
              private toastyService: ToastyService,
              private queueService: QueueService,
              private route: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private webSocketService: WebSocketService,
              private loginService: LoginService,
              private dialog: MatDialog,
              private media: ObservableMedia,
              fb: FormBuilder) {
  }

  ngOnInit() {
    this.isMobileView = this.media.isActive('xs') || this.media.isActive('sm');

    this.media.subscribe((change: MediaChange) => {
      this.isMobileView = change.mqAlias === 'xs' || change.mqAlias === 'sm';
    });

    this.webSocketService.connect(`${environment.wsHost}/api/v1/partySocket`, true);

    this.route.params.subscribe(params => {
      this.partyService.joinParty(+params["id"]).subscribe(party => {
        this.partyType = party.type;
        console.log(this.partyType);
        this.join(+params["id"], party.type == 'YOUTUBE');
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

  join(id: number, reconnect: boolean = false) {
    this.partyService.joinParty(id, reconnect).subscribe(party => {
      this.loginService.account.subscribe(acc => {
        this.account = acc;
        this.admin = party.owner.id == acc.id;
        this.showNoSpotify = party.type == 'SPOTIFY' && !acc.hasSpotify
      });

      this.party = party;
      this.partyName = this.party.name;

      this.toastyService.info('Active party changed to ' + party.name);
      this.refresh();

      this.webSocketService.socket.subscribe((next) => {
        const wsMessage = JSON.parse(next.data) as WSMessage;
        console.log(next.data);
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

          case "COMMAND":
            const command = JSON.parse(wsMessage.body);
            if (command.name == "PLAY") {
              if (this.party.type == "YOUTUBE") {
                this.playYoutube(command.params.uri, command.params.position);
              }
            }
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
  }

  private playYoutube(uri: string, position: number) {
    this.youtubeFrame.play(uri, position / 1000);
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
    if (entry != null && entry.thumbnail) {
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
