import {Http, URLSearchParams} from '@angular/http';
import {Injectable} from '@angular/core';
import {ApiService, Filter, FilterType, ListResponse} from './ApiService';
import {environment} from '../../environments/environment';
import {Song} from '../models/Song';
import {Observable} from "rxjs/Observable";
import {Artist} from "../models/Artist";
import {Album} from "../models/Album";

@Injectable()
export class YouTubeService {
  private endpoint: string = `${environment.apiHost}/api/v1/youtube`;

  constructor(private http: Http) {
  }

  searchSongs(filters: Array<Filter>, limit: number = 25, offset: number = 0): Observable<ListResponse<Song>> {
    return this.search(`${this.endpoint}/songs`, filters, limit, offset);
  }

  private search<T>(url: string,
                    filters: Array<Filter>,
                    limit: number = 10,
                    offset: number = 0,): Observable<ListResponse<T>> {
    return this.http
      .post(`${url}?limit=${limit}&offset=${offset}`, filters, {withCredentials: true})
      .map(result => {
        const maxRecords = Number.parseInt(result.headers.get('X-Max-Records'));
        const offset = Number.parseInt(result.headers.get('X-Offset'));
        return new ListResponse<T>(
          result.json() as Array<T>,
          maxRecords,
          offset,
        );
      })
      .catch(error => {
        return null;
      });
  }
}
