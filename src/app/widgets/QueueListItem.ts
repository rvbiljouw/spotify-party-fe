import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {QueueService, VoteRequest} from '../services/QueueService';
import {DomSanitizer} from '@angular/platform-browser';
import {MatDialog} from '@angular/material';
import { NotificationsService } from 'angular2-notifications';
import {PartyQueueEntry} from "../models/PartyQueue";
import {FavouriteSongRequest} from "../services/FavouriteService";

@Component({
  selector: 'app-queue-list-item',
  templateUrl: './QueueListItem.html',
  styleUrls: ['./QueueListItem.scss'],
})
export class QueueListItemComponent implements OnInit {
  @Input() entry: PartyQueueEntry;
  @Input() isFavourited: boolean;
  @Input() favouriting: boolean;
  @Input() onFavourite: EventEmitter<PartyQueueEntry> = new EventEmitter();
  @Input() canVote: boolean;

  @Output() onVote: EventEmitter<VoteRequest> = new EventEmitter();

  constructor(private queueService: QueueService,
              private sanitizer: DomSanitizer,
              private notificationsService: NotificationsService,
              private dialog: MatDialog,) {
  }

  ngOnInit() {
  }

  vote(up: boolean, voteToSkip: boolean) {
    let voteReq = new VoteRequest();
    voteReq.id = this.entry.id;
    voteReq.up = up;
    voteReq.voteToSkip = voteToSkip;
    this.queueService.voteSong(this.entry.party, voteReq).subscribe(res => {
      this.notificationsService.info('Your vote has been counted.');
    }, err => {
      this.notificationsService.error('Sorry, we couldn\'t process your vote... please try again later.');
    });
  }

  getArtistThumbnail(style: boolean) {
    let thumbnail = 'http://via.placeholder.com/400x400';
    if (this.entry.thumbnail) {
      thumbnail = this.entry.thumbnail;
    }

    if (style) {
      return this.sanitizer.bypassSecurityTrustStyle(
        'url(' + thumbnail + ')',
      );
    } else {
      return this.sanitizer.bypassSecurityTrustResourceUrl(thumbnail);
    }
  }

  favorite() {

  }

  formatEntryTitle(entry: PartyQueueEntry) {
    return this.sanitize(`${entry.artist} - ${entry.title}`);
  }

  sanitize(word: string) {
    return this.sanitizer.bypassSecurityTrustHtml(word);
  }

}
