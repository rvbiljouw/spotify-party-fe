import {Album} from './Album';
import {Artist} from './Artist';

export class Song {
  id: string;
  href: string;
  name: string;
  uri: string;
  album: Album;
  artists: Array<Artist>;
  markets: Array<string>;
  duration: number;
  explicit: boolean;
  ids: any;
  urls: any;
  popularity: number;
  discNumber: number;
  previewUrl: string;
  trackNumber: number;
}
