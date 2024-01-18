import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router, Scroll } from '@angular/router';
import { ViewportScroller } from '@angular/common';

import { filter } from 'rxjs/operators';

import { LandingPageComponent } from './static-content/landing/page/landing-page.component';
import { LandingIndexComponent } from './static-content/landing/index/landing-index.component';
import { LandingAwardsComponent } from './static-content/landing/awards/landing-awards.component';
import { LandingHackathonsComponent } from './static-content/landing/hackathons/landing-hackathons.component';

import { TosPageComponent } from './static-content/tos-page/tos-page.component';
import { SupplyMonitoringStatsPageComponent } from './static-content/supply-monitoring-stats-page/supply-monitoring-stats-page.component';

import { NotFoundPageComponent } from './static-content/not-found-page/not-found-page.component';


import { FeedPageComponent } from './feed/page/feed-page.component';
import { PostThreadPageComponent } from './post/thread-page/post-thread-page.component';
import { CreatePostPageComponent } from './post/create-post-page/create-post-page.component';

import { NotificationsPageComponent } from './notifications/notifications-page.component';
import { MessagesPageComponent } from './messages/page/messages-page.component';
import { ProfilePageComponent } from './profile/profile-page.component';
import { UpdateProfilePageComponent } from './profile/update/update-profile-page.component';

import { WalletPageComponent } from './wallet/page/wallet-page.component';

import { SettingsPageComponent } from './settings/settings-page.component';
import { AdminPageComponent } from './admin/page/admin-page.component';

import { CommunityPageComponent } from './community/community-page.component';

import { CoinsPageComponent } from './coins/coins-page.component';

import { TransferDeSoPageComponent } from './wallet/transfer-deso-page/transfer-deso-page.component';

import { NftPostPageComponent } from './nft/nft-post-page/nft-post-page.component';
import { TokensPageComponent } from './tokens/page/tokens-page.component';

class RouteNames {
  public static LANDING = 'landing';
  public static LANDING_HACKATHONS = 'landing/hackathons';
  public static LANDING_AWARDS = 'landing/awards';

  public static NOT_FOUND = '404';

  // Not sure if we should have a smarter schema for this, e.g. what happens if we have
  //   1. /:username/following
  //   2. /some/other/path/following
  // and we want to rename (1) but not (2) ?

  // /:username/following
  public static FOLLOWING = 'following';

  // /:username/followers
  public static FOLLOWERS = 'followers';

  public static FEEDS = 'feeds';
  public static BUY_DESO = 'buy-deso';
  public static WALLET = 'wallet';
  public static SETTINGS = 'settings';
  public static USER_PREFIX = 'u';
  public static INBOX_PREFIX = 'inbox';
  public static TRANSFER_CREATOR = 'transfer';
  public static BUY_CREATOR = 'buy';
  public static SELL_CREATOR = 'sell';
  public static UPDATE_PROFILE = 'update-profile';
  public static NOTIFICATIONS = 'notifications';
  public static POSTS = 'posts';
  public static SEND_DESO = 'send-deso';
  // TODO: how do I make this /posts/new?
  public static CREATE_POST = 'posts/new';
  
  public static TOS = 'terms-of-service';
  public static ADMIN = 'admin';
  public static NFT = 'nft';

  public static CREATE_PROFILE = 'create-profile';
  public static INVEST = 'invest';
  public static SUPPLY_STATS = 'supply-stats';
  public static TOKENS = 'tokens';
}

