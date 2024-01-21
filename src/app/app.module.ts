import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { RatingModule } from 'ngx-bootstrap/rating';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BackendApiService } from 'src/lib/services/backend-api';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { IdentityService } from 'src/lib/services/identity';

import { AvatarDirective } from 'src/lib/helpers/avatar.directive';
import { UploadDirective } from 'src/lib/helpers/upload.directive';

import { SimpleCenterLoaderComponent } from 'src/lib/controls/simple-center-loader/simple-center-loader.component';
import { ChangeAccountSelectorComponent } from 'src/lib/controls/change-account-selector/change-account-selector.component';
import { FollowButtonComponent } from 'src/lib/controls/follow-button/follow-button.component';
import { SearchBarComponent } from 'src/lib/controls/search-bar/search-bar.component';
import { SimpleProfileCardComponent } from 'src/lib/controls/simple-profile-card/simple-profile-card.component';
import { TabSelectorComponent } from 'src/lib/controls/tab-selector/tab-selector.component';

import { TermsOfServiceComponent } from './static-content/tos-page/terms-of-service/terms-of-service.component';
import { NotFoundPageComponent } from './static-content/not-found-page/not-found-page.component';
import { NotFoundComponent } from './static-content/not-found-page/not-found/not-found.component';
import { TosPageComponent } from './static-content/tos-page/tos-page.component';
import { SupplyMonitoringStatsPageComponent } from './static-content/supply-monitoring-stats-page/supply-monitoring-stats-page.component';
import { SupplyMonitoringStatsComponent } from './static-content/supply-monitoring-stats-page/supply-monitoring-stats/supply-monitoring-stats.component';

import { LandingPageComponent } from './static-content/landing/page/landing-page.component';
import { LandingIndexComponent } from './static-content/landing/index/landing-index.component';
import { LandingTopBarComponent } from './static-content/landing/top-bar/landing-top-bar.component';
import { LandingAwardsComponent } from './static-content/landing/awards/landing-awards.component';
import { LandingHackathonsComponent } from './static-content/landing/hackathons/landing-hackathons.component';

import { SidebarComponent } from './app-page/sidebar/sidebar.component';
import { LeftBarComponent } from './app-page/left-bar/left-bar.component';
import { LeftBarButtonComponent } from './app-page/left-bar/button/left-bar-button.component';
import { LeftBarMobileComponent } from './app-page/left-bar/mobile/left-bar-mobile.component';
import { SidebarLeaderboardComponent } from './app-page/sidebar/sidebar-leaderboard/sidebar-leaderboard.component';
import { BottomBarMobileComponent } from './app-page/bottom-bar-mobile/bottom-bar-mobile.component';
import { BottomBarMobileTabComponent } from './app-page/bottom-bar-mobile/bottom-bar-mobile-tab/bottom-bar-mobile-tab.component';
import { TopBarMobileNavigationControlComponent } from './app-page/top-bar-mobile/navigation-control/top-bar-mobile-navigation-control.component';
import { TopBarMobileLogInOrSignUpComponent } from './app-page/top-bar-mobile/log-in-or-sign-up/top-bar-mobile-log-in-or-sign-up.component';
import { TopBarMobileHamburgerMenuComponent } from './app-page/top-bar-mobile/hamburger-menu/top-bar-mobile-hamburger-menu.component';

import { CommunityPageComponent } from './community/community-page.component';

import { FeedPageComponent } from './feed/page/feed-page.component';
import { FeedComponent } from './feed/feed.component';
import { FeedCreatePostComponent } from './feed/create-post/feed-create-post.component';

import { FeedPostComponent } from './post/post.component';
import { CreatePostPageComponent } from './post/create-post-page/create-post-page.component';
import { CreatePostFormComponent } from './post/create-post-page/create-post-form/create-post-form.component';
import { CommentModalComponent } from './post/comment-modal/comment-modal.component';
import { DiamondsModalComponent } from './post/diamonds-modal/diamonds-modal.component';
import { FeedPostDropdownComponent } from './post/dropdown/post-dropdown.component';
import { PostMultiplierComponent } from "./post/dropdown/post-multiplier/post-multiplier.component";
import { FeedPostIconRowComponent } from './post/icon-row/post-icon-row.component';
import { LikesModalComponent } from './post/likes-modal/likes-modal.component';
import { QuoteRepostsModalComponent } from './post/quote-reposts-modal/quote-reposts-modal.component';
import { RepostsModalComponent } from './post/reposts-modal/reposts-modal.component';
import { PostThreadPageComponent } from './post/thread-page/post-thread-page.component';
import { PostThreadComponent } from './post/thread-page/post-thread/post-thread.component';

