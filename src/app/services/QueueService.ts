import {Http} from "@angular/http";
import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs/Observable";
import {PartyQueue, PartyQueueEntry} from "../models/PartyQueue";
import {Song} from "../models/Song";
import {ListResponse} from "./ApiService";
import {Party} from "../models/Party";

@Injectable()
export class QueueService {
  private endpoint: string = `${environment.apiHost}/api/v1/party/:id`;
  private historyEndpoint: string = `${environment.apiHost}/api/v1/party/:id`;


  constructor(private http: Http) {
  }

  private getUrl(party: Party) {
    return party.type === "SPOTIFY" ? this.endpoint.replace(":id", "active") :
      this.endpoint.replace(":id", `${party.id}`);
  }

  getQueue(party: Party): Observable<PartyQueue> {
    return this.http.get(`${this.getUrl(party)}/queue`, {withCredentials: true}).map(res => {
      return res.json() as PartyQueue;
    })
  }

  getHistory(party: Party, limit: number, offset: number): Observable<ListResponse<PartyQueueEntry>> {

    return this.http.get(`${this.getUrl(party)}/history`, {withCredentials: true}).map(result => {
      const maxRecords = Number.parseInt(result.headers.get('X-Max-Records'));
      const offset = Number.parseInt(result.headers.get('X-Offset'));
      return new ListResponse<PartyQueueEntry>(
        result.json() as Array<PartyQueueEntry>,
        maxRecords,
        offset,
      );
    });
  }

  queueSong(party: Party, song: QueueSongRequest): Observable<PartyQueueEntry> {
    return this.http.post(`${this.getUrl(party)}/queue`, song, {withCredentials: true}).map(res => {
      return res.json() as PartyQueueEntry;
    });
  }

  voteSong(party: Party, voteRequest: VoteRequest) {
    return this.http.put(`${this.getUrl(party)}/queue`, voteRequest, {withCredentials: true}).map(res => {
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
  voteToSkip: boolean;
}
