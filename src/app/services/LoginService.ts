import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Rx';
import {environment} from '../../environments/environment';
import {LoginToken, UserAccount} from '../models/UserAccount';

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
    }

    this.validate().subscribe(res => {
    });
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

  login(email: string, password: string): Observable<LoginToken> {
    return this.http.post(`${environment.apiHost}/api/v1/login`, {
      email: email,
      password: password
    }, {withCredentials: true}).map(res => {
      return res.json() as LoginToken;
    });
  }

  register(form: any): Observable<UserAccount> {
    return this.http.post(`${environment.apiHost}/api/v1/account`, form, {withCredentials: true}).map(res => {
      return res.json() as UserAccount;
    });
  }

  logout() {
    console.log(document.cookie);
    document.cookie.split(";").forEach((c) => {
      console.log(c);
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    this.setAccount(null);
  }

  setAccount(account: UserAccount) {
    if (account != null) {
      window.localStorage.setItem('account', JSON.stringify(account));
    } else {
      window.localStorage.clear();
    }
    this.account.next(account);
  }
}
