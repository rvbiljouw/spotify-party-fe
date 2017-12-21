import {Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl,} from '@angular/forms';
import {routerTransition} from '../../utils/Animations';
import {PartyService} from "../../services/PartyService";
import {Party} from "../../models/Party";
import {PartyQueue, PartyQueueEntry} from "../../models/PartyQueue";
import {QueueService, VoteRequest} from "../../services/QueueService";
import {DomSanitizer, Title} from "@angular/platform-browser";
import {WebSocketService} from "../../services/WebSocketService";
import {environment} from "../../../environments/environment";
import {MatDialog, PageEvent} from "@angular/material";
import {WSMessage} from "../../models/WSMessage";
import {ChatMessage} from "../../models/ChatMessage";
import {IntervalObservable} from "rxjs/observable/IntervalObservable";
import {Subscription} from "rxjs/Subscription";
import {ManagePartyComponent} from "./ManageParty";
import {LoginService} from "../../services/LoginService";
import {UserAccount} from "../../models/UserAccount";
import {Filter, FilterType, ListResponse} from "../../services/ApiService";
import {YoutubePlayerComponent} from "../../widgets/YoutubePlayer";
import {MediaChange, ObservableMedia} from "@angular/flex-layout";
import {NotificationsService} from "angular2-notifications";
import {debounce} from 'lodash';
import {EmojiPickerOptions} from "angular2-emoji-picker/lib-dist";
import {EmojiPickerAppleSheetLocator} from "angular2-emoji-picker/lib-dist/sheets/sheet_apple_map";
import {EmojiEvent} from "angular2-emoji-picker/lib-dist/lib/emoji-event";
import {SpotifyDevice} from "app/models/SpotifyDevice";
import {SpotifyService} from "../../services/SpotifyService";
import {EmojifyPipe} from "angular-emojify";
import {SearchBarComponent} from "../../widgets/SearchBar";
import {YouTubeService} from "../../services/YouTubeService";
import {Song} from "../../models/Song";
import {Overlay, OverlayConfig, OverlayOrigin} from "@angular/cdk/overlay";
import {CdkPortal} from "@angular/cdk/portal";
import {OverlayRef} from "@angular/cdk/overlay";


@Component({
  selector: 'view-party',
  templateUrl: './ViewParty.html',
  styleUrls: ['./ViewParty.scss'],
  animations: [routerTransition(),
  ],
})
export class ViewPartyComponent implements OnInit, OnDestroy {
  party: Party;
  partyMembers: UserAccount[];
  queue: PartyQueue = new PartyQueue();
  history: ListResponse<PartyQueueEntry> = new ListResponse([], 0, 0);

  progress: number = 0;

  partyName: string = "Connecting...";

  websocketAuthenticated = false;

  showNoSpotify: boolean = false;

  @ViewChild(YoutubePlayerComponent) youtubeFrame: YoutubePlayerComponent;

  @ViewChild("searchBar") searchBar: SearchBarComponent;

  partyType: string = "SPOTIFY";

  refreshTimer: Subscription;
  progressTimer: Subscription;

  account: UserAccount;
  loggedIn: boolean = false;
  admin: boolean = false;

  isMobileView: boolean;
  largeYtPlayer: boolean;

  spotifyDevices: SpotifyDevice[];
  deviceTimer: Subscription;
  changingDevice: boolean;

  searching: boolean;

  searchTerm: FormControl = new FormControl('', []);

  pageSizeOptions = [5, 10, 20, 25, 100];

  songs: ListResponse<Song> = new ListResponse([], 0, 0);
  songsPageNumber = 0;
  songsLimit = 20;
  songsOffset = 0;
  searchingSongs = false;

  @ViewChild('searchTemplate') searchTemplate: CdkPortal;
  searchOverlayRef: OverlayRef;


