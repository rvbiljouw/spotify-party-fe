import {Component, OnDestroy, OnInit} from '@angular/core';
import {routerTransition} from '../../utils/Animations';
import {DomSanitizer} from "@angular/platform-browser";
import {UserAccount} from "../../models/UserAccount";
import {UserAccountService} from "../../services/UserAccountService";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'profile',
  templateUrl: './Profile.html',
  styleUrls: ['./Profile.scss'],
  animations: [routerTransition(),
  ],
})
export class ProfileComponent implements OnInit, OnDestroy {
  account: UserAccount;

  achievements = [
    {
      name: 'Invincible',
      description: 'Kill 30 opponents in a row without dying.',
      image: 'http://halo.bungie.org/misc/halo3_hiresmedals/thumbs/08.jpg'
    },
    {
      name: 'Double Kill',
      description: 'Kill 2 opponents within 4 seconds of each other.',
      image: 'http://halo.bungie.org/misc/halo3_hiresmedals/thumbs/17.jpg'
    },
    {
      name: 'Triple Kill',
      description: 'Kill 3 opponents within 4 seconds of each other.',
      image: 'http://halo.bungie.org/misc/halo3_hiresmedals/thumbs/18.jpg'
    },
    {
      name: 'Killimanjaro',
      description: 'Kill 7 opponents within 4 seconds of each other.',
      image: 'http://halo.bungie.org/misc/halo3_hiresmedals/thumbs/22.jpg'
    }
  ];

  constructor(private accountService: UserAccountService,
              private sanitizer: DomSanitizer,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    // TODO: Load from query params
    this.route.params.subscribe(params => {
      this.accountService.getById(+params["id"]).subscribe(res => {
        this.account = res;
      });
    });
  }

  ngOnDestroy() {
  }

  getBackgroundImage(picture: string) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${picture}')`)
  }

  follow() {

  }

  unfollow() {

  }

}
