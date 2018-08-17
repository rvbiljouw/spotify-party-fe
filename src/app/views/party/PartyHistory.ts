import {DomSanitizer} from "@angular/platform-browser";
import {NotificationsService} from "angular2-notifications";
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {Party} from "../../models/Party";
import {FavouriteSong} from "../../models/FavouriteSong";
import {FavouriteService} from "../../services/FavouriteService";
import {QueueService, VoteRequest} from "../../services/QueueService";
import {ListResponse} from "../../services/ApiService";
import {PartyQueueEntry} from "../../models/PartyQueue";

@Component({
  selector: 'app-party-history',
  templateUrl: './PartyHistory.html',
  styleUrls: ['./PartyHistory.scss']
})
export class PartyHistoryComponent implements OnInit, OnDestroy {


  @Input() party: Party;
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

  formatEntryTitle(entry: PartyQueueEntry) {
    return this.sanitize(`${entry.artist} - ${entry.title}`);
  }

  sanitize(word: string) {
    return this.sanitizer.bypassSecurityTrustHtml(word);
  }
}
