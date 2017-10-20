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
    const tokenEntry = localStorage.getItem('account');
    if (tokenEntry != null) {
      try {
        this.setAccount(JSON.parse(localStorage.getItem('account')));
      } catch (e) {
        this.setAccount(null);
      }
    } else {
      console.log("nothing in local storage");
    }
  }

  validate(): Observable<boolean> {
    return this.http
      .get(this.endpoint, {withCredentials: true})
      .map(res => {
        this.setAccount(res.json() as UserAccount);
        return true;
      })
      .catch((err: any) => {
        this.setAccount(null);
        return Observable.of(false);
      });
  }

  logout() {
    this.setAccount(null);
  }

  private setAccount(account: UserAccount) {
    if (account != null) {
      localStorage.setItem('account', JSON.stringify(account));
    } else {
      localStorage.clear();
    }
    DefaultRequestOptions.account = account;
    this.account.next(account);
  }
}
