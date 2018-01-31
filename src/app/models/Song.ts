export class Song {
  id: string;
  artist: string;
  title: string;
  album: string;
  uri: string;
  thumbnail: string;
  duration: number;
  uploadedBy: string;


  constructor(id: string, artist: string, title: string, album: string, uri: string, thumbnail: string, duration: number, uploadedBy: string) {
    this.id = id;
    this.artist = artist;
    this.title = title;
    this.album = album;
    this.uri = uri;
    this.thumbnail = thumbnail;
    this.duration = duration;
    this.uploadedBy = uploadedBy;
  }
}
