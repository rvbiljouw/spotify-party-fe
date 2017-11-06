import {Component, Input, OnInit} from '@angular/core';
import {QueueService, QueueSongRequest} from '../services/QueueService';
import {Artist} from '../models/Artist';
import {DomSanitizer} from '@angular/platform-browser';
import {MatDialog} from '@angular/material';
import {ToastyService} from 'ng2-toasty';
import {Observable} from 'rxjs/Observable';
import {Song} from "../models/Song";

@Component({
  selector: 'app-song-list-item',
  templateUrl: './SongListItem.html',
  styleUrls: ['./SongListItem.scss'],
})
export class SongListItemComponent implements OnInit {
  @Input() song: Song;

  constructor(private queueService: QueueService,
              private sanitizer: DomSanitizer,
              private toast: ToastyService,
              private dialog: MatDialog,) {
  }

  ngOnInit() {
  }

  play() {
    this.queueService.queueSong(QueueSongRequest.forSong(this.song)).subscribe(playout => {
      this.toast.success(
        `${this.song.artist} - ${this.song.title} has been queued.`,
      );
    });
  }

  getArtistThumbnail(style: boolean) {
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
