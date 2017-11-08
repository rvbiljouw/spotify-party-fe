import {SpotifyAccount} from "./SpotifyAccount";
import {Achievment} from "./Achievment";

export type SubscriptionType = "FREE" | "PREMIUM";
export const SubscriptionType = {
  FREE: "FREE" as SubscriptionType,
  PREMIUM: "PREMIUM" as SubscriptionType,
};

export type AccountType = "REGULAR" | "STAFF" | "BOT";
export const AccountType = {
  REGULAR: "REGULAR" as AccountType,
  STAFF: "STAFF" as AccountType,
  BOT: "BOT" as AccountType
};

export class UserAccount {
  id: number;
  accountType: AccountType;
  achievments: Achievment[];
  email: string;
  displayName: string;
  displayPicture: string;
  loginToken: LoginToken;
  hasSpotify: boolean;
  spotify: SpotifyAccount;
  created: Date;
  updated: Date;
}

export class LoginToken {
  id: number;
  account: UserAccount;
  token: string;
}
