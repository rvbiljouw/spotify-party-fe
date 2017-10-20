import {Http} from "@angular/http";
import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs/Observable";
import {PartyQueue, PartyQueueEntry} from "../models/PartyQueue";
import {Song} from "../models/Song";

@Injectable()
export class QueueService {
  private endpoint: string = `${environment.apiHost}/api/v1/queue`;

  constructor(private http: Http) {
  }

  getQueue(): Observable<PartyQueue> {
    return this.http.get(this.endpoint, {withCredentials: true}).map(res => {
      return res.json() as PartyQueue;
    })
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
    req.artist = song.artists[0].name;
    req.title = song.name;
    req.thumbnail = song.album.images[0].url;
    req.uri = song.uri;
    req.duration = song.duration;
    return req;
  }
}

export class VoteRequest {
  id: number;
  up: boolean;
}
