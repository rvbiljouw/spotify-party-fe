import {Component, Input, OnInit} from '@angular/core';
import {QueueService, VoteRequest} from '../services/QueueService';
import {DomSanitizer} from '@angular/platform-browser';
import {MatDialog} from '@angular/material';
import {ToastyService} from 'ng2-toasty';
import {PartyQueueEntry} from "../models/PartyQueue";

@Component({
  selector: 'app-queue-list-item',
  templateUrl: './QueueListItem.html',
  styleUrls: ['./QueueListItem.scss'],
})
export class QueueListItemComponent implements OnInit {
  @Input() entry: PartyQueueEntry;

  constructor(private queueService: QueueService,
              private sanitizer: DomSanitizer,
              private toast: ToastyService,
              private dialog: MatDialog,) {
  }

  ngOnInit() {
  }

  vote(up: boolean) {
    let voteReq = new VoteRequest();
    voteReq.id = this.entry.id;
    voteReq.up = up;
    this.queueService.voteSong(voteReq).subscribe(res => {
      this.toast.info('Your vote has been counted.');
    }, err => {
      this.toast.error('Sorry, we couldn\'t process your vote... please try again later.');
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

}