import { WalletComponent } from './wallet/wallet.component';
import { WalletActionsDropdownComponent } from './wallet/actions-dropdown/wallet-actions-dropdown.component';
import { WalletPageComponent } from './wallet/page/wallet-page.component';
import { OwnedCreatorCoinsListComponent } from './wallet/owned-creator-coins-list/owned-creator-coins-list.component';
import { OwnedTokensListComponent } from './wallet/owned-tokens-list/owned-tokens-list.component';
import { OwnedNftsListComponent } from './wallet/owned-nfts-list/owned-nfts-list.component';
import { TransferDeSoPageComponent } from './wallet/transfer-deso-page/transfer-deso-page.component';
import { TransferDeSoComponent } from './wallet/transfer-deso-page/transfer-deso/transfer-deso.component';


import { SettingsPageComponent } from './settings/settings-page.component';

import { ProfilePageComponent } from './profile/profile-page.component';
import { ProfileHodlersComponent } from './profile/hodlers/profile-hodlers.component';
import { ProfilePostsComponent } from './profile/posts/profile-posts.component';
import { ProfileTopCardComponent } from './profile/top-card/profile-top-card.component';
import { UpdateProfilePageComponent } from './profile/update/update-profile-page.component';
import { UpdateTokenSettingsComponent } from './profile/update/token-settings/update-token-settings.component';
import { ProfileDiamondsComponent } from './profile/diamonds/profile-diamonds.component';
import { ProfileNftsComponent } from './profile/nfts/profile-nfts.component';
import { ProfileOptionsButtonComponent } from './profile/options-button/profile-options-button.component';

import { CoinsPageComponent } from './coins/coins-page.component';
import { CoinsFormComponent } from './coins/form/coins-form.component';
import { CoinsPreviewComponent } from './coins/preview/coins-preview.component';
import { CoinsCompleteComponent } from './coins/complete/coins-complete.component';
import { CoinsTableComponent } from './coins/table/coins-table.component';
import { CoinsLoggedOutComponent } from './coins/logged-out/coins-logged-out.component';

import { MessageComponent } from './messages/message/message.component';
import { MessagesPageComponent } from './messages/page/messages-page.component';
import { MessagesInboxComponent } from './messages/inbox/messages-inbox.component';
import { MessagesThreadComponent } from './messages/thread/messages-thread.component';
import { MessagesThreadViewComponent } from './messages/thread-view/messages-thread-view.component';
import { MessagesFilterMenuComponent } from './messages/inbox/filter-menu/messages-filter-menu.component';

import { NetworkInfoComponent } from './admin/network-info/network-info.component';
import { SanitizeAndAutoLinkPipe } from '../lib/pipes/sanitize-and-auto-link-pipe';
import { SanitizeEmbedPipe } from '../lib/pipes/sanitize-embed-pipe';
import { NotificationsPageComponent } from './notifications/notifications-page.component';

import { AppPageComponent } from './app-page/app-page.component';

import { SanitizeQRCodePipe } from '../lib/pipes/sanitize-qrcode-pipe';

import { MintNftModalComponent } from './nft/mint-nft-modal/mint-nft-modal.component';
import { CreateNftAuctionModalComponent } from './nft/create-nft-auction-modal/create-nft-auction-modal.component';
import { BidPlacedModalComponent } from './nft/bid-placed-modal/bid-placed-modal.component';
import { PlaceBidModalComponent } from './nft/place-bid-modal/place-bid-modal.component';
import { NftSoldModalComponent } from './nft/nft-sold-modal/nft-sold-modal.component';
import { NftModalHeaderComponent } from './nft/nft-modal-header/nft-modal-header.component';
import { CloseNftAuctionModalComponent } from './nft/close-nft-auction-modal/close-nft-auction-modal.component';
import { SellNftModalComponent } from './nft/sell-nft-modal/sell-nft-modal.component';
import { AddUnlockableModalComponent } from './nft/add-unlockable-modal/add-unlockable-modal.component';
import { NftPostPageComponent } from './nft/nft-post-page/nft-post-page.component';
import { NftPostComponent } from './nft/nft-post-page/nft-post/nft-post.component';
import { NftDropMgrComponent } from './nft/nft-drop-mgr/nft-drop-mgr.component';
import { NftShowcaseComponent } from './nft/nft-showcase/nft-showcase.component';
import { TransferNftModalComponent } from './nft/transfer-nft-modal/transfer-nft-modal.component';
import { TransferNftAcceptModalComponent } from './nft/transfer-nft-accept-modal/transfer-nft-accept-modal.component';
import { NftBurnModalComponent } from './nft/nft-burn-modal/nft-burn-modal.component';
import { NftSelectSerialNumberComponent } from './nft/nft-select-serial-number/nft-select-serial-number.component';

import { SanitizeVideoUrlPipe } from 'src/lib/pipes/sanitize-video-url-pipe';

import { TokensComponent } from './tokens/tokens.component';
import { TokensPageComponent } from './tokens/page/tokens-page.component';
import { TokenTransferModalComponent } from './tokens/transfer-modal/token-transfer-modal.component';
import { TokenBurnModalComponent } from './tokens/burn-modal/token-burn-modal.component';

import { AdminPageComponent } from './admin/page/admin-page.component';
import { AdminComponent } from './admin/admin.component';
import { AdminNodeFeesComponent } from './admin/node-fees/admin-node-fees.component';
import { AdminNodeAddFeesComponent } from './admin/node-fees/add-fees/admin-node-add-fees.component';

