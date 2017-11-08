import {Http, URLSearchParams} from '@angular/http';
import {Injectable} from '@angular/core';
import {ApiService, Filter, FilterType, IUpdateRequest, ListResponse} from './ApiService';
import {environment} from '../../environments/environment';
import {Song} from '../models/Song';
import {Observable} from "rxjs/Observable";
import {Artist} from "../models/Artist";
import {Album} from "../models/Album";
import {SpotifyDevice} from "../models/SpotifyDevice";
import {SpotifyAccount} from "../models/SpotifyAccount";

@Injectable()
export class SpotifyService {
  private endpoint: string = `${environment.apiHost}/api/v1/spotify`;

  constructor(private http: Http) {
  }

  searchSongs(filters: Array<Filter>, limit: number = 25, offset: number = 0): Observable<ListResponse<Song>> {
    return this.search(`${this.endpoint}/songs`, filters, limit, offset);
  }

  searchArtists(filters: Array<Filter>, limit: number = 25, offset: number = 0): Observable<ListResponse<Artist>> {
    return this.search(`${this.endpoint}/artists`, filters, limit, offset);
  }

  searchAlbums(filters: Array<Filter>, limit: number = 25, offset: number = 0): Observable<ListResponse<Album>> {
    return this.search(`${this.endpoint}/albums`, filters, limit, offset);
  }

  getDevices(): Observable<SpotifyDevice[]> {
    return this.http.get(`${this.endpoint}/devices`, {withCredentials: true})
      .map(result => {
        return result.json() as SpotifyDevice[];
      })
      .catch(error => {
        return null;
      });
  }

  updateAccount(request: IUpdateRequest<SpotifyAccount>): Observable<SpotifyAccount> {
    return this.http
      .put(`${this.endpoint}/account`, request, {withCredentials: true})
      .map(result => {
        return result.json() as SpotifyAccount;
      })
      .catch(error => {
        return null;
      });
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
