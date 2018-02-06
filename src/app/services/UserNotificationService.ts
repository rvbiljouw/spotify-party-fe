import {Http, URLSearchParams} from '@angular/http';
import {Injectable} from '@angular/core';
import {ApiService, Filter, FilterType, ListResponse} from './ApiService';
import {environment} from '../../environments/environment';
import {Song} from '../models/Song';
import {Observable} from "rxjs/Observable";
import {Artist} from "../models/Artist";
import {Album} from "../models/Album";
import {Notification} from "../models/Notification";

@Injectable()
export class UserNotificationService {
  private endpoint: string = `${environment.apiHost}/api/v1/notifications`;

  constructor(private http: Http) {
  }

  public getUnread(limit: number = 10,
                    offset: number = 0,): Observable<ListResponse<Notification>> {
    return this.http
      .get(`${this.endpoint}/unread?limit=${limit}&offset=${offset}`, {withCredentials: true})
      .map(result => {
        const maxRecords = Number.parseInt(result.headers.get('X-Max-Records'));
        const offset = Number.parseInt(result.headers.get('X-Offset'));
        return new ListResponse<Notification>(
          result.json() as Array<Notification>,
          maxRecords,
          offset,
        );
      })
      .catch(error => {
        return Observable.throw(error);
      });
  }

  public markRead(ids: number[]): Observable<number> {
    return this.http
      .put(`${this.endpoint}/mark`, ids, {withCredentials: true})
      .map(result => {
        return result;
      })
      .catch(error => {
        return Observable.throw(error);
      });
  }
}
