import {Component, OnDestroy, OnInit} from "@angular/core";
import {routerTransition} from "../utils/Animations";
import {MatDialogRef} from "@angular/material";
import {LoginService} from "../services/LoginService";
import {UserAccount} from "../models/UserAccount";

@Component({
  selector: 'app-account-menu',
  templateUrl: './AccountMenu.html',
  styleUrls: ['./AccountMenu.scss'],
  animations: [routerTransition(),
  ],
})
export class AccountMenuComponent implements OnInit, OnDestroy {
  account: UserAccount;

  constructor(private loginService: LoginService) {
  }

  ngOnInit() {
    this.loginService.account.subscribe(res => {
      this.account = res;
    })
  }

  ngOnDestroy() {
  }

}
