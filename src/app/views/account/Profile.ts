import {Component, OnDestroy, OnInit} from '@angular/core';
import {routerTransition} from '../../utils/Animations';
import {DomSanitizer} from "@angular/platform-browser";
import {UserAccount} from "../../models/UserAccount";
import {UserAccountService} from "../../services/UserAccountService";
import {ActivatedRoute} from "@angular/router";
import {Party} from "../../models/Party";
import {PartyService} from "../../services/PartyService";
import {Filter, FilterType, ListResponse} from "../../services/ApiService";
import {NotificationsService} from "angular2-notifications";
import {PageEvent} from "@angular/material";

@Component({
  selector: 'profile',
  templateUrl: './Profile.html',
  styleUrls: ['./Profile.scss'],
  animations: [routerTransition(),
  ],
})
export class ProfileComponent implements OnInit, OnDestroy {
  account: UserAccount;

  isFollowing = false;

  working = false;

  pageSizeOptions = [5, 10, 20, 25, 100];

  parties: ListResponse<Party> = null;
  partiesPageNumber = 0;
  partiesLimit = 20;
  partiesOffset = 0;
  loadingParties = false;

  followers: ListResponse<UserAccount> = null;
  followersPageNumber = 0;
  followersLimit = 20;
  followersOffset = 0;
  loadingFollowers = false;

  constructor(private accountService: UserAccountService,
              private partyService: PartyService,
              private notificationsService: NotificationsService,
              private sanitizer: DomSanitizer,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    // TODO: Load from query params
    this.route.params.subscribe(params => {

      this.accountService.getById(+params["id"]).subscribe(res => {
        this.account = res;

        this.setPartiesPage({offset: this.partiesOffset, limit: this.partiesLimit});
        this.refreshFollowers();
      }, err => {
        console.log(err);

        this.notificationsService.error("Unable to load profile");
      });
    });
  }

  ngOnDestroy() {
  }

  refreshFollowers() {
    this.accountService.isFollowing(this.account.id).subscribe(res => {
      this.isFollowing = res;
    }, err => {
      console.log(err);

      this.notificationsService.error("Unable to load profile info");
    });
    this.setFollowersPage({offset: this.followersOffset, limit: this.followersLimit});
  }

  setPartiesPage(nextPage: any) {
    this.loadingParties = true;
    this.partyService.search([new Filter(FilterType.EQUALS, "owner.id", this.account.id)], nextPage.limit, nextPage.offset).subscribe(res => {
      this.parties = res;
      this.loadingParties = false;
    }, err => {
      console.log(err);
      this.loadingParties = false;

      this.notificationsService.error("Unable to load parties");
    });
  }

  onPartiesPageEvent(pageEvent: PageEvent) {
    this.partiesPageNumber = pageEvent.pageIndex;
    this.partiesLimit = pageEvent.pageSize;
    this.partiesOffset = pageEvent.pageIndex * pageEvent.pageSize;

    this.setPartiesPage({limit: this.partiesLimit, offset: this.partiesOffset});
  }

  setFollowersPage(nextPage: any) {
    this.loadingFollowers = true;
    this.accountService.getFollowers(this.account.id, nextPage.limit, nextPage.offset).subscribe(res => {
      this.followers = res;
      this.loadingFollowers = false;
    }, err => {
      console.log(err);
      this.loadingFollowers = false;

      this.notificationsService.error("Unable to load followers");
    });
  }

  onFollowersPageEvent(pageEvent: PageEvent) {
    this.followersPageNumber = pageEvent.pageIndex;
    this.followersLimit = pageEvent.pageSize;
    this.followersOffset = pageEvent.pageIndex * pageEvent.pageSize;

    this.setFollowersPage({limit: this.followersLimit, offset: this.followersOffset});
  }

  getBackgroundImage(picture: string) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${picture}')`)
  }

  follow() {
    this.working = true;
    this.accountService.follow(this.account.id).subscribe(res => {
      if (res) {
        this.notificationsService.success(`Followed ${this.account.displayName}`);
      } else {
        this.notificationsService.error(`Failed to follow ${this.account.displayName}`)
      }
      this.working = false;
      this.refreshFollowers();
    }, err => {
      console.log(err);
      this.working = false;
      this.refreshFollowers();

      this.notificationsService.error(`Failed to follow ${this.account.displayName}`)
    });
  }

  unfollow() {
    this.working = true;
    this.accountService.unfollow(this.account.id).subscribe(res => {
      if (res) {
        this.notificationsService.success(`Stopped following ${this.account.displayName}`);
      } else {
        this.notificationsService.error(`Failed to stop following ${this.account.displayName}`)
      }
      this.working = false;
      this.refreshFollowers();
    }, err => {
      console.log(err);
      this.working = false;
      this.refreshFollowers();

      this.notificationsService.error(`Failed to stop following ${this.account.displayName}`)
    });
  }

}
