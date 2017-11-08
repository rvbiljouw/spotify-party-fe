import {Party} from "./Party";
import {UserAccount} from "./UserAccount";

export class SpotifyAccount {
  id: number;
  spotifyId: string;
  activeParty: Party;
  account: UserAccount;
  displayName: string;
  accessToken: string;
  refreshToken: string;
  device: string;
  created: Date;
  updated: Date;
}
