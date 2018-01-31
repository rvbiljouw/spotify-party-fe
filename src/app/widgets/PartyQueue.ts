import {PartyService} from "../services/PartyService";
import {DomSanitizer} from "@angular/platform-browser";
import {QueueService, VoteRequest} from "../services/QueueService";
import {NotificationsService} from "angular2-notifications";
import {Component, Input, OnDestroy, OnInit, SimpleChanges, EventEmitter, Output} from "@angular/core";
import {Party} from "../models/Party";
import {PartyQueue, PartyQueueEntry} from "../models/PartyQueue";
import {Filter, FilterType, ListResponse} from "../services/ApiService";
import {FavouriteSong} from "../models/FavouriteSong";
import {FavouriteService, FavouriteSongRequest} from "../services/FavouriteService";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-party-queue',
  templateUrl: './PartyQueue.html',
  styleUrls: ['./PartyQueue.scss']
})
export class PartyQueueComponent implements OnInit, OnDestroy {

  @Input() party: Party;
  @Input() queue: PartyQueue = new PartyQueue();
  @Input() history: ListResponse<PartyQueueEntry> = new ListResponse([], 0, 0);
  @Input() favourites = new Map<string, FavouriteSong>();
  @Input() favouriting = false;

  @Output() onFavourite: EventEmitter<PartyQueueEntry> = new EventEmitter();

  constructor(private notificationsService: NotificationsService,
              private favouriteService: FavouriteService,
              private queueService: QueueService,
              private sanitizer: DomSanitizer) {

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

  getBackgroundImage(url: string) {
    let thumbnail = 'http://via.placeholder.com/400x400';
    if (url != null) {
      thumbnail = url;
    }
    return this.sanitizer.bypassSecurityTrustStyle('url(' + thumbnail + ')');
  }

  onVote(voteReq: VoteRequest) {
    this.queueService.voteSong(this.party, voteReq).subscribe(res => {
      this.notificationsService.info('Your vote has been counted.');
    }, err => {
      this.notificationsService.error('Sorry, we couldn\'t process your vote... please try again later.');
    });
  }

  vote(entry: PartyQueueEntry, up: boolean, voteToSkip: boolean) {
    let voteReq = new VoteRequest();
    voteReq.id = entry.id;
    voteReq.up = up;
    voteReq.voteToSkip = voteToSkip;

    this.onVote(voteReq);
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  isFavourited(entry: PartyQueueEntry): boolean {
    return this.favourites.get(entry.songId) != null;
  }
}
