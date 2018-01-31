export type SongType = 'YOUTUBE' | 'SPOTIFY';

export const SongType = {
  YOUTUBE: 'YOUTUBE' as SongType,
  SPOTIFY: 'SPOTIFY' as SongType,
};

export class FavouriteSong {
  id: number;
  type: SongType;
  songId: string;
  artist: string;
  title: string;
  album: string;
  uri: string;
  thumbnail: string;
  duration: number;
  uploadedBy: string;
}
