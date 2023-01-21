import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  BackendApiService,
  NFTBidEntryResponse,
  NFTEntryResponse,
  PostEntryResponse,
  ProfileEntryResponse,
} from '../../backend-api.service';
import { GlobalVarsService } from '../../global-vars.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { IAdapter, IDatasource } from 'ngx-ui-scroll';
import * as _ from 'lodash';
import { InfiniteScroller } from '../../infinite-scroller';
import { of, Subscription } from 'rxjs';
import { SwalHelper } from '../../../lib/helpers/swal-helper';

@Component({
  selector: 'owned-nfts-list',
  templateUrl: './owned-nfts-list.component.html'
})
export class OwnedNftsListComponent implements OnInit {
  static PAGE_SIZE = 10;
  static BUFFER_SIZE = 5;
  static WINDOW_VIEWPORT = true;
  static PADDING = 0.5;

  @Input() profile: ProfileEntryResponse;
  @Input() afterCommentCreatedCallback: any = null;
  
  nftResponse: {
    NFTEntryResponses: NFTEntryResponse[];
    PostEntryResponse: PostEntryResponse;
  }[];
  myBids: NFTBidEntryResponse[];

  lastPage = null;
  isLoading = true;

  OwnedNftsListComponent = OwnedNftsListComponent;

  @Output() blockUser = new EventEmitter();

  constructor(
    private globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.onActiveTabChange();
  }

  getNFTs(
    isForSale: boolean | null = null,
    isPending: boolean | null = null
  ): Subscription {
    return this.backendApi
      .GetNFTsForUser(
        this.globalVars.localNode,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        isForSale,
        isPending
      )
      .subscribe(
        (res: {
          NFTsMap: {
            [k: string]: {
              PostEntryResponse: PostEntryResponse;
              NFTEntryResponses: NFTEntryResponse[];
            };
          };
        }) => {
          this.nftResponse = [];
          for (const k in res.NFTsMap) {
            const responseElement = res.NFTsMap[k];
            // Exclude pending NFTs
            if  (responseElement.NFTEntryResponses.filter(
                  (nftEntryResponse) => !nftEntryResponse.IsPending
                ).length === 0)
            {
              continue;
            }
            this.nftResponse.push(responseElement);
          }
          this.lastPage = Math.floor(
            this.nftResponse.length / OwnedNftsListComponent.PAGE_SIZE
          );
          return this.nftResponse;
        }
      );
  }

  getPage(page: number) {
    if (this.lastPage != null && page > this.lastPage) {
      return [];
    }
    const startIdx = page * OwnedNftsListComponent.PAGE_SIZE;
    const endIdx = (page + 1) * OwnedNftsListComponent.PAGE_SIZE;

    return new Promise((resolve, reject) => {
      resolve(
        this.nftResponse.slice(
          startIdx,
          Math.min(endIdx, this.nftResponse.length)
        )
      );
    });
  }

  userBlocked() {
    this.blockUser.emit();
  }

  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    OwnedNftsListComponent.PAGE_SIZE,
    this.getPage.bind(this),
    OwnedNftsListComponent.WINDOW_VIEWPORT,
    OwnedNftsListComponent.BUFFER_SIZE,
    OwnedNftsListComponent.PADDING
  );

  datasource: IDatasource<IAdapter<any>> = this.infiniteScroller.getDatasource();

  onActiveTabChange(): Subscription {
    this.isLoading = true;
    this.infiniteScroller.reset();

    return this.getNFTs(
      true, true
    ).add(() => {
      this.resetDatasource();
    });
  }

  resetDatasource(): void {
    this.infiniteScroller.reset();
    this.datasource.adapter.reset().then(() => {
      this.isLoading = false;
    });
  }
}
