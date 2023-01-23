import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GlobalVarsService } from 'src/app/global-vars.service';
import { AppRoutingModule } from 'src/app/app-routing.module';
import {
  BackendApiService,
  BalanceEntryResponse,
  DAOCoinEntryResponse,
  DAOCoinOperationTypeString,
  TransferRestrictionStatusString,
} from 'src/app/backend-api.service';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, throwError, zip } from 'rxjs';
import { environment } from 'src/environments/environment';
import { toBN } from 'web3-utils';
import { catchError, map } from 'rxjs/operators';
import { BsModalService } from 'ngx-bootstrap/modal';
import { TransferDAOCoinModalComponent } from 'src/app/dao-coins/transfer-dao-coin-modal/transfer-dao-coin-modal.component';
import { BurnDaoCoinModalComponent } from 'src/app/dao-coins/burn-dao-coin-modal/burn-dao-coin-modal.component';
import { SwalHelper } from 'src/lib/helpers/swal-helper';

@Component({
  selector: 'update-dao-coin',
  templateUrl: './update-dao-coin.component.html',
})
export class UpdateDaoCoinComponent implements OnInit, OnDestroy {
  static WINDOW_VIEWPORT = true;
  static PADDING = 0.5;

  globalVars: GlobalVarsService;
  AppRoutingModule = AppRoutingModule;

  myDAOCoin: DAOCoinEntryResponse;

  TransferRestrictionStatusString = TransferRestrictionStatusString;
  transferRestrictionStatus: TransferRestrictionStatusString;
  coinsToMint: number = 0;
  coinsToBurn: number = 0;
  mintingDAOCoin: boolean = false;
  disablingMinting: boolean = false;
  burningDAOCoin: boolean = false;
  updatingTransferRestrictionStatus: boolean = false;

  transferRestrictionStatusOptions = [
    TransferRestrictionStatusString.UNRESTRICTED,
    TransferRestrictionStatusString.PROFILE_OWNER_ONLY,
    TransferRestrictionStatusString.DAO_MEMBERS_ONLY,
    TransferRestrictionStatusString.PERMANENTLY_UNRESTRICTED,
  ];

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
    // Don't look up my DAO if I don't have a profile
    if (this.globalVars.loggedInUser?.ProfileEntryResponse) {
      this.myDAOCoin = this.globalVars.loggedInUser.ProfileEntryResponse.DAOCoinEntry;
      this.transferRestrictionStatus =
        this.myDAOCoin?.TransferRestrictionStatus ||
        TransferRestrictionStatusString.UNRESTRICTED;
    } 
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  mintDAOCoin(): void {
    if (
      this.myDAOCoin.MintingDisabled ||
      this.mintingDAOCoin ||
      this.coinsToMint <= 0
    ) {
      return;
    }
    SwalHelper.fire({
      target: this.globalVars.getTargetComponentSelector(),
      title: 'Mint DAO Coins',
      html: `Click confirm to mint ${this.coinsToMint} ${this.globalVars.loggedInUser?.ProfileEntryResponse?.Username} DAO coins`,
      showCancelButton: true,
      customClass: {
        confirmButton: 'btn btn-light',
        cancelButton: 'btn btn-light no',
      },
      reverseButtons: true,
    }).then((res: any) => {
      if (res.isConfirmed) {
        this.mintingDAOCoin = true;
        this.doDAOCoinTxn(
          this.globalVars.loggedInUser?.PublicKeyBase58Check,
          DAOCoinOperationTypeString.MINT
        )
          .subscribe(
            (res) => {
              this.myDAOCoin.CoinsInCirculationNanos = toBN(
                this.myDAOCoin.CoinsInCirculationNanos
              )
                .add(this.globalVars.unitToBNNanos(this.coinsToMint))
                .toString('hex');

              this.coinsToMint = 0;
            },
            (err) => {
              this.globalVars._alertError(err.error.error);
              console.error(err);
            }
          )
          .add(() => {
            this.mintingDAOCoin = false;
          });
      }
    });
  }

  disableMinting(): void {
    if (this.myDAOCoin.MintingDisabled || this.disablingMinting) {
      return;
    }
    SwalHelper.fire({
      target: this.globalVars.getTargetComponentSelector(),
      title: 'Disable Minting',
      html: `Click confirm to disable minting for ${this.globalVars.loggedInUser?.ProfileEntryResponse?.Username} DAO coins. Please note, this is irreversible.`,
      showCancelButton: true,
      customClass: {
        confirmButton: 'btn btn-light',
        cancelButton: 'btn btn-light no',
      },
      reverseButtons: true,
    }).then((res: any) => {
      if (res.isConfirmed) {
        this.disablingMinting = true;
        this.doDAOCoinTxn(
          this.globalVars.loggedInUser?.PublicKeyBase58Check,
          DAOCoinOperationTypeString.DISABLE_MINTING
        )
          .subscribe(
            (res) => {
              this.myDAOCoin.MintingDisabled = true;
            },
            (err) => {
              this.globalVars._alertError(err.error.error);
              console.error(err);
            }
          )
          .add(() => (this.disablingMinting = false));
      }
    });
  }

