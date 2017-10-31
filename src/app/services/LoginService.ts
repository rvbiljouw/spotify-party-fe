import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Rx';
import {environment} from '../../environments/environment';
import {UserAccount} from '../models/UserAccount';
import {DefaultRequestOptions} from "./util/DefaultRequestOptions";

@Injectable()
export class LoginService {
  private endpoint = `${environment.apiHost}/api/v1/account`;
  account: BehaviorSubject<UserAccount> = new BehaviorSubject(null);

  constructor(private http: Http) {
    const tokenEntry = window.localStorage.getItem('account');
    if (tokenEntry != null) {
      try {
        this.setAccount(JSON.parse(window.localStorage.getItem('account')));
      } catch (e) {
        this.setAccount(null);
      }
    } else {
      console.log("nothing in local storage");
    }

    this.validate().subscribe(res => {
      console.log(res);
    })
  }

  validate(): Observable<boolean> {
    return this.http
      .get(this.endpoint, {withCredentials: true}).map(res => {
        this.setAccount(res.json() as UserAccount);
        return true;
      }).catch((err: any) => {
        this.setAccount(null);
        return Observable.of(false);
      });
  }

  logout() {
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    this.setAccount(null);
  }

  private setAccount(account: UserAccount) {
    if (account != null) {
      window.localStorage.setItem('account', JSON.stringify(account));
    } else {
      window.localStorage.clear();
    }
    DefaultRequestOptions.account = account;
    this.account.next(account);
  }
}
