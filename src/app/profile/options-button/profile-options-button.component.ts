import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { BackendApiService } from 'src/lib/services/backend-api';
import { Subscription, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { FollowChangeObservableResult } from 'src/lib/observable-results/follow-change-observable-result';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { FollowButtonComponent } from 'src/lib/controls/follow-button/follow-button.component';
import { Router } from '@angular/router';
@Component({
  selector: 'profile-options-button',
  templateUrl: './profile-options-button.component.html',
})
export class ProfileOptionsButtonComponent {
  
  @Input() profile: any;

  // emits the UserUnblocked event
  @Output() userUnblocked = new EventEmitter();

  // emits the UserUnblocked event
  @Output() userBlocked = new EventEmitter();

  AppRoutingModule = AppRoutingModule;
  globalVars: GlobalVarsService;
  publicKeyIsCopied = false;

  constructor(
    private _globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private router: Router
  ) {
    this.globalVars = _globalVars;
  }

  profileBelongsToLoggedInUser(): boolean {
    return (
      this.globalVars.loggedInUser?.ProfileEntryResponse &&
      this.globalVars.loggedInUser.ProfileEntryResponse.PublicKeyBase58Check ===
        this.profile.PublicKeyBase58Check
    );
  }

  unblock() {
    this.userUnblocked.emit(this.profile.PublicKeyBase58Check);
  }

  block() {
    this.userBlocked.emit(this.profile.PublicKeyBase58Check);
  }

  messageUser(): void {
    this.router.navigate(['/' + this.globalVars.RouteNames.INBOX_PREFIX], {
      queryParams: { username: this.profile.Username },
      queryParamsHandling: 'merge',
    });
  }

  _copyPublicKey() {
    this.globalVars._copyText(this.profile.PublicKeyBase58Check);
    this.publicKeyIsCopied = true;
    setInterval(() => {
      this.publicKeyIsCopied = false;
    }, 1000);
  }

  _isLoggedInUserFollowing() {
    if (!this.globalVars.loggedInUser?.PublicKeysBase58CheckFollowedByUser) {
      return false;
    }

    return this.globalVars.loggedInUser.PublicKeysBase58CheckFollowedByUser.includes(
      this.profile.PublicKeyBase58Check
    );
  }
}