  updateTransferRestrictionStatus(): void {
    if (
      this.myDAOCoin.TransferRestrictionStatus ===
        TransferRestrictionStatusString.PERMANENTLY_UNRESTRICTED ||
      this.updatingTransferRestrictionStatus ||
      this.transferRestrictionStatus ===
        this.myDAOCoin.TransferRestrictionStatus
    ) {
      return;
    }
    SwalHelper.fire({
      target: this.globalVars.getTargetComponentSelector(),
      title: 'Update Transfer Restriction Status',
      html: `Click confirm to update the transfer restriction status to ${this.getDisplayTransferRestrictionStatus(
        this.transferRestrictionStatus
      )} for ${
        this.globalVars.loggedInUser?.ProfileEntryResponse?.Username
      } DAO coins`,
      showCancelButton: true,
      customClass: {
        confirmButton: 'btn btn-light',
        cancelButton: 'btn btn-light no',
      },
      reverseButtons: true,
    }).then((res: any) => {
      if (res.isConfirmed) {
        this.updatingTransferRestrictionStatus = true;
        this.doDAOCoinTxn(
          this.globalVars.loggedInUser?.PublicKeyBase58Check,
          DAOCoinOperationTypeString.UPDATE_TRANSFER_RESTRICTION_STATUS
        )
          .subscribe(
            (res) => {
              this.myDAOCoin.TransferRestrictionStatus = this.transferRestrictionStatus;
            },
            (err) => {
              this.globalVars._alertError(err.error.error);
              console.error(err);
            }
          )
          .add(() => (this.updatingTransferRestrictionStatus = false));
      }
    });
  }

  burnDAOCoin(profilePublicKeyBase58Check: string): void {
    if (this.burningDAOCoin || this.coinsToBurn <= 0) {
      return;
    }
    SwalHelper.fire({
      target: this.globalVars.getTargetComponentSelector(),
      title: 'Burn DAO Coins',
      html: `Click confirm to burn ${this.coinsToBurn} ${this.globalVars.loggedInUser?.ProfileEntryResponse?.Username} DAO coins`,
      showCancelButton: true,
      customClass: {
        confirmButton: 'btn btn-light',
        cancelButton: 'btn btn-light no',
      },
      reverseButtons: true,
    }).then((res: any) => {
      if (res.isConfirmed) {
        this.burningDAOCoin = true;
        this.doDAOCoinTxn(
          this.globalVars.loggedInUser?.PublicKeyBase58Check,
          DAOCoinOperationTypeString.BURN
        )
          .subscribe(
            (res) => {
              if (
                profilePublicKeyBase58Check ===
                this.globalVars.loggedInUser?.PublicKeyBase58Check
              ) {
                this.myDAOCoin.CoinsInCirculationNanos = toBN(
                  this.myDAOCoin.CoinsInCirculationNanos
                )
                  .add(this.globalVars.unitToBNNanos(this.coinsToBurn))
                  .toString('hex');
              }
              this.coinsToBurn = 0;
            },
            (err) => {
              this.globalVars._alertError(err.error.error);
              console.error(err);
            }
          )
          .add(() => {
            this.burningDAOCoin = false;
          });
      }
    });
  }

  doDAOCoinTxn(
    profilePublicKeyBase58Check: string,
    operationType: DAOCoinOperationTypeString
  ): Observable<any> {
    if (
      profilePublicKeyBase58Check !==
        this.globalVars.loggedInUser?.PublicKeyBase58Check &&
      operationType !== DAOCoinOperationTypeString.BURN
    ) {
      return throwError(
        'invalid dao coin operation - must be owner to perform ' + operationType
      );
    }
    return this.backendApi.DAOCoin(
      this.globalVars.localNode,
      this.globalVars.loggedInUser?.PublicKeyBase58Check,
      profilePublicKeyBase58Check,
      operationType,
      operationType ===
        DAOCoinOperationTypeString.UPDATE_TRANSFER_RESTRICTION_STATUS
        ? this.transferRestrictionStatus
        : undefined,
      operationType === DAOCoinOperationTypeString.MINT
        ? this.globalVars.toHexNanos(this.coinsToMint)
        : undefined,
      operationType === DAOCoinOperationTypeString.BURN
        ? this.globalVars.toHexNanos(this.coinsToBurn)
        : undefined,
      this.globalVars.defaultFeeRateNanosPerKB
    );
  }

  getDisplayTransferRestrictionStatus(
    transferRestrictionStatus: TransferRestrictionStatusString
  ): string {
    // If we're not provided a value, we assume it's unrestricted.
    transferRestrictionStatus =
      transferRestrictionStatus || TransferRestrictionStatusString.UNRESTRICTED;
    return transferRestrictionStatus
      .split('_')
      .map((status) => status.charAt(0).toUpperCase() + status.slice(1))
      .join(' ')
      .replace('Dao', 'DAO');
  }
}
