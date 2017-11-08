import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators,} from '@angular/forms';
import {routerTransition} from '../../utils/Animations';
import {PartyService} from "../../services/PartyService";
import {QueueService, VoteRequest} from "../../services/QueueService";
import {DomSanitizer} from "@angular/platform-browser";
import {WebSocketService} from "../../services/WebSocketService";
import {MatDialog, MatInput} from "@angular/material";
import {LoginService} from "../../services/LoginService";
import {UserAccount} from "../../models/UserAccount";
import {MediaChange, ObservableMedia} from "@angular/flex-layout";
import {NotificationsService} from "angular2-notifications";
import {UserAccountService} from "../../services/UserAccountService";
import {SpotifyService} from "../../services/SpotifyService";
import {SpotifyDevice} from "../../models/SpotifyDevice";

@Component({
  selector: 'my-account',
  templateUrl: './MyAccount.html',
  styleUrls: ['./MyAccount.scss'],
  animations: [routerTransition(),
  ],
})
export class MyAccountComponent implements OnInit, OnDestroy {

  accountForm: FormGroup;
  spotifyForm: FormGroup;

  updating = false;

  account: UserAccount;
  admin: boolean = false;
  spotifyDevices: SpotifyDevice[];

  isMobileView: boolean;

  constructor(private router: Router,
              private partyService: PartyService,
              private notificationsService: NotificationsService ,
              private route: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private loginService: LoginService,
              private spotifyService: SpotifyService,
              private accountService: UserAccountService,
              private media: ObservableMedia,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.isMobileView = this.media.isActive('xs') || this.media.isActive('sm');

    this.media.subscribe((change: MediaChange) => {
      this.isMobileView = change.mqAlias === 'xs' || change.mqAlias === 'sm';
    });

    this.loginService.account.subscribe(account => {
      this.account = account;

      this.accountForm = this.fb.group({
        displayName: new FormControl(this.account != null ? this.account.displayName : null, []),
        email: new FormControl(this.account != null ? this.account.email : null, [Validators.required, Validators.email]),
        newPassword: new FormControl(null, [Validators.minLength(8)]),
        newPasswordConfirm: new FormControl(null, [
          Validators.minLength(8),
          this.confirmPasswordValidator.bind(this),
        ]),
      });

      this.spotifyForm = this.fb.group({
        device: new FormControl(this.account.spotify != null ? this.account.spotify.device : null, []),
      })
    });

    this.spotifyService.getDevices().subscribe(devices => {
      this.spotifyDevices = devices;
    }, err => {
      console.log(err);
    })
  }

  ngOnDestroy() {
  }


  submitAccount() {
    this.updating = true;
    this.accountService
      .update(this.account.id, this.accountForm.value)
      .subscribe(
        result => {
          this.updating = false;
          this.notificationsService.success("Account updated");
        },
        err => {
          console.log(err);
          this.updating = false;
          this.notificationsService.error("Unable to update account");
        },
      );
  }

submitSpotify() {
    this.updating = true;
    this.spotifyService
      .updateAccount(this.spotifyForm.value)
      .subscribe(
        result => {
          this.updating = false;
          this.notificationsService.success("Account updated");
        },
        err => {
          console.log(err);
          this.updating = false;
          this.notificationsService.error("Unable to update account");
        },
      );
  }


  confirmPasswordValidator(): { mismatch: boolean } {
    if (
      !this.accountForm ||
      !this.accountForm.get('newPassword') ||
      !this.accountForm.get('newPasswordConfirm') ||
      this.accountForm.get('newPassword').value !==
      this.accountForm.get('newPasswordConfirm').value
    ) {
      return { mismatch: true };
    }
    return null;
  }
}
