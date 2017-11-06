import {Component, Input, OnInit} from '@angular/core';
import {QueueService} from '../services/QueueService';
import {DomSanitizer} from '@angular/platform-browser';
import {MatDialog} from '@angular/material';
import {ToastyService} from 'ng2-toasty';
import {Party} from "../models/Party";
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-youtube-player',
  templateUrl: './YoutubePlayer.html',
  styleUrls: ['./YoutubePlayer.scss']
})
export class YoutubePlayerComponent implements OnInit {

  player: any;

  constructor(private queueService: QueueService,
              private domSanitizer: DomSanitizer,
              private toast: ToastyService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.player = new (<any>window).YT.Player('yt-embed', {
      height: '100%',
      width: '100%',
      playerVars: {'autoplay': 0, 'rel': 0, 'controls': 0},
      events: {
        'onReady': () => {
        },
        'onStateChange': () => {
        }
      }
    });
  }

  play(uri: string, position: number) {
    if(this.player != null && this.player.loadVideoById != null) {
      this.player.loadVideoById(uri.split("v=")[1], position);
    } else {
      setTimeout(() => {
        this.play(uri, position);
      }, 1000);
    }
  }

}
