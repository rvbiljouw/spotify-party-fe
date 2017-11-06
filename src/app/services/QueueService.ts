import {Http} from "@angular/http";
import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs/Observable";
import {PartyQueue, PartyQueueEntry} from "../models/PartyQueue";
import {Song} from "../models/Song";
import {ListResponse} from "./ApiService";

@Injectable()
export class QueueService {
  private endpoint: string = `${environment.apiHost}/api/v1/party/active/queue`;
  private historyEndpoint: string = `${environment.apiHost}/api/v1/party/active/history`;


  constructor(private http: Http) {
  }

  getQueue(): Observable<PartyQueue> {
    return this.http.get(this.endpoint, {withCredentials: true}).map(res => {
      return res.json() as PartyQueue;
    })
  }

  getHistory(limit: number, offset: number): Observable<ListResponse<PartyQueueEntry>> {
    return this.http.get(this.historyEndpoint, {withCredentials: true}).map(result => {
      const maxRecords = Number.parseInt(result.headers.get('X-Max-Records'));
      const offset = Number.parseInt(result.headers.get('X-Offset'));
      return new ListResponse<PartyQueueEntry>(
        result.json() as Array<PartyQueueEntry>,
        maxRecords,
        offset,
      );
    });
  }

  queueSong(song: QueueSongRequest): Observable<PartyQueueEntry> {
    return this.http.post(this.endpoint, song, {withCredentials: true}).map(res => {
      return res.json() as PartyQueueEntry;
    });
  }

  voteSong(voteRequest: VoteRequest) {
    return this.http.put(this.endpoint, voteRequest, {withCredentials: true}).map(res => {
      return res.json() as PartyQueueEntry;
    })
  }

}

export class QueueSongRequest {
  artist: string;
  title: string;
  thumbnail: string;
  uri: string;
  duration: number;

  static forSong(song: Song) {
    let req = new QueueSongRequest();
    req.artist = song.artist;
    req.title = song.title;
    req.thumbnail = song.thumbnail;
    req.uri = song.uri;
    req.duration = song.duration;
    return req;
  }
}

export class VoteRequest {
  id: number;
  up: boolean;
}
