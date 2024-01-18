import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import {
  BackendApiService,
  NFTEntryResponse,
  PostEntryResponse,
} from 'src/lib/services/backend-api';
import { Router } from '@angular/router';
import { isNumber } from 'lodash';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Location } from '@angular/common';

@Component({
  selector: 'transfer-nft-accept-modal',
  templateUrl: './transfer-nft-accept-modal.component.html',
})
export class TransferNftAcceptModalComponent {
  static PAGE_SIZE = 50;
  static BUFFER_SIZE = 10;
  static WINDOW_VIEWPORT = false;
  static PADDING = 0.5;

  @Input() postHashHex: string;
  @Input() post: PostEntryResponse;
  @Input() transferNFTEntryResponses: NFTEntryResponse[];
  @Output() closeModal = new EventEmitter<any>();
  @Output() changeTitle = new EventEmitter<string>();

  bidAmountDeSo: number;
  bidAmountUSD: number;
  selectedSerialNumber: NFTEntryResponse = null;
  highBid: number = null;
  lowBid: number = null;
  loading = false;
  isSelectingSerialNumber = true;
  saveSelectionDisabled = false;
  showSelectedSerialNumbers = false;
  acceptingTransfer: boolean = false;
  errors: string[] = [];
  minBidCurrency: string = 'USD';
  minBidInput: number = 0;
  transferringUser: string;

  constructor(
    public globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private modalService: BsModalService,
    public bsModalRef: BsModalRef
  ) {}

  acceptTransfer() {
    this.saveSelectionDisabled = true;
    this.acceptingTransfer = true;
    this.backendApi
      .AcceptNFTTransfer(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        this.post.PostHashHex,
        this.selectedSerialNumber.SerialNumber,
        this.globalVars.defaultFeeRateNanosPerKB
      )
      .subscribe(
        (res) => {
          this.modalService.setDismissReason('transfer accepted');
          this.bsModalRef.hide();
        },
        (err) => {
          console.error(err);
        }
      )
      .add(() => {
        this.acceptingTransfer = false;
        this.saveSelectionDisabled = false;
      });
  }

  saveSelection(): void {
    if (!this.saveSelectionDisabled) {
      this.isSelectingSerialNumber = false;
      this.showSelectedSerialNumbers = true;
      this.changeTitle.emit('Confirm Transfer');
      this.highBid = this.selectedSerialNumber.HighestBidAmountNanos;
      this.lowBid = this.selectedSerialNumber.LowestBidAmountNanos;
    }
  }

  goBackToSerialSelection(): void {
    this.isSelectingSerialNumber = true;
    this.showSelectedSerialNumbers = false;
    this.changeTitle.emit('Choose an edition');
    this.highBid = null;
    this.lowBid = null;
    this.selectedSerialNumber = null;
  }

  selectSerialNumber(serialNumber: NFTEntryResponse) {
    this.selectedSerialNumber = serialNumber;
    this.backendApi
      .GetSingleProfile(
        this.globalVars.localNode,
        this.selectedSerialNumber.LastOwnerPublicKeyBase58Check,
        ''
      )
      .subscribe((res) => {
        if (res && !res.IsBlacklisted) {
          this.transferringUser = res.Profile?.Username;
        }
      });
    this.saveSelection();
  }

  bidAmountUSDFormatted() {
    return isNumber(this.bidAmountUSD)
      ? `~${this.globalVars.formatUSD(this.bidAmountUSD, 0)}`
      : '';
  }

  bidAmountDeSoFormatted() {
    return isNumber(this.bidAmountDeSo)
      ? `~${this.bidAmountDeSo.toFixed(2)} ÐESO`
      : '';
  }
}
