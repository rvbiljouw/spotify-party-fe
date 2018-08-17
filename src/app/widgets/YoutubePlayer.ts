import {AfterViewChecked, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {QueueService} from '../services/QueueService';
import {DomSanitizer} from '@angular/platform-browser';
import {MatDialog} from '@angular/material';
import {NotificationsService} from 'angular2-notifications';
import {Party} from "../models/Party";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-youtube-player',
  templateUrl: './YoutubePlayer.html',
  styleUrls: ['./YoutubePlayer.scss']
})
export class YoutubePlayerComponent implements OnInit {
  @ViewChild('ytEmbed') element: ElementRef;

  player: any;

  constructor(private queueService: QueueService,
              private domSanitizer: DomSanitizer,
              private notificationsService: NotificationsService,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.player = new (<any>window).YT.Player(this.element.nativeElement, {
      height: '100%',
      width: '100%',
      playerVars: {'autoplay': 1, 'rel': 0, 'controls': 1, 'playsinline': 1},
      events: {
        'onReady': () => {
        },
        'onStateChange': () => {
        }
      }
    });
  }

  play(uri: string, position: number) {
    if (this.player != null && this.player.loadVideoById != null) {
      this.player.loadVideoById(uri.split("v=")[1], position);
      this.player.playVideo();

      this.checkPlayState(uri, position);
    } else {
      setTimeout(() => {
        this.play(uri, position);
      }, 1000);
    }
  }

  stop() {
    if (this.player != null) {
      this.player.stopVideo();
    } else {
      setTimeout(() => {
        this.stop();
      }, 1000);
    }
  }

  private checkPlayState(uri: string, position: number) {
    let time = new Date().getDate();
    setTimeout(() => {
      if (this.player.getPlayerState() != 1 && this.player.getPlayerState() != 3) {
        console.log("Video isn't playing - trying again.");
        let offset = new Date().getDate();
        this.play(uri, position + (offset - time));
      }
    }, 1000);
  }


}
