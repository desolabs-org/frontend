import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import {
  BackendApiService,
  BalanceEntryResponse,
} from 'src/lib/services/backend-api';
import { Observable, Subscription, throwError, zip } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { InfiniteScroller } from 'src/lib/services/infinite-scroller';
import { IAdapter, IDatasource } from 'ngx-ui-scroll';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'owned-creator-coins-list',
  templateUrl: './owned-creator-coins-list.component.html',
})
export class OwnedCreatorCoinsListComponent implements OnInit, OnDestroy {
  static PAGE_SIZE = 20;
  static BUFFER_SIZE = 10;
  static WINDOW_VIEWPORT = true;
  static PADDING = 0.5;

  globalVars: GlobalVarsService;
  
  hasUnminedCreatorCoins: boolean;

  sortedUSDValueFromHighToLow: number = 0;
  sortedPriceFromHighToLow: number = 0;
  sortedUsernameFromHighToLow: number = 0;

  creatorCoins: BalanceEntryResponse[] = [];

  subscriptions = new Subscription();

  OwnedCreatorCoinsListComponent = OwnedCreatorCoinsListComponent;

  lastPage = null;

  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    OwnedCreatorCoinsListComponent.PAGE_SIZE,
    this.getPage.bind(this),
    OwnedCreatorCoinsListComponent.WINDOW_VIEWPORT,
    OwnedCreatorCoinsListComponent.BUFFER_SIZE,
    OwnedCreatorCoinsListComponent.PADDING
  );
  
  datasource: IDatasource<
    IAdapter<any>
  > = this.infiniteScroller.getDatasource();

  constructor(
    private appData: GlobalVarsService,
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
    private backendApi: BackendApiService
  ) {
    this.globalVars = appData;
  }

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
    this.titleService.setTitle(`Wallet - ${environment.node.name}`);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  sortUSDValue(
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

  sortPrice(
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

  sortUsername(
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
        this.sortUsername(this.creatorCoins, descending);
        break;
      case 'price':
        descending = this.sortedPriceFromHighToLow !== -1;
        this.sortPrice(this.creatorCoins, descending);
        break;
      case 'value':
        descending = this.sortedUSDValueFromHighToLow !== -1;
        this.sortUSDValue(this.creatorCoins, descending);
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

  usernameStyle() {
    return {
      'max-width': this.globalVars.isMobile() ? '100px' : '200px',
    };
  }

  scrollerReset() {
    this.infiniteScroller.reset();
    this.datasource.adapter.reset().then(() => this.datasource.adapter.check());
  }

  getPage(page: number) {
    if (this.lastPage != null && page > this.lastPage) {
      return [];
    }

    const startIdx = page * OwnedCreatorCoinsListComponent.PAGE_SIZE;
    const endIdx = (page + 1) * OwnedCreatorCoinsListComponent.PAGE_SIZE;

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
