import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GlobalVarsService } from '../global-vars.service';
import { AppRoutingModule, RouteNames } from '../app-routing.module';
import {
  BackendApiService,
  BalanceEntryResponse,
  TutorialStatus,
} from '../backend-api.service';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { InfiniteScroller } from '../infinite-scroller';
import { IAdapter, IDatasource } from 'ngx-ui-scroll';
import { Subscription } from 'rxjs';
import { SwalHelper } from '../../lib/helpers/swal-helper';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'wallet',
  templateUrl: './wallet.component.html',
})
export class WalletComponent implements OnInit, OnDestroy {
  static PAGE_SIZE = 20;
  static BUFFER_SIZE = 10;
  static WINDOW_VIEWPORT = true;
  static PADDING = 0.5;

  @Input() inTutorial: boolean;

  globalVars: GlobalVarsService;
  AppRoutingModule = AppRoutingModule;
  hasUnminedCreatorCoins: boolean;

  sortedUSDValueFromHighToLow: number = 0;
  sortedPriceFromHighToLow: number = 0;
  sortedUsernameFromHighToLow: number = 0;

  creatorCoins: BalanceEntryResponse[] = [];

  static creatorCoinsTab: string = 'Coins';
  static daoCoinsTab: string = 'Tokens';
  static NftsTab: string = 'NFTs';
  tabs = [WalletComponent.creatorCoinsTab, WalletComponent.daoCoinsTab, WalletComponent.NftsTab];
  activeTab: string = WalletComponent.creatorCoinsTab;
  tutorialUsername: string;
  tutorialStatus: TutorialStatus;
  TutorialStatus = TutorialStatus;
  balanceEntryToHighlight: BalanceEntryResponse;

  nextButtonText: string;

  constructor(
    private appData: GlobalVarsService,
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
    private backendApi: BackendApiService
  ) {
    this.globalVars = appData;
    this.route.params.subscribe((params) => {
      if (params.username) {
        this.tutorialUsername = params.username.toLowerCase();
      }
    });
  }

  subscriptions = new Subscription();
  tutorialHeaderText: string = '';
  tutorialStepNumber: number;