const routes: Routes = [
  { path: '', component: LandingIndexComponent, pathMatch: 'full' },
  { path: RouteNames.LANDING, component: LandingPageComponent, pathMatch: 'full' },
  
  { path: RouteNames.LANDING_HACKATHONS, component: LandingHackathonsComponent, pathMatch: 'full' },
  { path: RouteNames.LANDING_AWARDS, component: LandingAwardsComponent, pathMatch: 'full' },
  { path: RouteNames.FEEDS, component: FeedPageComponent, pathMatch: 'full' },
  {
    path: RouteNames.USER_PREFIX + '/:username',
    component: ProfilePageComponent,
    pathMatch: 'full',
  },
  {
    path: RouteNames.SETTINGS,
    component: SettingsPageComponent,
    pathMatch: 'full',
  },
  {
    path: RouteNames.INBOX_PREFIX,
    component: MessagesPageComponent,
    pathMatch: 'full',
  },
  {
    path: RouteNames.WALLET,
    component: WalletPageComponent,
    pathMatch: 'full',
  },
  {
    path: RouteNames.UPDATE_PROFILE,
    component: UpdateProfilePageComponent,
    pathMatch: 'full',
  },
  {
    path: RouteNames.NOTIFICATIONS,
    component: NotificationsPageComponent,
    pathMatch: 'full',
  },
  {
    path: RouteNames.NOT_FOUND,
    component: NotFoundPageComponent,
    pathMatch: 'full',
  },
  // CREATE_POST needs to be above the POSTS route, since both involve the prefix /posts
  // if CREATOR_POST is second, then it's route (/posts/new/) will get matched to POSTS instead
  {
    path: RouteNames.CREATE_POST,
    component: CreatePostPageComponent,
    pathMatch: 'full',
  },
  {
    path: RouteNames.POSTS + '/:postHashHex',
    component: PostThreadPageComponent,
    pathMatch: 'full',
  },
  {
    path: RouteNames.NFT + '/:postHashHex',
    component: NftPostPageComponent,
    pathMatch: 'full',
  },
  {
    path: RouteNames.SEND_DESO,
    component: TransferDeSoPageComponent,
    pathMatch: 'full',
  },
  { path: RouteNames.TOKENS, component: TokensPageComponent, pathMatch: 'full' },
  { path: RouteNames.TOS, component: TosPageComponent, pathMatch: 'full' },
  { path: 'tos', component: TosPageComponent, pathMatch: 'full' },
  { path: RouteNames.ADMIN, component: AdminPageComponent, pathMatch: 'full' },
  {
    path: RouteNames.USER_PREFIX + '/:username/' + RouteNames.FOLLOWERS,
    component: CommunityPageComponent,
    pathMatch: 'full',
  },
  {
    path: RouteNames.USER_PREFIX + '/:username/' + RouteNames.FOLLOWING,
    component: CommunityPageComponent,
    pathMatch: 'full',
  },
  {
    path: RouteNames.USER_PREFIX + '/:username/:tradeType',
    component: CoinsPageComponent,
    pathMatch: 'full',
  },
  {
    path: RouteNames.SUPPLY_STATS,
    component: SupplyMonitoringStatsPageComponent,
    pathMatch: 'full',
  },
  
  { path: 'hackathon/2022', component: LandingHackathonsComponent, pathMatch: 'full' }, // this is for compatibility of old links
  { path: 'browse', component: FeedPageComponent, pathMatch: 'full' }, // this is for backwards compatibility
  
  // This NotFound route must be the last one as it catches all paths that were not matched above.
  { path: '**', component: NotFoundPageComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
class AppRoutingModule {
  // restore scroll position on navigation
  // we need the 100ms delay because it takes a hot sec to re-render the feed
  // angular doesn't handle scroll resuming correctly: https://github.com/angular/angular/issues/24547
  constructor(router: Router, viewportScroller: ViewportScroller) {
    router.events
      .pipe(filter((e): e is Scroll => e instanceof Scroll))
      .subscribe((e) => {
        if (e.position) {
          // backward navigation
          setTimeout(() => viewportScroller.scrollToPosition(e.position), 100);
        } else if (e.anchor) {
          // anchor navigation
          setTimeout(() => viewportScroller.scrollToAnchor(e.anchor), 100);
        } else {
          // forward navigation
          setTimeout(() => viewportScroller.scrollToPosition([0, 0]), 100);
        }
      });
  }

  static transferCreatorPath(username: string): string {
    return ['', RouteNames.USER_PREFIX, username, RouteNames.TRANSFER_CREATOR,].join('/');
  }

  static buyCreatorPath(username: string): string {
    return ['', RouteNames.USER_PREFIX, username, RouteNames.BUY_CREATOR].join('/');
  }

  static sellCreatorPath(username: string): string {
    return ['', RouteNames.USER_PREFIX, username, RouteNames.SELL_CREATOR].join('/');
  }

  static profilePath(username: string): string {
    return ['', RouteNames.USER_PREFIX, username].join('/');
  }

  static userFollowingPath(username: string): string {
    return ['', RouteNames.USER_PREFIX, username, RouteNames.FOLLOWING].join('/');
  }

  static userFollowersPath(username: string): string {
    return ['', RouteNames.USER_PREFIX, username, RouteNames.FOLLOWERS].join('/');
  }

  static postPath(postHashHex: string): string {
    return ['', RouteNames.POSTS, postHashHex].join('/');
  }
}

export { RouteNames, AppRoutingModule };
