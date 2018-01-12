import {Component, Input, OnInit} from '@angular/core';
import {QueueService, QueueSongRequest} from '../services/QueueService';
import {DomSanitizer} from '@angular/platform-browser';
import {NotificationsService} from 'angular2-notifications';
import {Song} from "../models/Song";
import {Party} from "../models/Party";

@Component({
  selector: 'app-youtube-card',
  templateUrl: './YouTubeCard.html',
  styleUrls: ['./YouTubeCard.scss'],
})
export class YouTubeCardComponent implements OnInit {
  @Input() song: Song;
  @Input() party: Party;

  constructor(private queueService: QueueService,
              private sanitizer: DomSanitizer,
              private notificationsService: NotificationsService) {
  }

  ngOnInit() {
  }

  play() {
    this.queueService.queueSong(this.party, QueueSongRequest.forSong(this.song)).subscribe(playout => {
      this.notificationsService.success(
        `${this.song.artist} - ${this.song.title} has been queued.`,
      );
    });
  }

  getThumbnail(style: boolean) {
    let thumbnail = 'http://via.placeholder.com/400x400';
    if (this.song.thumbnail && this.song.thumbnail.length > 0) {
      thumbnail = this.song.thumbnail;
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