// Modular Themes for DeSo by Carsen Klock @carsenk
import { ThemeModule } from "src/lib/theme/theme.module";
import { Theme } from "src/lib/theme/symbols";
import { TextFieldModule } from "@angular/cdk/text-field";
import { DragDropModule } from '@angular/cdk/drag-drop';

const lightTheme: Theme = { key: "light", name: "Light Theme" };
const icydarkTheme: Theme = { key: "icydark", name: "Icy Dark Theme" };
const cakeTheme: Theme = { key: "cake", name: "Cake Theme" };
const coderTheme: Theme = { key: "coder", name: "Coder Theme" };

@NgModule({
  declarations: [
    AppComponent,

    LandingPageComponent,
    LandingIndexComponent,
    LandingTopBarComponent,
    LandingAwardsComponent,
    LandingHackathonsComponent,

    AdminPageComponent,
    AdminComponent,
    AdminNodeFeesComponent,
    AdminNodeAddFeesComponent,

    UploadDirective,
    TermsOfServiceComponent,
    CommunityPageComponent,
    FollowButtonComponent,
    NotFoundPageComponent,
    FeedPageComponent,
    FeedComponent,
    LeftBarComponent,
    SidebarComponent,
    SidebarLeaderboardComponent,
    FeedCreatePostComponent,
    FeedPostComponent,
    FeedPostDropdownComponent,
    FeedPostIconRowComponent,
    WalletComponent,
    MessagesPageComponent,
    SettingsPageComponent,
    ProfilePageComponent,
    ProfileHodlersComponent,
    ProfilePostsComponent,
    TabSelectorComponent,
    ProfileTopCardComponent,
    ProfileDiamondsComponent,
    ProfileNftsComponent,
    ProfileOptionsButtonComponent,
    LeftBarButtonComponent,
    CoinsPageComponent,
    CoinsTableComponent,
    CoinsFormComponent,
    CoinsPreviewComponent,
    CoinsCompleteComponent,
    CoinsLoggedOutComponent,
    UpdateProfilePageComponent,
    NotificationsPageComponent,
    SearchBarComponent,
    SimpleCenterLoaderComponent,
    ChangeAccountSelectorComponent,
    PostThreadPageComponent,
    PostThreadComponent,
    BottomBarMobileComponent,
    LeftBarMobileComponent,
    TransferDeSoPageComponent,
    TransferDeSoComponent,
    MessagesInboxComponent,
    MessagesThreadComponent,
    MessageComponent,
    MessagesThreadViewComponent,
    TopBarMobileNavigationControlComponent,
    BottomBarMobileTabComponent,
    NotFoundComponent,
    CreatePostPageComponent,
    CreatePostFormComponent,
    TopBarMobileLogInOrSignUpComponent,
    TopBarMobileHamburgerMenuComponent,
    TosPageComponent,
    NetworkInfoComponent,
    SanitizeAndAutoLinkPipe,
    SanitizeEmbedPipe,
    AppPageComponent,
    CommentModalComponent,
    WalletActionsDropdownComponent,
    DiamondsModalComponent,
    RepostsModalComponent,
    QuoteRepostsModalComponent,
    LikesModalComponent,
    SimpleProfileCardComponent,
    MessagesFilterMenuComponent,
    AvatarDirective,
    SanitizeQRCodePipe,
    MintNftModalComponent,
    CreateNftAuctionModalComponent,
    BidPlacedModalComponent,
    PlaceBidModalComponent,
    NftSoldModalComponent,
    NftModalHeaderComponent,
    CloseNftAuctionModalComponent,
    SellNftModalComponent,
    AddUnlockableModalComponent,
    NftPostPageComponent,
    NftPostComponent,
    NftDropMgrComponent,
    NftShowcaseComponent,
    WalletPageComponent,
    OwnedCreatorCoinsListComponent,
    OwnedTokensListComponent,
    OwnedNftsListComponent,
    SanitizeVideoUrlPipe,
    PostMultiplierComponent,
    SupplyMonitoringStatsPageComponent,
    SupplyMonitoringStatsComponent,
    TransferNftAcceptModalComponent,
    TransferNftModalComponent,
    NftBurnModalComponent,
    NftSelectSerialNumberComponent,
    UpdateTokenSettingsComponent,
    TokensComponent,
    TokensPageComponent,
    TokenTransferModalComponent,
    TokenBurnModalComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TextFieldModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    DragDropModule,
    BsDropdownModule.forRoot(),
    PopoverModule.forRoot(),
    RatingModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    CollapseModule.forRoot(),
    ThemeModule.forRoot({
      themes: [lightTheme, icydarkTheme, cakeTheme, coderTheme],
      active:
        localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "coder"),
    }),
  ],
  providers: [BackendApiService, GlobalVarsService, BsModalService, IdentityService],
  bootstrap: [AppComponent],
})
export class AppModule {
}
