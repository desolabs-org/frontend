import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  BackendApiService,
  ProfileEntryResponse,
} from 'src/lib/services/backend-api';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { SwalHelper } from 'src/lib/helpers/swal-helper';
import { ProfileTopCardComponent } from './top-card/profile-top-card.component';
import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'profile-page',
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent implements OnInit {
  @ViewChild(ProfileTopCardComponent, { static: false })
  childTopCardComponent;

  appData: GlobalVarsService;
  userName: string;
  profile: ProfileEntryResponse;
  activeTab: string;
  loading: boolean;

  @Output() userUnblocked = new EventEmitter();

  constructor(
    private globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private location: Location,
    private titleService: Title
  ) {
    this.activeTab = 'Posts';
    this.route.params.subscribe((params) => {
      this.userName = params.username;
    });
  }

  ngOnInit() {
    this.titleService.setTitle(this.userName + ` on ${environment.node.name}`);
    this._refreshContent();
  }

  unblock() {
    SwalHelper.fire({
      target: this.globalVars.getTargetComponentSelector(),
      title: 'Unblock user',
      html: `This user will appear in your feed and on your threads again`,
      showCancelButton: true,
      customClass: {
        confirmButton: 'btn btn-light',
        cancelButton: 'btn btn-light no',
      },
      reverseButtons: true,
    }).then((response: any) => {
      this.userUnblocked.emit(this.profile.PublicKeyBase58Check);
      if (response.isConfirmed) {
        delete this.globalVars.loggedInUser.BlockedPubKeys[
          this.profile.PublicKeyBase58Check
        ];
        this.backendApi
          .BlockPublicKey(
            this.globalVars.localNode,
            this.globalVars.loggedInUser.PublicKeyBase58Check,
            this.profile.PublicKeyBase58Check,
            true /* unblock */
          )
          .subscribe(
            () => {
              this.globalVars.logEvent('user : unblock');
            },
            (err) => {
              console.log(err);
              const parsedError = this.backendApi.stringifyError(err);
              this.globalVars.logEvent('user : unblock : error', {
                parsedError,
              });
              this.globalVars._alertError(parsedError);
            }
          );
      }
    });
  }

  _isLoggedInUserFollowing() {
    if (!this.appData.loggedInUser?.PublicKeysBase58CheckFollowedByUser) {
      return false;
    }

    return this.appData.loggedInUser.PublicKeysBase58CheckFollowedByUser.includes(
      this.profile.PublicKeyBase58Check
    );
  }

  block() {
    SwalHelper.fire({
      target: this.globalVars.getTargetComponentSelector(),
      title: 'Block user?',
      html: `This will hide all comments from this user on your posts as well as hide them from your view on other threads.`,
      showCancelButton: true,
      customClass: {
        confirmButton: 'btn btn-light',
        cancelButton: 'btn btn-light no',
      },
      reverseButtons: true,
    }).then((response: any) => {
      if (response.isConfirmed) {
        this.globalVars.loggedInUser.BlockedPubKeys[
          this.profile.PublicKeyBase58Check
        ] = {};
        Promise.all([
          this.backendApi
            .BlockPublicKey(
              this.globalVars.localNode,
              this.globalVars.loggedInUser.PublicKeyBase58Check,
              this.profile.PublicKeyBase58Check
            )
            .subscribe(
              () => {
                this.globalVars.logEvent('user : block');
              },
              (err) => {
                console.error(err);
                const parsedError = this.backendApi.stringifyError(err);
                this.globalVars.logEvent('user : block : error', {
                  parsedError,
                });
                this.globalVars._alertError(parsedError);
              }
            ),
          // Unfollow this profile if we are currently following it.
          this.childTopCardComponent._unfollowIfBlocked(),
        ]);
      }
    });
  }

  _refreshContent() {
    if (this.loading) {
      return;
    }

    let readerPubKey = '';
    if (this.globalVars.loggedInUser) {
      readerPubKey = this.globalVars.loggedInUser.PublicKeyBase58Check;
    }

    this.loading = true;
    this.backendApi
      .GetSingleProfile(this.globalVars.localNode, '', this.userName)
      .subscribe(
        (res) => {
          if (!res || res.IsBlacklisted) {
            this.loading = false;
            this.router.navigateByUrl('/' + this.appData.RouteNames.NOT_FOUND, {
              skipLocationChange: true,
            });
            return;
          }
          this.profile = res.Profile;
          this.loading = false;
        },
        (_) => {
          this.loading = false;
        }
      );
  }

  _handleTabClick(tabName: string) {
    this.activeTab = tabName;
  }

  showProfileAsReserved() {
    return this.profile.IsReserved && !this.profile.IsVerified;
  }

  isPubKeyBalanceless(): boolean {
    return (
      !this.globalVars.loggedInUser?.ProfileEntryResponse?.Username &&
      this.globalVars.loggedInUser?.UsersYouHODL?.length === 0
    );
  }
}
