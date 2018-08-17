import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {environment} from "../../environments/environment";
import {Http} from "@angular/http";
import {Party, PartyListItem} from "../models/Party";
import {Observable} from "rxjs/Observable";
import {Filter, FilterType, ListResponse} from "./ApiService";
import {PartyList} from "../models/PartyList";
import {UserAccount} from "../models/UserAccount";
import {IntervalObservable} from "rxjs/observable/IntervalObservable";
import {MessageEnvelope, WebSocketService} from "./WebSocketService";
import {Genre} from "../models/Genre";

@Injectable()
export class PartyService {
  private endpoint = `${environment.apiHost}/api/v1/parties`;
  private createEndpoint = `${environment.apiHost}/api/v1/party`;

  partyList: BehaviorSubject<PartyList> = new BehaviorSubject(null);
  activeParty: BehaviorSubject<Party> = new BehaviorSubject(null);

  parties: Array<Party> = [];

  constructor(private http: Http,
              private webSocketService: WebSocketService) {
    console.log("hello");
    this.webSocketService.registerHandler("PARTY_LIST", (e) => this.onPartyList(e));
  }

  private onPartyList(env: MessageEnvelope) {
    let newPartyList = JSON.parse(env.body) as PartyList;
    this.partyList.next(newPartyList);
  }

  createParty(req: CreatePartyRequest) {
    return this.http.post(`${this.createEndpoint}`, req, {withCredentials: true}).map(res => {
      let party = res.json() as Party;
      return party;
    });
  }

  leaveParty(id: number, remove: boolean): Observable<boolean> {
    return this.http.delete(`${this.endpoint}/${id}/members?remove=${remove}`, {withCredentials: true}).map(res => {
      return true;
    });
  }

  getMostPopular(limit: number, offset: number, type: string): Observable<ListResponse<Party>> {
    return this.search([new Filter(FilterType.EQUALS, "type", type, [])],
      limit, offset, {sort: "activeMemberCount", order: "desc"});
  }

  getNew(limit: number, offset: number, type: string): Observable<ListResponse<Party>> {
    return this.search([new Filter(FilterType.EQUALS, "type", type, [])],
      limit, offset, {sort: "created", order: "desc"});
  }

  getParties(limit: number, offset: number, filters: Array<Filter> = []): Observable<ListResponse<Party>> {
    return this.search(filters, limit, offset);
  }

  getGenres(): Observable<Genre[]> {
    return this.http.get(`${environment.apiHost}/api/v1/genres`).map(res => {
      return res.json() as Genre[];
    });
  }

  searchAllMyParties(limit: number, offset: number, type: string, name: string, account: UserAccount): Observable<ListResponse<Party>> {
    return this.search([
        new Filter(FilterType.EQUALS, "type", type, []),
        new Filter(FilterType.CONTAINS, "name", name, []),
        new Filter(FilterType.EQUALS, "members.account.id", account.id, []),
      ],
      limit, offset, {sort: "activeMemberCount", order: "desc"}
    );
  }

  getById(id: number): Observable<Party> {
    return this.http
      .get(`${this.createEndpoint}/${id}`, {withCredentials: true})
      .map(result => result.json() as Party)
      .catch(error => {
        return Observable.of(null);
      });
  }

  search(filters: Array<Filter>,
         limit: number = 10,
         offset: number = 0,
         params: any = {}): Observable<ListResponse<Party>> {
    let queryParams = '';
    for (const key in params) {
      queryParams += `${key}=${params[key]}&`;
    }
    queryParams += `limit=${limit}&offset=${offset}`;

    return this.http
      .post(`${this.endpoint}?${queryParams}`, filters, {withCredentials: true})
      .map(result => {
        const maxRecords = Number.parseInt(result.headers.get('X-Max-Records'));
        const offset = Number.parseInt(result.headers.get('X-Offset'));
        return new ListResponse<Party>(
          result.json() as Array<Party>,
          maxRecords,
          offset,
        );
      })
      .catch(error => {
        return Observable.of(null);
      });
  }

  kickUser(party: Party, member: UserAccount): Observable<Party> {
    return this.http.delete(`${this.endpoint}/${party.id}/members/${member.id}`, {withCredentials: true}).map(res => {
      return res.json() as Party;
    })
  }

  updateParty(id: number, value: any) {
    return this.http.put(`${this.endpoint}/${id}`, value, {withCredentials: true}).map(res => {
      return res.json() as Party;
    })
  }
}

export class CreatePartyRequest {
  constructor(name: string, description: string, type: string, access: string) {
  }
}
