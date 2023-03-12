import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { AppRoutingModule } from 'src/app/app-routing.module';
import {
  BackendApiService,
  BalanceEntryResponse,
  DAOCoinEntryResponse,
  DAOCoinOperationTypeString,
  TransferRestrictionStatusString,
} from 'src/lib/services/backend-api';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { InfiniteScroller } from 'src/lib/services/infinite-scroller';
import { IAdapter, IDatasource } from 'ngx-ui-scroll';
import { Observable, Subscription, throwError, zip } from 'rxjs';
import { environment } from 'src/environments/environment';
import { toBN } from 'web3-utils';
import { catchError, map } from 'rxjs/operators';
import { BsModalService } from 'ngx-bootstrap/modal';
import { TransferDAOCoinModalComponent } from '../../dao-coins/transfer-dao-coin-modal/transfer-dao-coin-modal.component';
import { BurnDaoCoinModalComponent } from '../../dao-coins/burn-dao-coin-modal/burn-dao-coin-modal.component';
import { SwalHelper } from 'src/lib/helpers/swal-helper';

@Component({
  selector: 'owned-utility-coins-list',
  templateUrl: './owned-utility-coins-list.component.html',
})
export class OwnedUtilityCoinsListComponent implements OnInit, OnDestroy {
  static PAGE_SIZE = 20;
  static BUFFER_SIZE = 10;
  static WINDOW_VIEWPORT = true;
  static PADDING = 0.5;

  globalVars: GlobalVarsService;
  AppRoutingModule = AppRoutingModule;
  hasUnminedCreatorCoins: boolean;

  sortedCoinsFromHighToLow: number = 0;
  sortedUsernameFromHighToLow: number = 0;

  loadingMyDAOCoinHoldings = false;
  daoCoinHoldings: BalanceEntryResponse[] = [];

  coinsToBurn: number = 0;
  burningDAOCoin: boolean = false;

  OwnedUtilityCoinsListComponent = OwnedUtilityCoinsListComponent;

  lastPage = null;
  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    OwnedUtilityCoinsListComponent.PAGE_SIZE,
    this.getPage.bind(this),
    OwnedUtilityCoinsListComponent.WINDOW_VIEWPORT,
    OwnedUtilityCoinsListComponent.BUFFER_SIZE,
    OwnedUtilityCoinsListComponent.PADDING
  );

  datasource: IDatasource<
    IAdapter<any>
  > = this.infiniteScroller.getDatasource();

  constructor(
    private appData: GlobalVarsService,
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
    public backendApi: BackendApiService,
    private modalService: BsModalService
  ) {
    this.globalVars = appData;
  }

  subscriptions = new Subscription();

  ngOnInit() {
    this.loadMyDAOCoinHoldings().subscribe(
      (res) => {
        this.scrollerReset();
      });
    this.titleService.setTitle(`DAO Coins - ${environment.node.name}`);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadMyDAOCoinHoldings(): Observable<BalanceEntryResponse[]> {
    this.loadingMyDAOCoinHoldings = true;
    return this.backendApi
      .GetHodlersForPublicKey(
        this.globalVars.localNode,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        '',
        '',
        0,
        true,
        true,
        true
      )
      .pipe(
        map((res) => {
          this.daoCoinHoldings = res.Hodlers || [];
          this.loadingMyDAOCoinHoldings = false;
          return res.Hodlers;
        }),
        catchError((err) => {
          console.error(err);
          this.loadingMyDAOCoinHoldings = false;
          return throwError(err);
        })
      );
  }

  // sort by Coins held
  sortHodlingsCoins(
    hodlings: BalanceEntryResponse[],
    descending: boolean
  ): void {
    this.sortedUsernameFromHighToLow = 0;
    this.sortedCoinsFromHighToLow = descending ? -1 : 1;
    hodlings.sort((a: BalanceEntryResponse, b: BalanceEntryResponse) => {
      return this.sortedCoinsFromHighToLow * (a.BalanceNanos - b.BalanceNanos);
    });
  }

  // sort by username
  sortHodlingsUsername(
    hodlings: BalanceEntryResponse[],
    descending: boolean
  ): void {
    this.sortedUsernameFromHighToLow = descending ? -1 : 1;
    this.sortedCoinsFromHighToLow = 0;
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
        this.sortHodlingsUsername(this.daoCoinHoldings, descending);
        break;
      case 'coins':
        descending = this.sortedCoinsFromHighToLow !== -1;
        this.sortHodlingsCoins(this.daoCoinHoldings, descending);
        break;
      default:
      // do nothing
    }
    this.scrollerReset();
  }

  usernameTruncationLength(): number {
    return this.globalVars.isMobile() ? 14 : 20;
  }

  scrollerReset() {
    this.infiniteScroller.reset();
    this.datasource.adapter.reset().then(() => this.datasource.adapter.check());
  }

  getPage(page: number) {
    if (this.lastPage != null && page > this.lastPage) {
      return [];
    }

    const startIdx = page * OwnedUtilityCoinsListComponent.PAGE_SIZE;
    const endIdx = (page + 1) * OwnedUtilityCoinsListComponent.PAGE_SIZE;

    return new Promise((resolve, reject) => {
      resolve(
        this.daoCoinHoldings.slice(
          startIdx,
          Math.min(endIdx, this.daoCoinHoldings.length)
        )
      );
    });
  }

  openTransferDAOCoinModal(creator: BalanceEntryResponse): void {
    const modalDetails = this.modalService.show(TransferDAOCoinModalComponent, {
      class: 'modal-dialog-centered',
      initialState: { balanceEntryResponse: creator },
    });
    const onHideEvent = modalDetails.onHide;
    onHideEvent.subscribe((response) => {
      if (response === 'dao coins transferred') {
        this.loadingMyDAOCoinHoldings = true;
        zip(this.loadMyDAOCoinHoldings()).subscribe(
          (res) => {
            this.loadingMyDAOCoinHoldings = false;
            this.scrollerReset();
          }
        );
      }
    });
  }

  openBurnDAOCoinModal(creator: BalanceEntryResponse): void {
    const modalDetails = this.modalService.show(BurnDaoCoinModalComponent, {
      class: 'modal-dialog-centered',
      initialState: { balanceEntryResponse: creator },
    });
    const onHideEvent = modalDetails.onHide;
    onHideEvent.subscribe((response) => {
      if (response.startsWith('dao coins burned')) {
        this.loadingMyDAOCoinHoldings = true;
        zip(this.loadMyDAOCoinHoldings()).subscribe(
          (res) => {
            this.loadingMyDAOCoinHoldings = false;
            this.scrollerReset();
          }
        );
      }
    });
  }
}
