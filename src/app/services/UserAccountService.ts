import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Rx';
import {environment} from '../../environments/environment';
import {UserAccount} from '../models/UserAccount';
import {ApiService} from "./ApiService";

@Injectable()
export class UserAccountService extends ApiService<UserAccount> {

  constructor(http: Http) {
    super(
      http,
      environment.apiHost,
      '/api/v1/account',
    );
  }

  uploadDisplayPicture(displayPicture64: string): Observable<UserAccount> {
    return this.http.put(`${environment.apiHost}/api/v1/account/picture`, displayPicture64, {withCredentials: true}).map(res => {
      return res.json() as UserAccount;
    });
  }
}
