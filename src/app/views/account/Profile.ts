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

  parties: ListResponse<Party> = null;
  pageSizeOptions = [5, 10, 20, 25, 100];
  partiesPageNumber = 0;
  partiesLimit = 20;
  partiesOffset = 0;
  loadingParties = false;

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

        this.setPartiesPage({offset: this.partiesOffset, limit: this.partiesLimit})
      }, err => {
        console.log(err);

        this.notificationsService.error("Unable to load profile");
      });
    });
  }

  ngOnDestroy() {
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

  getBackgroundImage(picture: string) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${picture}')`)
  }

  follow() {

  }

  unfollow() {

  }

}
