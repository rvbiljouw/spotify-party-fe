import {Component, Input, OnInit} from '@angular/core';
import {QueueService} from '../services/QueueService';
import {DomSanitizer} from '@angular/platform-browser';
import {MatDialog} from '@angular/material';
import { NotificationsService } from 'angular2-notifications';
import {animate, state, style, transition, trigger} from "@angular/animations";
import {Router} from "@angular/router";
import {UserAccount} from "app/models/UserAccount";

@Component({
  selector: 'app-account-card',
  templateUrl: './AccountCard.html',
  styleUrls: ['./AccountCard.scss'],
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
export class AccountCardComponent implements OnInit {

  @Input() account: UserAccount;

  constructor(private domSanitizer: DomSanitizer,
              private notificationsService: NotificationsService,
              private router: Router,
              private dialog: MatDialog,) {
  }

  ngOnInit() {
  }

  getBackgroundImage(picture: string) {
    return this.domSanitizer.bypassSecurityTrustStyle(`url('${picture}')`)
  }

}