  constructor(private router: Router,
              private partyService: PartyService,
              private notificationsService: NotificationsService,
              private queueService: QueueService,
              private route: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private webSocketService: WebSocketService,
              private loginService: LoginService,
              private dialog: MatDialog,
              private media: ObservableMedia,
              private spotifyService: SpotifyService,
              private emojiPickerOptions: EmojiPickerOptions,
              private youtubeService: YouTubeService,
              private titleService: Title,
              public overlay: Overlay,
              public viewContainerRef: ViewContainerRef,
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

    this.loginService.account.subscribe(acc => {
      this.account = acc;
      this.loggedIn = acc != null;
    });

    this.isMobileView = this.media.isActive('xs') || this.media.isActive('sm');

    this.media.subscribe((change: MediaChange) => {
      this.isMobileView = change.mqAlias === 'xs' || change.mqAlias === 'sm';
    });

    this.route.params.subscribe(params => {
      this.resetParty();
      this.partyService.joinParty(+params["id"]).subscribe(party => {
        this.partyType = party.type;

        this.webSocketService.connect(`${environment.wsHost}/api/v1/partySocket`, true, {
          partyId: party.id,
        });

        this.party = party;

        this.join(this.party.id, this.party.type == 'YOUTUBE');
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

    this.refreshDevices();
    this.deviceTimer = IntervalObservable.create(5000).subscribe(next => {
      this.refreshDevices();
    });


    this.searchTerm.valueChanges
      .debounceTime(400)
      .distinctUntilChanged()
      .subscribe(term => {
        if (term.length > 0) {
          this.searching = true;
          this.setSongsPage({limit: this.songsLimit, offset: 0});
        }
      });
  }


  setSongsPage(nextPage: any) {
    this.searchingSongs = true;

    if (this.party.type == 'SPOTIFY') {

      const filters: Array<Filter> = [
        new Filter(FilterType.OR, null, null, [
          new Filter(FilterType.STARTS_WITH, 'ARTIST', this.searchTerm.value),
          new Filter(FilterType.STARTS_WITH, 'TRACK', this.searchTerm.value),
        ])
      ];

      this.spotifyService.searchSongs(filters, nextPage.limit, nextPage.offset).subscribe(
        result => {
          this.songs = result;
          this.searchingSongs = false;
        },
        err => {
          console.log(err);
          this.searchingSongs = false;
          this.notificationsService.error('Unable to search songs');
        },
      );
    } else if (this.party.type == 'YOUTUBE') {

      const filters: Array<Filter> = [
        new Filter(FilterType.STARTS_WITH, 'TRACK', this.searchTerm.value)
      ];

      this.youtubeService.searchSongs(filters, nextPage.limit, nextPage.offset).subscribe(
        result => {
          this.songs = result;
          this.searchingSongs = false;
        },
        err => {
          console.log(err);
          this.searchingSongs = false;
          this.notificationsService.error('Unable to search songs');
        },
      );
    }
  }

  onSongsPageEvent(pageEvent: PageEvent) {
    this.songsPageNumber = pageEvent.pageIndex;
    this.songsLimit = pageEvent.pageSize;
    this.songsOffset = pageEvent.pageIndex * pageEvent.pageSize;

    this.setSongsPage({limit: this.songsLimit, offset: this.songsOffset});
  }

  ngOnDestroy() {
    this.refreshTimer.unsubscribe();
    this.progressTimer.unsubscribe();
    this.resetParty();
    console.log("Destroyed");
  }

  private resetParty() {
    if (this.deviceTimer != null) {
      this.deviceTimer.unsubscribe();
    }
    this.partyMembers = null;
    this.queue = new PartyQueue();
    this.history = new ListResponse([], 0, 0);
    this.partyName = "Connecting...";
    this.websocketAuthenticated = false;
    this.partyType = "SPOTIFY";
    this.admin = false;
    this.largeYtPlayer = false;
    this.webSocketService.disconnect();
  }

  changeDevice(device: SpotifyDevice) {
    this.changingDevice = true;

    if (device.id !== this.account.spotify.device) {
      this.spotifyService.updateAccount({device: device.id}).subscribe(res => {
        this.notificationsService.success(`Output device changed to ${device.name}`);
        this.refreshDevices();
      }, err => {
        console.log(err);
        this.notificationsService.error("Unable to change output device");
        this.refreshDevices();
      })
    } else {
      this.refreshDevices();
    }
  }

  getDeviceName(id: string) {
    if (this.spotifyDevices != null) {
      const device = this.spotifyDevices.find(device => device.id === id);
      if (device != null) {
        return device.name;
      }
    }

    return null;
  }

  refreshDevices() {
    if (this.account != null && this.account.hasSpotify) {
      this.spotifyService.getDevices().subscribe(devices => {
        this.spotifyDevices = devices;
        this.changingDevice = false;
      }, err => {
        console.log(err);
        this.changingDevice = false;
      });
    }
  }

  getRemainingToSkipMessage() {
    const required = Math.ceil(this.party.activeMemberCount / 2);
    const diff = required - this.queue.nowPlaying.votesToSkip;
    if (isNaN(diff)) {
      return "";
    }

    if (diff <= 0) {
      return "No more votes required, skipping...";
    }

    if (diff === 1) {
      return `(${diff} more vote is required to skip)`;
    } else {
      return `(${diff} more votes are required to skip)`;
    }
  }

  join(id: number, reconnect: boolean = false) {
    this.partyService.joinParty(id, reconnect).subscribe(party => {
      console.log(party);
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

      this.webSocketService.socket.share().subscribe((next) => {
        const wsMessage = JSON.parse(next.data) as WSMessage;
        console.log(wsMessage);
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
    if (this.party != null && (this.partyType === 'YOUTUBE' || this.account.hasSpotify)) {
      this.queueService.getHistory(this.party, 25, 0).subscribe(res => {
        this.history = res;
      });

      this.queueService.getQueue(this.party).subscribe(res => {
        this.queue = res;
        if (this.queue != null) {
          const nowPlaying = this.queue.nowPlaying;
          if (nowPlaying != null) {
            this.titleService.setTitle(`${nowPlaying.title} - ${nowPlaying.artist} -- ${this.partyName}`);
          } else {
            this.titleService.setTitle(`${this.partyName}`);
          }
        }
      }, err => {
        this.notificationsService.error("Couldn't retrieve queue for party.");
      });
    }
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

  leave(remove: boolean) {
    this.partyService.leaveParty(this.party.id, remove).subscribe(res => {
      this.notificationsService.info('You\'ve left the party.');
      this.router.navigate(['/parties']);
    }, err => {
      this.notificationsService.error('Couldn\'t leave to party - you\'re stuck here forever!');
    });
  }

  setSearching(searching: boolean) {
    const body = document.getElementsByTagName('body')[0];
    this.searching = searching;
    if (!searching) {
      this.searchOverlayRef.detach();
    } else {
      let strategy = this.overlay.position()
        .global()
        .width("100%")
        .height((window.innerHeight - 70) + "px")
        .top("70px");

      let config = new OverlayConfig({positionStrategy: strategy});
      this.searchOverlayRef = this.overlay.create(config);
      this.searchOverlayRef.attach(this.searchTemplate);
    }
  }

}
