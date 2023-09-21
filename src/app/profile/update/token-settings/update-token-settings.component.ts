import { Component, OnDestroy, OnInit } from '@angular/core';
import { GlobalVarsService, Hex } from 'src/lib/services/global-vars';
import { AppRoutingModule } from 'src/app/app-routing.module';
import {
  BackendApiService,
  DAOCoinEntryResponse,
  DAOCoinOperationTypeString,
  TransferRestrictionStatusString,
} from 'src/lib/services/backend-api';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, throwError, zip } from 'rxjs';
import { toBigInt, toHex } from 'web3-utils';
import { BsModalService } from 'ngx-bootstrap/modal';
import { SwalHelper } from 'src/lib/helpers/swal-helper';

@Component({
  selector: 'update-token-settings',
  templateUrl: './update-token-settings.component.html',
})
export class UpdateTokenSettingsComponent implements OnInit, OnDestroy {
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
              this.myDAOCoin.CoinsInCirculationNanos = toHex(toBigInt(
                this.myDAOCoin.CoinsInCirculationNanos
              )
                + this.globalVars.unitToBNNanos(this.coinsToMint)) as Hex;

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
                this.myDAOCoin.CoinsInCirculationNanos = toHex(toBigInt(
                  this.myDAOCoin.CoinsInCirculationNanos
                ) + this.globalVars.unitToBNNanos(this.coinsToBurn)) as Hex;
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
