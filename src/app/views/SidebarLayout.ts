import {Component, Input, OnInit,} from '@angular/core';
import {Router,} from '@angular/router';
import {MediaChange, ObservableMedia} from '@angular/flex-layout';
import {LoginService} from '../services/LoginService';
import {PartyService} from "../services/PartyService";
import {PartyList} from "../models/PartyList";
import {DomSanitizer} from "@angular/platform-browser";
import {Party} from "../models/Party";
import {UserAccount} from "../models/UserAccount";

@Component({
  selector: 'app-sidebar-layout',
  templateUrl: './SidebarLayout.html',
  styleUrls: ['./SidebarLayout.scss'],
})
export class SidebarLayoutComponent implements OnInit {

  @Input() party: Party;
  account: UserAccount;
  parties: PartyList = new PartyList();
  opened: boolean = true;
  mode: string = "side";

  isMobileView: boolean;

  backgroundUrl: string = "assets/bg3.jpg";

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

    this.isMobileView = this.media.isActive('xs') || this.media.isActive('sm');
    if (this.isMobileView) {
      this.opened = false;
      this.mode = "push";
    } else {
      this.opened = true;
      this.mode = "side";
    }

    this.media.subscribe((change: MediaChange) => {
      this.isMobileView = change.mqAlias === 'xs' || change.mqAlias === 'sm';
      if (this.isMobileView) {
        this.opened = false;
        this.mode = "push";
      } else {
        this.opened = true;
        this.mode = "side";
      }
    });


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
    } else if (party.type === "YOUTUBE" ) {
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
      });
    }

    return [];
  }

}
