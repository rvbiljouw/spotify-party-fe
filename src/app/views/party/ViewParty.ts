import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl,} from '@angular/forms';
import {routerTransition} from '../../utils/Animations';
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
import {NotificationsService} from "angular2-notifications";
import {debounce} from 'lodash';
import {EmojiPickerOptions} from "angular2-emoji-picker/lib-dist";
import {EmojiPickerAppleSheetLocator} from "angular2-emoji-picker/lib-dist/sheets/sheet_apple_map";
import {EmojiEvent} from "angular2-emoji-picker/lib-dist/lib/emoji-event";

@Component({
  selector: 'view-party',
  templateUrl: './ViewParty.html',
  styleUrls: ['./ViewParty.scss'],
  animations: [routerTransition(),
  ],
})
export class ViewPartyComponent implements OnInit, OnDestroy {

  formatMentionOption = (member: UserAccount) => {
    this.setLastMentionInputTime(Date.now());
    return `@${member.displayName} `;
  };

  party: Party;
  partyMembers: UserAccount[];
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

  mentionConfig = {
    labelKey: "displayName",
    maxItems: 5,
    disableSearch: false,
    triggerChar: '@',
    mentionSelect: this.formatMentionOption,
  };

  lastMentionInput = 0;

  emojiPickerToggled = false;

  chatInputModel = '';

  constructor(private router: Router,
              private partyService: PartyService,
              private notificationsService: NotificationsService ,
              private queueService: QueueService,
              private route: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private webSocketService: WebSocketService,
              private loginService: LoginService,
              private dialog: MatDialog,
              private media: ObservableMedia,
              private emojiPickerOptions: EmojiPickerOptions,
              fb: FormBuilder) {
    this.emojiPickerOptions.setEmojiSheet({
      url: 'sheet_apple_32.png',
      locator: EmojiPickerAppleSheetLocator
    });
  }

  ngOnInit() {
    if ("Notification" in window) {
      Notification.requestPermission().then(function (result) {
        console.log(result);
      });
    }

    this.isMobileView = this.media.isActive('xs') || this.media.isActive('sm');

    this.media.subscribe((change: MediaChange) => {
      this.isMobileView = change.mqAlias === 'xs' || change.mqAlias === 'sm';
    });

    this.route.params.subscribe(params => {
      this.partyService.joinParty(+params["id"]).subscribe(party => {
        this.partyType = party.type;

        this.webSocketService.connect(`${environment.wsHost}/api/v1/partySocket`, true, {
          partyId: party.id,
        });

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
  }

  ngOnDestroy() {
    this.refreshTimer.unsubscribe();
    this.progressTimer.unsubscribe();
    this.lastMentionInput = 0;
    this.partyMembers = null;
    this.messages = [];
    this.queue = new PartyQueue();
    this.history = new ListResponse([], 0, 0);
    this.partyName = "Connecting...";
    this.websocketAuthenticated = false;
    this.partyType = "SPOTIFY";
    this.admin = false;
    this.largeYtPlayer = false;
    console.log("Destroyed");
  }

  handleEmojiSelection(event: EmojiEvent) {
    this.chatInputModel = `${this.chatInputModel} :${event.label}:`;
    this.chatInput.nativeElement.focus();
  }

  onChatInput(event) {
    this.chatInputModel = event;
  }

  onMentionInput(text) {
    this.setLastMentionInputTime(Date.now());
  }

  join(id: number, reconnect: boolean = false) {
    this.partyService.joinParty(id, reconnect).subscribe(party => {
      this.loginService.account.subscribe(acc => {
        this.account = acc;
        this.admin = party.owner.id == acc.id;
        this.showNoSpotify = party.type == 'SPOTIFY' && !acc.hasSpotify
      });

      this.party = party;
      this.partyMembers = party.members.map(m => m.account).filter(a => a.id !== this.account.id);

      this.partyName = this.party.name;

      this.notificationsService.info('Active party changed to ' + party.name);
      this.refresh();

      this.webSocketService.socket.subscribe((next) => {
        const wsMessage = JSON.parse(next.data) as WSMessage;
        switch (wsMessage.opcode) {
          case "AUTH":
            const success = wsMessage.body === 'true';
            if (success) {
              this.webSocketService.socket.next(new MessageEvent("chat", {data: new WSMessage("VIEW_PARTY", this.party.id)}));
              this.websocketAuthenticated = true;
            } else {
              this.webSocketService.authenticate();
            }
            break;
          case "CHAT_MSG":
            const messageEvent = JSON.parse(wsMessage.body) as ChatMessage;

            this.addChatMessage(messageEvent, false);
            break;
          case "CHAT_MSGS":
            const messageEvents = JSON.parse(wsMessage.body) as ChatMessage[];

            messageEvents.forEach(event => this.addChatMessage(event, true));
            break;

          case "PARTY_UPDATE":
            this.refreshParty();
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
            break;
        }
      });
    });
  }

  private playYoutube(uri: string, position: number) {
    this.youtubeFrame.play(uri, position / 1000);
  }

  addChatMessage(message: ChatMessage, isBulk: boolean) {
    if (this.messages.length > 100) {
      this.messages.slice(1);
    }

    let _messageText = message.message;
    let users = [];
    while (_messageText.indexOf('@') !== -1 && users.indexOf(this.account.displayName) === -1) {
      const user = this.getUserMentioned(_messageText);
      users = users.concat(user);

      _messageText = _messageText.replace(`@${user}`, "");
    }

    if (users.indexOf(this.account.displayName) !== -1) {
      if (!isBulk) {
        this.spawnNotification(message.message, null, message.sender);
      }

      message.mentioningMe = true;
    }

    this.messages = this.messages.concat(message);
  }

  private spawnNotification(theBody,theIcon,theTitle) {
    const options = {
      body: theBody,
      icon: theIcon
    };

    if ("Notification" in window) {
      const n = new Notification(theTitle, options);
      setTimeout(n.close.bind(n), 3000);
    }
  }

  private getUserMentioned(message: string) {
    let user = message.substring(message.indexOf('@') + 1);
    if (user.indexOf(' ') !== -1) {
      user = user.substring(0, user.indexOf(' '));
    }

    return user.trim();
  }

  sendChatMessage = debounce((event) => {
    if (event != null && event.keyCode != 13) {
      return;
    }
    if (Date.now() - this.lastMentionInput < 500) {
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
        }));
        this.chatInput.nativeElement.value = "";
      }
    }
  }, 150);