  ngOnInit() {
    if (this.inTutorial) {
      this.tabs = [WalletComponent.creatorCoinsTab];
      this.tutorialStatus = this.globalVars.loggedInUser?.TutorialStatus;
      this.balanceEntryToHighlight = this.globalVars.loggedInUser?.UsersYouHODL.find(
        (balanceEntry) => {
          return (
            balanceEntry.ProfileEntryResponse.Username.toLowerCase() ===
            this.tutorialUsername
          );
        }
      );
      switch (this.tutorialStatus) {
        case TutorialStatus.INVEST_OTHERS_BUY: {
          this.tutorialHeaderText = 'Invest in a Creator';
          this.tutorialStepNumber = 1;
          this.nextButtonText = `Sell ${this.balanceEntryToHighlight.ProfileEntryResponse.Username} coins`;
          break;
        }
        case TutorialStatus.INVEST_OTHERS_SELL: {
          this.tutorialHeaderText = 'Sell a Creator';
          this.tutorialStepNumber = 2;
          this.nextButtonText = 'Setup your profile';
          break;
        }
        case TutorialStatus.INVEST_SELF: {
          this.tutorialHeaderText = 'Invest in Yourself';
          this.tutorialStepNumber = 4;
          this.nextButtonText = 'Give a diamond';
          break;
        }
      }
    }
    this.globalVars.loggedInUser.UsersYouHODL.map(
      (balanceEntryResponse: BalanceEntryResponse) => {
        if (balanceEntryResponse.NetBalanceInMempool != 0) {
          this.hasUnminedCreatorCoins = true;
        }
        
        this.creatorCoins.push(balanceEntryResponse);
      }
    );
    this.sortWallet('value');
    this._handleTabClick(WalletComponent.creatorCoinsTab);
    if (this.inTutorial) {
      this.subscriptions.add(
        this.datasource.adapter.lastVisible$.subscribe((lastVisible) => {
          // Last Item of myItems is Visible => data-padding-forward should be zero.
          if (lastVisible.$index === 0) {
            this.correctDataPaddingForwardElementHeight(
              lastVisible.element.parentElement
            );
          }
        })
      );
    }
    this.titleService.setTitle(`Wallet - ${environment.node.name}`);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Thanks to @brabenetz for the solution on forward padding with the ngx-ui-scroll component.
  // https://github.com/dhilt/ngx-ui-scroll/issues/111#issuecomment-697269318
  correctDataPaddingForwardElementHeight(viewportElement: HTMLElement): void {
    const dataPaddingForwardElement: HTMLElement = viewportElement.querySelector(
      `[data-padding-forward]`
    );
    if (dataPaddingForwardElement) {
      dataPaddingForwardElement.setAttribute('style', 'height: 0px;');
    }
  }

  // sort by USD value
  sortHodlingsCoins(
    hodlings: BalanceEntryResponse[],
    descending: boolean
  ): void {
    this.sortedUsernameFromHighToLow = 0;
    this.sortedPriceFromHighToLow = 0;
    this.sortedUSDValueFromHighToLow = descending ? -1 : 1;
    hodlings.sort((a: BalanceEntryResponse, b: BalanceEntryResponse) => {
      return (
        this.sortedUSDValueFromHighToLow *
        (this.globalVars.desoNanosYouWouldGetIfYouSold(
          a.BalanceNanos,
          a.ProfileEntryResponse.CoinEntry
        ) -
          this.globalVars.desoNanosYouWouldGetIfYouSold(
            b.BalanceNanos,
            b.ProfileEntryResponse.CoinEntry
          ))
      );
    });
  }

  // sort by coin price
  sortHodlingsPrice(
    hodlings: BalanceEntryResponse[],
    descending: boolean
  ): void {
    this.sortedUsernameFromHighToLow = 0;
    this.sortedPriceFromHighToLow = descending ? -1 : 1;
    this.sortedUSDValueFromHighToLow = 0;
    hodlings.sort((a: BalanceEntryResponse, b: BalanceEntryResponse) => {
      return (
        this.sortedPriceFromHighToLow *
        (a.ProfileEntryResponse.CoinEntry.DeSoLockedNanos -
          b.ProfileEntryResponse.CoinEntry.DeSoLockedNanos)
      );
    });
  }

  // sort by username
  sortHodlingsUsername(
    hodlings: BalanceEntryResponse[],
    descending: boolean
  ): void {
    this.sortedUsernameFromHighToLow = descending ? -1 : 1;
    this.sortedPriceFromHighToLow = 0;
    this.sortedUSDValueFromHighToLow = 0;
    hodlings.sort((a: BalanceEntryResponse, b: BalanceEntryResponse) => {
      return (
        this.sortedUsernameFromHighToLow *
        b.ProfileEntryResponse.Username.localeCompare(
          a.ProfileEntryResponse.Username
        )
      );
    });
  }

  sortWallet(column: string) {
    let descending: boolean;
    switch (column) {
      case 'username':
        // code block
        descending = this.sortedUsernameFromHighToLow !== -1;
        this.sortHodlingsUsername(this.creatorCoins, descending);
        break;
      case 'price':
        descending = this.sortedPriceFromHighToLow !== -1;
        this.sortHodlingsPrice(this.creatorCoins, descending);
        break;
      case 'value':
        descending = this.sortedUSDValueFromHighToLow !== -1;
        this.sortHodlingsCoins(this.creatorCoins, descending);
        break;
      default:
      // do nothing
    }
    this.scrollerReset();
  }

  totalValue() {
    let result = 0;

    for (const holding of this.globalVars.loggedInUser.UsersYouHODL) {
      result +=
        this.globalVars.desoNanosYouWouldGetIfYouSold(
          holding.BalanceNanos,
          holding.ProfileEntryResponse.CoinEntry
        ) || 0;
    }

    return result;
  }

  unminedDeSoToolTip() {
    return (
      'Mining in progress. Feel free to transact in the meantime.\n\n' +
      'Mined balance:\n' +
      this.globalVars.nanosToDeSo(
        this.globalVars.loggedInUser.BalanceNanos,
        9
      ) +
      ' DeSo.\n\n' +
      'Unmined balance:\n' +
      this.globalVars.nanosToDeSo(
        this.globalVars.loggedInUser.UnminedBalanceNanos,
        9
      ) +
      ' DeSo.'
    );
  }

  unminedCreatorCoinToolTip(creator: any) {
    return (
      'Mining in progress. Feel free to transact in the meantime.\n\n' +
      'Net unmined transactions:\n' +
      this.globalVars.nanosToDeSo(creator.NetBalanceInMempool, 9) +
      ' DeSo.\n\n' +
      'Balance w/unmined transactions:\n' +
      this.globalVars.nanosToDeSo(creator.BalanceNanos, 9) +
      ' DeSo.\n\n'
    );
  }

  usernameTruncationLength(): number {
    return this.globalVars.isMobile() ? 14 : 20;
  }

  usernameStyle() {
    return {
      'max-width': this.globalVars.isMobile() ? '100px' : '200px',
    };
  }

  emptyHodlerListMessage(): string {
    return "You don't hodl any creator coins... yet";
  }

  _handleTabClick(tab: string) {
    this.activeTab = tab;
    this.scrollerReset();
  }

  scrollerReset() {
    this.infiniteScroller.reset();
    this.datasource.adapter.reset().then(() => this.datasource.adapter.check());
  }

  isHighlightedCreator(balanceEntryResponse: BalanceEntryResponse): boolean {
    if (!this.inTutorial) {
      return false;
    }
    return (
      balanceEntryResponse.ProfileEntryResponse.Username.toLowerCase() ===
      this.balanceEntryToHighlight.ProfileEntryResponse.Username.toLowerCase()
    );
  }

  tutorialNext(): void {
    if (this.tutorialStatus === TutorialStatus.INVEST_OTHERS_BUY) {
      this.globalVars.logEvent('invest : others : buy : next');
      this.router.navigate([
        RouteNames.TUTORIAL,
        RouteNames.INVEST,
        RouteNames.SELL_CREATOR,
        this.tutorialUsername,
      ]);
    } else if (this.tutorialStatus === TutorialStatus.INVEST_OTHERS_SELL) {
      this.globalVars.logEvent('invest : others : sell : next');
      this.router.navigate([RouteNames.TUTORIAL, RouteNames.CREATE_PROFILE]);
    } else if (this.tutorialStatus === TutorialStatus.INVEST_SELF) {
      this.globalVars.logEvent('invest : self : buy : next');
      SwalHelper.fire({
        target: this.globalVars.getTargetComponentSelector(),
        icon: 'info',
        title: `Allow others to invest in your coin`,
        html: `Click "ok" to allow others to purchase your coin. You will earn 10% of every purchase.`,
        showCancelButton: true,
        showConfirmButton: true,
        focusConfirm: true,
        customClass: {
          confirmButton: 'btn btn-light',
          cancelButton: 'btn btn-light no',
        },
        confirmButtonText: 'Ok',
        cancelButtonText: 'No thank you',
        reverseButtons: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      })
        .then((res: any) => {
          if (res.isConfirmed) {
            return this.backendApi
              .UpdateProfile(
                environment.verificationEndpointHostname,
                this.globalVars.loggedInUser.PublicKeyBase58Check,
                '',
                '',
                '',
                '',
                10 * 100,
                1.25 * 100 * 100,
                false,
                this.globalVars.feeRateDeSoPerKB * 1e9 /*MinFeeRateNanosPerKB*/
              )
              .subscribe(
                () => {
                  this.globalVars.logEvent('set : founder-reward');
                },
                (err) => {
                  console.error(err);
                  const parsedError = this.backendApi.stringifyError(err);
                  this.globalVars.logEvent('set : founder-reward : error', {
                    parsedError,
                  });
                }
              );
          } else {
            this.globalVars.logEvent('set : founder-reward : skip');
          }
        })
        .finally(() =>
          this.router.navigate([RouteNames.TUTORIAL, RouteNames.DIAMONDS])
        );
    }
  }

  lastPage = null;
  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    WalletComponent.PAGE_SIZE,
    this.getPage.bind(this),
    WalletComponent.WINDOW_VIEWPORT,
    WalletComponent.BUFFER_SIZE,
    WalletComponent.PADDING
  );
  datasource: IDatasource<
    IAdapter<any>
  > = this.infiniteScroller.getDatasource();

  getPage(page: number) {
    if (this.lastPage != null && page > this.lastPage) {
      return [];
    }
    if (this.inTutorial) {
      this.lastPage = 0;
      return new Promise((resolve, reject) => {
        resolve([this.balanceEntryToHighlight]);
      });
    }
    const startIdx = page * WalletComponent.PAGE_SIZE;
    const endIdx = (page + 1) * WalletComponent.PAGE_SIZE;

    return new Promise((resolve, reject) => {
      resolve(
        this.creatorCoins.slice(
          startIdx,
          Math.min(endIdx, this.creatorCoins.length)
        )
      );
    });
  }
}
