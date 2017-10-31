import { Observable } from 'rxjs/Rx';
import { Http, Response } from '@angular/http';

export class ApiService<T> {
  constructor(
    protected http: Http,
    protected apiBase: string,
    protected resource: string,
    private subresource: boolean = false,
  ) {}

  getById(id: number): Observable<T> {
    return this.http
      .get(`${this.apiBase}${this.resource}/${id}`, {withCredentials: true})
      .map(result => result.json() as T)
      .catch(error => {
        return null;
      });
  }

  getSingle(): Observable<T> {
    return this.http
      .get(`${this.apiBase}${this.resource}`, {withCredentials: true})
      .map(result => result.json() as T)
      .catch(error => {
        return null;
      });
  }

  getAll(limit: number = 10, offset: number = 0): Observable<ListResponse<T>> {
    return this.http
      .get(`${this.apiBase}${this.resource}?limit=${limit}&offset=${offset}`, {withCredentials: true})
      .map((result: Response) => {
        const newMaxRecords = Number.parseInt(
          result.headers.get('X-Max-Records'),
        );
        const newOffset = Number.parseInt(result.headers.get('X-Offset'));
        return new ListResponse<T>(
          result.json() as Array<T>,
          newMaxRecords,
          newOffset,
        );
      })
      .catch(error => {
        return null;
      });
  }

  search(
    filters: Array<Filter>,
    limit: number = 10,
    offset: number = 0,
  ): Observable<ListResponse<T>> {
    return this.http
      .post(
        `${this.apiBase}${this
          .resource}/search?limit=${limit}&offset=${offset}`,
        filters,
      )
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

  create(request: ICreateRequest<T>): Observable<T> {
    return this.http
      .post(`${this.apiBase}${this.resource}`, request)
      .map(result => {
        return result.json() as T;
      })
      .catch(error => {
        return null;
      });
  }

  update(id: number, request: IUpdateRequest<T>): Observable<T> {
    let url = `${this.apiBase}${this.resource}`;
    if (!this.subresource) {
      url = `${this.apiBase}${this.resource}/${id}`;
    }

    return this.http
      .put(url, request)
      .map(result => {
        return result.json() as T;
      })
      .catch(error => {
        return null;
      });
  }

  delete(id: number): Observable<boolean> {
    let url = `${this.apiBase}${this.resource}`;
    if (!this.subresource) {
      url = `${this.apiBase}${this.resource}/${id}`;
    }

    return this.http
      .delete(url)
      .map(result => {
        return result.json().success;
      })
      .catch(error => {
        return null;
      });
  }
}

export class ListResponse<T> {
  constructor(
    public items: Array<T>,
    public maxRecords: number,
    public offset: number,
  ) {}
}

export interface ICreateRequest<T> {}

export interface IUpdateRequest<T> {}

export type FilterType =
  | 'NOT_EQUALS'
  | 'EQUALS'
  | 'STARTS_WITH'
  | 'ENDS_WITH'
  | 'CONTAINS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'GREATER_THAN_EQ'
  | 'LESS_THAN_EQ'
  | 'QUERY';

export const FilterType = {
  NOT_EQUALS: 'NOT_EQUALS' as FilterType,
  EQUALS: 'EQUALS' as FilterType,
  STARTS_WITH: 'STARTS_WITH' as FilterType,
  ENDS_WITH: 'ENDS_WITH' as FilterType,
  CONTAINS: 'CONTAINS' as FilterType,
  GREATER_THAN: 'GREATER_THAN' as FilterType,
  LESS_THAN: 'LESS_THAN' as FilterType,
  GREATER_THAN_EQ: 'GREATER_THAN_EQ' as FilterType,
  LESS_THAN_EQ: 'LESS_THAN_EQ' as FilterType,
  AND: 'AND' as FilterType,
  OR: 'OR' as FilterType,
  QUERY: 'QUERY' as FilterType
};

export class Filter {
  type: FilterType;
  fieldName: string;
  value: any;
  children: Array<Filter> = [];

  constructor(
    type: FilterType,
    fieldName: string,
    value: any,
    children: Array<Filter> = [],
  ) {
    this.type = type;
    this.fieldName = fieldName;
    this.value = value;
    this.children = children;
  }
}

export default ApiService;
