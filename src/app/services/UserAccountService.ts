import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Rx';
import {environment} from '../../environments/environment';
import {UserAccount} from '../models/UserAccount';
import {ApiService, ListResponse} from "./ApiService";

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

  updateAccount(request: UserAccount): Observable<UserAccount> {
    let url = `${environment.apiHost}/api/v1/account`;
    return this.http
      .put(url, request, {withCredentials:true})
      .map(result => {
        return result.json() as UserAccount;
      })
      .catch(error => {
        return Observable.of(null);
      });
  }

  getFollowers(accountId: number, limit: number = 25, offset: number = 0): Observable<ListResponse<UserAccount>> {
    const url = `${environment.apiHost}/api/v1/account/${accountId}/followers?offset=${offset}&limit=${limit}`;
    return this.http
      .get(url, {withCredentials: true})
      .map(result => {
        const maxRecords = Number.parseInt(result.headers.get('X-Max-Records'));
        const offset = Number.parseInt(result.headers.get('X-Offset'));
        return new ListResponse<UserAccount>(
          result.json() as UserAccount[],
          maxRecords,
          offset,
        );
      }).catch(err => {
        return Observable.throw(err);
      });
  }

  isFollowing(accountId: number): Observable<boolean> {
    const url = `${environment.apiHost}/api/v1/account/${accountId}/following`;
    return this.http
      .get(url, {withCredentials: true})
      .map(result => {
        return result.json()["following"];
      }).catch(err => {
        return Observable.throw(err);
      });
  }

  follow(accountId: number): Observable<boolean> {
    const url = `${environment.apiHost}/api/v1/account/${accountId}/follow`;
    return this.http
      .put(url, {}, {withCredentials: true})
      .map(result => {
        return result.json() != null;
      }).catch(err => {
        return Observable.throw(err);
      });
  }

  unfollow(accountId: number): Observable<boolean> {
    const url = `${environment.apiHost}/api/v1/account/${accountId}/follow`;
    return this.http
      .delete(url, {withCredentials: true})
      .map(result => {
        return result.json() != null;
      }).catch(err => {
        return Observable.throw(err);
      });
  }
}
