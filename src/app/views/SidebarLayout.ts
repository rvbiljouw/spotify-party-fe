import {Component, Input, OnInit, ViewChild,} from '@angular/core';
import {Router,} from '@angular/router';
import {MediaChange, ObservableMedia} from '@angular/flex-layout';
import {LoginService} from '../services/LoginService';
import {PartyService} from "../services/PartyService";
import {PartyList} from "../models/PartyList";
import {DomSanitizer} from "@angular/platform-browser";
import {Party} from "../models/Party";
import {UserAccount} from "../models/UserAccount";
import {MatSidenav} from "@angular/material";

@Component({
  selector: 'app-sidebar-layout',
  templateUrl: './SidebarLayout.html',
  styleUrls: ['./SidebarLayout.scss'],
})
export class SidebarLayoutComponent implements OnInit {

  @Input() party: Party;
  account: UserAccount;
  parties: PartyList = new PartyList();

  backgroundUrl: string = "assets/bg3.jpg";

  @ViewChild(MatSidenav)
  sidenav: MatSidenav;

  @Input()
  occupy: false;

  constructor(private media: ObservableMedia,
              private router: Router,
              private loginService: LoginService,
              private partyService: PartyService,
              private domSanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.loginService.account.subscribe(account => {
      this.account = account;
    });

    this.partyService.partyList.subscribe(partyList => {
      if (partyList != null) {
        this.parties = partyList;
      } else {
        this.parties = new PartyList();
      }
    });
    if (this.party != null && this.party.backgroundUrl != null && this.party.backgroundUrl.length > 0) {
      this.backgroundUrl = this.party.backgroundUrl;
    }
  }

  getBackground(backgroundUrl: string) {
    if (backgroundUrl != null && backgroundUrl != null && backgroundUrl.length > 0) {
      return this.domSanitizer.bypassSecurityTrustStyle('url(\'' + backgroundUrl + '\')');
    } else {
      return this.domSanitizer.bypassSecurityTrustStyle('url(\'assets/bg3.jpg\')');
    }
  }

  getPartyIcon(party: Party) {
    if (party.type === "SPOTIFY") {
      return '/assets/spotify.png';
    } else if (party.type === "YOUTUBE") {
      return '/assets/youtube.png';
    }

    return null;
  }

  logout() {
    this.loginService.logout();
    this.router.navigateByUrl('/');
  }

  sortedParties() {
    if (this.account != null && this.parties != null && this.parties.parties != null) {
      return this.parties.parties.sort((a, b) => {
        return a.name.localeCompare(b.name);
      }).slice(0, 4);
    }

    return [];
  }

  toggle() {
    this.sidenav.toggle();
  }

}