  private refreshParty() {
    this.partyService.getById(this.party.id).subscribe(party => {
      this.loginService.account.subscribe(acc => {
        this.account = acc;
        this.admin = party.owner.id == acc.id;
        this.showNoSpotify = party.type == 'SPOTIFY' && !acc.hasSpotify
      });

      this.party = party;
      this.partyMembers = party.members.map(m => m.account).filter(a => a.id !== this.account.id);

      this.partyName = this.party.name;
    });
  }

  private refresh() {
    this.queueService.getHistory(this.party,25, 0).subscribe(res => {
      this.history = res;
    });

    this.queueService.getQueue(this.party).subscribe(res => {
      this.queue = res;
    }, err => {
      this.notificationsService.error("Couldn't retrieve queue for party.");
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

  getSenderColor(message: ChatMessage) {
    if (message.server) {
      return 'rgb(255, 87, 35)';
    } else if (message.owner) {
      return 'rgb(199, 60, 169)';
    } else if (message.staff) {
      return 'red';
    }
    return '#0075ad';
  }

  getMessageColor(message: ChatMessage) {
    if (message.server) {
      return '#b7b7b7';
    }

    return 'white';
  }

  getMessageStyle(message: ChatMessage) {
    if (message.server) {
      return 'italic';
    }

    return 'normal';
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
      this.notificationsService.info('You\'ve left the party.');
      this.router.navigate(['/parties']);
    }, err => {
      this.notificationsService.error('Couldn\'t leave to party - you\'re stuck here forever!');
    });
  }

  vote(entry: PartyQueueEntry, up: boolean) {
    let voteReq = new VoteRequest();
    voteReq.id = entry.id;
    voteReq.up = up;
    this.queueService.voteSong(this.party, voteReq).subscribe(res => {
      this.notificationsService.info('Your vote has been counted.');
    }, err => {
      this.notificationsService.error('Sorry, we couldn\'t process your vote... please try again later.');
    });
  }

  setLastMentionInputTime(time) {
    if (time > this.lastMentionInput) {
      this.lastMentionInput = time;
    }
  }

}
