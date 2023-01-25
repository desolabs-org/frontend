import { User } from 'src/lib/services/backend-api';

export class LoggedInUserObservableResult {
  public loggedInUser: User;

  // Does this user have the same pubkey as the previous user?
  public isSameUserAsBefore: boolean;
}
