import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Rx';
import {environment} from '../../environments/environment';
import {UserAccount} from '../models/UserAccount';
import {CookieService} from "ngx-cookie-service";
import {LoginToken} from "../models/LoginToken";
import {DefaultRequestOptions} from "../utils/DefaultRequestOptions";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";

@Injectable()
export class LoginService {
  private endpoint = `${environment.apiHost}/api/v1/account`;
  account: BehaviorSubject<UserAccount> = new BehaviorSubject(null);
  token: BehaviorSubject<LoginToken> = new BehaviorSubject(null);

  constructor(private http: Http,
              private cookieService: CookieService,
              private router: Router,
              private route: ActivatedRoute) {
    const tokenEntry = cookieService.get('token');
    console.log("TOKEN: " + tokenEntry);
    if (tokenEntry != null) {
      try {
        let token = JSON.parse(tokenEntry);
        this.setToken(token);
      } catch (e) {
        this.setToken(null);
      }
    }

    router.events.subscribe(res => {
      if (!(res instanceof NavigationEnd)) {
        return;
      }

      this.route.queryParams.subscribe(params => {
        let loginToken = params["loginToken"];
        if (loginToken) {
          DefaultRequestOptions.token = {token: loginToken} as LoginToken;
          this.validate().subscribe(res => {
          });
        }
      });
    });
  }

  validate(): Observable<boolean> {
    return this.http
      .get(`${environment.apiHost}/api/v1/login`).map(res => {
        console.log(res);
        this.setToken(res.json() as LoginToken);
        return true;
      }).catch((err: any) => {
        console.log(err);
        this.setToken(null);
        return Observable.of(false);
      });
  }

  login(email: string, password: string): Observable<LoginToken> {
    return this.http.post(`${environment.apiHost}/api/v1/login`, {
      email: email,
      password: password
    }, {withCredentials: true}).map(res => {
      console.log(res);
      this.setToken(res.json() as LoginToken);
      return res.json() as LoginToken;
    });
  }

  register(form: any): Observable<UserAccount> {
    return this.http.post(`${environment.apiHost}/api/v1/account`, form, {withCredentials: true}).map(res => {
      return res.json() as UserAccount;
    });
  }

  logout() {
    this.setToken(null);
  }

  setToken(token: LoginToken) {
    if (token != null) {
      this.cookieService.set('token', JSON.stringify(token));
    } else {
      this.cookieService.deleteAll();
    }

    this.token.next(token);
    if (token != null) {
      DefaultRequestOptions.token = token;
      this.account.next(token.account);
    } else {
      this.account.next(null);
    }
  }
}
