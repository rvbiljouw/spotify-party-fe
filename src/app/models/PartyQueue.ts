import {Party} from "./Party";
import {UserAccount} from "./UserAccount";

export class PartyQueue {
  nowPlaying: PartyQueueEntry = new PartyQueueEntry();
  party: Party = new Party();
  entries: Array<PartyQueueEntry> = [];
}

export class PartyQueueEntry {
  id: number;
  party: Party;
  member: UserAccount;
  artist: string;
  title: string;
  thumbnail: string;
  uri: string;
  votes: number;
  upvotes: number;
  downvotes: number;
  votesToSkip: number;
  status: string;
  playedAt: number;
  duration: number;
  created: Date;
  updated: Date;
}
