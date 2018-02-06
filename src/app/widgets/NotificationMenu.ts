import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {QueueService} from '../services/QueueService';
import {DomSanitizer} from '@angular/platform-browser';
import {MatDialog} from '@angular/material';
import {NotificationsService} from 'angular2-notifications';
import {ListResponse} from "../services/ApiService";
import {UserNotificationService} from "app/services/UserNotificationService";
import {Subscription} from "rxjs/Subscription";
import {IntervalObservable} from "rxjs/observable/IntervalObservable";
import {Notification} from '../models/Notification';
import {UserAccount} from "../models/UserAccount";

@Component({
  selector: 'app-notification-menu',
  templateUrl: './NotificationMenu.html',
  styleUrls: ['./NotificationMenu.scss']
})
export class NotificationMenuComponent implements OnInit, OnDestroy {

  notifications: ListResponse<Notification> = new ListResponse([], 0, 0);

  refreshTimer: Subscription;

  constructor(private queueService: QueueService,
              private sanitizer: DomSanitizer,
              private userNotificationService: UserNotificationService,
              private notificationsService: NotificationsService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.refreshTimer = IntervalObservable.create(10000).subscribe(res => {
      // this.refresh();
    });

    this.refresh();
  }

  ngOnDestroy() {
    if (this.refreshTimer) {
      this.refreshTimer.unsubscribe();
    }
  }

  refresh() {
    this.userNotificationService.getUnread(10, 0).subscribe(res => {
      this.notifications = res;
    });
  }

  getBackgroundImage(account: UserAccount) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${account.displayPicture}')`)
  }

  formatDate(notification: Notification) {
    return new Date(notification.created).toISOString().slice(0, 10);
  }


}
