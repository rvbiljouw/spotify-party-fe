export class UserAccount {
  id: number;
  displayName: string;
  displayPicture: string;
  loginToken: LoginToken;
  hasSpotify: boolean;
  created: Date;
  updated: Date;
}

export class LoginToken {
  id: number;
  account: UserAccount;
  token: string;
}
