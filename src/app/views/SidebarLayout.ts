import {Component, OnInit,} from '@angular/core';
import {ToastyConfig} from 'ng2-toasty';
import {Router,} from '@angular/router';
import {MediaChange, ObservableMedia} from '@angular/flex-layout';
import {LoginService} from '../services/LoginService';
import {PartyService} from "../services/PartyService";
import {PartyList} from "../models/PartyList";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-sidebar-layout',
  templateUrl: './SidebarLayout.html',
  styleUrls: ['./SidebarLayout.scss'],
})
export class SidebarLayoutComponent implements OnInit {
  parties: PartyList = new PartyList();
  opened: boolean = true;
  mode: string = "side";

  isMobileView: boolean;

  backgroundUrl: string = "assets/bg3.jpg";

  constructor(private toastyConfig: ToastyConfig,
              private media: ObservableMedia,
              private router: Router,
              private loginService: LoginService,
              private partyService: PartyService,
              private domSanitizer: DomSanitizer) {
    toastyConfig.theme = 'material';
    toastyConfig.position = 'top-center';
  }

  ngOnInit() {
    this.loginService.validate().subscribe(res => {
    });
    this.partyService.partyList.subscribe(partyList => {
      if (partyList != null) {
        this.parties = partyList;
        if (partyList.activeParty != null && partyList.activeParty.backgroundUrl != null && partyList.activeParty.backgroundUrl.length > 0) {
          this.backgroundUrl = partyList.activeParty.backgroundUrl;
        }
      }
    });

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

  logout() {
    this.loginService.logout();
    this.router.navigateByUrl('/');
  }

}
