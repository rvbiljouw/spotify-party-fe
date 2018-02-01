import {
  AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild,
  ViewContainerRef
} from '@angular/core';
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
import {SpotifyDevice} from "app/models/SpotifyDevice";
import {SpotifyService} from "../../services/SpotifyService";
import {YouTubeService} from "../../services/YouTubeService";
import {Song} from "../../models/Song";
import {Overlay, OverlayConfig, OverlayRef} from "@angular/cdk/overlay";
import {CdkPortal} from "@angular/cdk/portal";
import {FavouriteService, FavouriteSongRequest} from "../../services/FavouriteService";
import {FavouriteSong, SongType} from "../../models/FavouriteSong";
import {Observable} from "rxjs/Observable";
import {PartyChatComponent} from "../../widgets/PartyChat";


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
  searchingFavourites = false;

  @ViewChild('searchTemplate') searchTemplate: CdkPortal;
  searchOverlayRef: OverlayRef;

  socketSubscription: Subscription;
  viewChat: boolean = true;

  favourites = new Map<string, FavouriteSong>();
  favouriting: boolean;

  constructor(private router: Router,
              private partyService: PartyService,
              private notificationsService: NotificationsService,
              private queueService: QueueService,
              private route: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private favouriteService: FavouriteService,
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
        this.searching = true;
        this.setSongsPage({limit: this.songsLimit, offset: 0});
      });
  }

  setSearchFavourites(searchingFavourites: boolean) {
    this.searchingFavourites = searchingFavourites;

    this.setSongsPage({limit: this.songsLimit, offset: 0})
  }

  setSongsPage(nextPage: any) {
    this.searchingSongs = true;

    if (this.searchingFavourites) {
      const filters: Array<Filter> = [
        new Filter(FilterType.OR, null, null, [
          new Filter(FilterType.STARTS_WITH, 'artist', this.searchTerm.value),
          new Filter(FilterType.STARTS_WITH, 'title', this.searchTerm.value),
        ]),
        new Filter(FilterType.EQUALS, 'type', this.party.type),
      ];

      this.favouriteService.search(filters, nextPage.limit, nextPage.offset).subscribe(
        result => {
          this.songs = new ListResponse(result.items.map(favouriteSong =>
            new Song(favouriteSong.songId, favouriteSong.artist, favouriteSong.title,
              favouriteSong.album, favouriteSong.uri, favouriteSong.thumbnail, favouriteSong.duration,
              favouriteSong.uploadedBy)
          ), result.maxRecords, result.offset);
          this.searchingSongs = false;
        },
        err => {
          console.log(err);
          this.searchingSongs = false;
          this.notificationsService.error('Unable to search songs');
        },
      );
    } else {

      if (this.party.type == 'SPOTIFY') {
        const filters: Array<Filter> = [
          new Filter(FilterType.OR, null, null, [
            new Filter(FilterType.STARTS_WITH, 'ARTIST', this.searchTerm.value),
            new Filter(FilterType.STARTS_WITH, 'TRACK', this.searchTerm.value),
          ]),
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
    this.socketSubscription.unsubscribe();
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

      this.socketSubscription = this.webSocketService.input.subscribe((next) => {
        if (next == null) {
          return;
        }

        const wsMessage = JSON.parse(next.data) as WSMessage;
        console.log(wsMessage);
        switch (wsMessage.opcode) {
          case "AUTH":
            const success = wsMessage.body === 'true';
            if (success) {
              this.webSocketService.output.next(new MessageEvent("chat", {data: new WSMessage("VIEW_PARTY", this.party.id)}));
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

      this.queueService.getQueue(this.party).subscribe(res => {
        this.queue = res;

        this.queueService.getHistory(this.party, 25, 0).subscribe(res => {
          this.history = res;

          this.updateFavourites(
            [].concat(
              this.history.items.map(entry => entry.songId),
              this.queue.entries.map(entry => entry.songId),
              this.queue.nowPlaying != null ? [this.queue.nowPlaying.songId] : []
            )
            , true);
        });

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

  getThumbnail(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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


  vote(entry: PartyQueueEntry, up: boolean, voteToSkip: boolean) {
    let voteReq = new VoteRequest();
    voteReq.id = entry.id;
    voteReq.up = up;
    voteReq.voteToSkip = voteToSkip;
    this.queueService.voteSong(this.party, voteReq).subscribe(res => {
      this.notificationsService.info('Your vote has been counted.');
    }, err => {
      this.notificationsService.error('Sorry, we couldn\'t process your vote... please try again later.');
    });
  }

  setSearching(searching: boolean) {
    const body = document.getElementsByTagName('body')[0];
    if (!searching && this.searchOverlayRef != null) {
      this.searchOverlayRef.detach();
      this.searching = false;
    } else if (searching && !this.searching) { // ceck its not already pen
      let strategy = this.overlay.position()
        .global()
        .width("100%")
        .height((window.innerHeight - 70) + "px")
        .top("64px");

      let config = new OverlayConfig({positionStrategy: strategy});
      this.searchOverlayRef = this.overlay.create(config);
      this.searchOverlayRef.attach(this.searchTemplate);
      this.searching = true;
    }
  }

  updateFavourites(songIds: string[], deleteFromMap: boolean): Observable<ListResponse<FavouriteSong>> {
    if (songIds != null && songIds.length > 0) {
      const result = this.favouriteService.search(
        [new Filter(FilterType.IN, "songId", songIds)]
      );

      result.subscribe(res => {
        songIds.forEach(songId => {
          const favouriteSong = res.items.find(favourite => favourite.songId === songId);

          this.favourites.set(songId, favouriteSong);
        });

        if (deleteFromMap) {
          let toDelete = [];
          this.favourites.forEach((_, songId) => {
            if (songIds.find(reqSongId => reqSongId === songId) == null) {
              toDelete = toDelete.concat([songId]);
            }
          });

          toDelete.forEach(songId => this.favourites.delete(songId));
        }
      });

      return result;
    }

    return Observable.of(new ListResponse([], 0, 0));
  }

  onFavouriteDelete(song: Song) {
    const favourited = this.isFavourited(song.id);

    const req = new FavouriteSongRequest(this.party.type as SongType, song.id, song.artist,
      song.title, song.uri, song.thumbnail, song.duration, song.thumbnail, song.uploadedBy);

    this.setFavourited(favourited, req);
  }

  onSetFavourited(entry: PartyQueueEntry) {
    const favourited = this.isFavourited(entry.songId);

    const req = new FavouriteSongRequest(this.party.type as SongType, entry.songId, entry.artist,
      entry.title, entry.uri, entry.thumbnail, entry.duration, entry.thumbnail, entry.uploadedBy);

    this.setFavourited(favourited, req);
  }

  setFavourited(favourited: boolean, req: FavouriteSongRequest) {
    this.favouriting = true;
    let result = null;
    if (!favourited) {
      result = this.favouriteService.favouriteSong(req);
    } else {
      const favouriteSong = this.favourites.get(req.songId);
      if (favouriteSong != null) {
        result = this.favouriteService.delete(favouriteSong.id);
      } else {
        this.notificationsService.info("Song not in favourites");
      }
    }

    result.subscribe(res => {
      this.favouriting = false;

      this.updateFavourites([req.songId], false).subscribe(res => {
        if (favourited) {
          this.notificationsService.success("Song removed from favourites");
        } else {
          this.notificationsService.success("Song added to favourites");
        }

        if (this.searching) {
          this.setSongsPage({limit: this.songsLimit, offset: this.songsOffset});
        }
      });
    }, err => {
      console.log(err);
      this.favouriting = false;

      this.updateFavourites([req.songId], false).subscribe(res => {
        if (favourited) {
          this.notificationsService.info("Unable to remove song from favourites");
        } else {
          this.notificationsService.error("Unable to add song to favourites");
        }

        if (this.searching) {
          this.setSongsPage({limit: this.songsLimit, offset: this.songsOffset});
        }
      });
    });
  }

  isFavourited(songId: string): boolean {
    return this.favourites.get(songId) != null;
  }

}
