import {Component, Input, OnInit} from '@angular/core';
import {QueueService} from '../services/QueueService';
import {DomSanitizer} from '@angular/platform-browser';
import {MatDialog} from '@angular/material';
import {NotificationsService} from 'angular2-notifications';
import {Party} from "../models/Party";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {Router} from "@angular/router";

@Component({
  selector: 'app-party-card',
  templateUrl: './PartyCard.html',
  styleUrls: ['./PartyCard.scss'],
  animations: [
    trigger('fadeTrigger', [
      transition('* => *', [
        style({
          opacity: 0
        }),
        animate('.7s', style({
          opacity: 1
        }))
      ])
    ])
  ]
})
export class PartyCardComponent implements OnInit {

  @Input() party: Party;
  active: string = "false";

  @Input() viewType: string = "NOW_PLAYING";

  constructor(private queueService: QueueService,
              private domSanitizer: DomSanitizer,
              private notificationsService: NotificationsService,
              private router: Router,
              private dialog: MatDialog,) {
  }

  ngOnInit() {
  }

  join() {
    this.router.navigate(['party', this.party.id])
      .catch(err => {
        console.log(err);
      }).then((bool) => {
      console.log(bool);
    })
  }

  getBackground(party: Party) {
    if (party.nowPlaying != null) {
      return this.domSanitizer.bypassSecurityTrustStyle(`url('${party.nowPlaying.thumbnail}')`);
    } else if (party.backgroundUrl != null && party.backgroundUrl != null && party.backgroundUrl.length > 0) {
      return this.domSanitizer.bypassSecurityTrustStyle(`url('${party.backgroundUrl}')`);
    } else {
      return this.domSanitizer.bypassSecurityTrustStyle('url(\'assets/bg3.jpg\')');
    }
  }

}
