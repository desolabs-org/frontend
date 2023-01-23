import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GlobalVarsService } from '../global-vars.service';
import { AppRoutingModule, RouteNames } from '../app-routing.module';
import {
  BackendApiService,
  BalanceEntryResponse,
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
  
  nextButtonText: string;

  constructor(
    private appData: GlobalVarsService,
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
    private backendApi: BackendApiService
  ) {
    this.globalVars = appData;
  }

  subscriptions = new Subscription();
  
  ngOnInit() {
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
