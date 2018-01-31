import {Component, Input, OnInit, EventEmitter, Output} from '@angular/core';
import {QueueService, QueueSongRequest} from '../services/QueueService';
import {DomSanitizer} from '@angular/platform-browser';
import {NotificationsService} from 'angular2-notifications';
import {Song} from "../models/Song";
import {Party} from "../models/Party";
import {FavouriteService} from "../services/FavouriteService";

@Component({
  selector: 'app-song-card',
  templateUrl: './SongCard.html',
  styleUrls: ['./SongCard.scss'],
})
export class SongCardComponent implements OnInit {
  @Input() song: Song;
  @Input() party: Party;
  @Input() canDelete = false;

  @Output() onDelete: EventEmitter<Song> = new EventEmitter();

  constructor(private queueService: QueueService,
              private sanitizer: DomSanitizer,
              private favouriteService: FavouriteService,
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
