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
} from 'src/lib/services/backend-api';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { IAdapter, IDatasource } from 'ngx-ui-scroll';
import * as _ from 'lodash';
import { InfiniteScroller } from 'src/lib/services/infinite-scroller';
import { of, Subscription } from 'rxjs';
import { SwalHelper } from 'src/lib/helpers/swal-helper';

@Component({
  selector: 'profile-nfts',
  templateUrl: './profile-nfts.component.html',
})
export class ProfileNftsComponent implements OnInit {
  static PAGE_SIZE = 10;
  static BUFFER_SIZE = 5;
  static WINDOW_VIEWPORT = true;
  static PADDING = 0.5;

  @Input() profile: ProfileEntryResponse;
  @Input() afterCommentCreatedCallback: any = null;
  @Input() showProfileAsReserved: boolean;

  nftResponse: {
    NFTEntryResponses: NFTEntryResponse[];
    PostEntryResponse: PostEntryResponse;
  }[];
  myBids: NFTBidEntryResponse[];

  lastPage = null;
  isLoading = true;
  loadingNewSelection = false;
  static FOR_SALE = 'For Sale';
  static MY_BIDS = 'My Bids';
  static MY_GALLERY = 'Gallery';
  static TRANSFERABLE = 'Transferable';
  static MY_PENDING_TRANSFERS = 'Pending Transfers';
  tabs = [
    ProfileNftsComponent.FOR_SALE,
    ProfileNftsComponent.MY_GALLERY,
  ];
  activeTab: string;

  nftTabMap = {
    my_bids: ProfileNftsComponent.MY_BIDS,
    for_sale: ProfileNftsComponent.FOR_SALE,
    my_gallery: ProfileNftsComponent.MY_GALLERY,
    transferable: ProfileNftsComponent.TRANSFERABLE,
    my_pending_transfers: ProfileNftsComponent.MY_PENDING_TRANSFERS,
  };

  nftTabInverseMap = {
    [ProfileNftsComponent.FOR_SALE]: 'for_sale',
    [ProfileNftsComponent.MY_BIDS]: 'my_bids',
    [ProfileNftsComponent.MY_GALLERY]: 'my_gallery',
    [ProfileNftsComponent.TRANSFERABLE]: 'transferable',
    [ProfileNftsComponent.MY_PENDING_TRANSFERS]: 'my_pending_transfers',
  };

  ProfileNftsComponent = ProfileNftsComponent;

  constructor(
    private globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    if (this.profileBelongsToLoggedInUser()) {
      this.tabs.push(
        ProfileNftsComponent.MY_BIDS,
        ProfileNftsComponent.MY_PENDING_TRANSFERS,
        ProfileNftsComponent.TRANSFERABLE
      );
    }
    this.route.queryParams.subscribe((queryParams) => {
      if (queryParams.nftTab && queryParams.nftTab in this.nftTabMap) {
        if (
          (queryParams.nftTab ===
            this.nftTabInverseMap[ProfileNftsComponent.MY_BIDS] ||
            queryParams.nftTab ===
              this.nftTabInverseMap[ProfileNftsComponent.TRANSFERABLE] ||
            queryParams.nftTab ===
              this.nftTabInverseMap[
                ProfileNftsComponent.MY_PENDING_TRANSFERS
              ]) &&
          this.globalVars.loggedInUser?.PublicKeyBase58Check !==
            this.profile.PublicKeyBase58Check
        ) {
          this.updateNFTTabParam(ProfileNftsComponent.MY_GALLERY);
        } else {
          this.onActiveTabChange(this.nftTabMap[queryParams.nftTab]);
        }
      }
    });

    if (!this.activeTab) {
      this.isLoading = true;
      let defaultTab = this.profileBelongsToLoggedInUser()
        ? ProfileNftsComponent.MY_BIDS
        : ProfileNftsComponent.MY_GALLERY;
      this.onActiveTabChange(defaultTab);
    }
  }

  getNFTBids(): Subscription {
    return this.backendApi
      .GetNFTBidsForUser(
        this.globalVars.localNode,
        this.profile.PublicKeyBase58Check,
        this.globalVars.loggedInUser?.PublicKeyBase58Check
      )
      .subscribe(
        (res: {
          PublicKeyBase58CheckToProfileEntryResponse: {
            [k: string]: ProfileEntryResponse;
          };
          PostHashHexToPostEntryResponse: { [k: string]: PostEntryResponse };
          NFTBidEntries: NFTBidEntryResponse[];
        }) => {
          _.forIn(res.PostHashHexToPostEntryResponse, (value, key) => {
            value.ProfileEntryResponse =
              res.PublicKeyBase58CheckToProfileEntryResponse[
                value.PosterPublicKeyBase58Check
              ];
            res.PostHashHexToPostEntryResponse[key] = value;
          });
          this.myBids = res.NFTBidEntries.map((bidEntry) => {
            bidEntry.PostEntryResponse =
              res.PostHashHexToPostEntryResponse[bidEntry.PostHashHex];
            return bidEntry;
          });
          this.lastPage = Math.floor(
            this.myBids.length / ProfileNftsComponent.PAGE_SIZE
          );
          return this.myBids;
        }
      );
  }

  getNFTs(
    isForSale: boolean | null = null,
    isPending: boolean | null = null
  ): Subscription {
    return this.backendApi
      .GetNFTsForUser(
        this.globalVars.localNode,
        this.profile.PublicKeyBase58Check,
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
            // Exclude NFTs created by profile from Gallery and don't show pending NFTs in galley.
            if (
              this.activeTab === ProfileNftsComponent.MY_GALLERY &&
              (responseElement.PostEntryResponse.PosterPublicKeyBase58Check ===
                this.profile.PublicKeyBase58Check ||
                responseElement.NFTEntryResponses.filter(
                  (nftEntryResponse) => !nftEntryResponse.IsPending
                ).length === 0)
            ) {
              continue;
            }
            this.nftResponse.push(responseElement);
          }
          this.lastPage = Math.floor(
            this.nftResponse.length / ProfileNftsComponent.PAGE_SIZE
          );
          return this.nftResponse;
        }
      );
  }

  getPage(page: number) {
    if (this.lastPage != null && page > this.lastPage) {
      return [];
    }
    const startIdx = page * ProfileNftsComponent.PAGE_SIZE;
    const endIdx = (page + 1) * ProfileNftsComponent.PAGE_SIZE;

    return new Promise((resolve, reject) => {
      resolve(
        this.activeTab === ProfileNftsComponent.MY_BIDS
          ? this.myBids.slice(startIdx, Math.min(endIdx, this.myBids.length))
          : this.nftResponse.slice(
              startIdx,
              Math.min(endIdx, this.nftResponse.length)
            )
      );
    });
  }

  async _prependComment(uiPostParent, index, newComment) {
    const uiPostParentHashHex = this.globalVars.getPostContentHashHex(
      uiPostParent
    );
    await this.datasource.adapter.relax();
    await this.datasource.adapter.update({
      predicate: ({ $index, data, element }) => {
        let currentPost = (data as any) as PostEntryResponse;
        if ($index === index) {
          newComment.parentPost = currentPost;
          currentPost.Comments = currentPost.Comments || [];
          currentPost.Comments.unshift(_.cloneDeep(newComment));
          return [this.globalVars.incrementCommentCount(currentPost)];
        } else if (
          this.globalVars.getPostContentHashHex(currentPost) ===
          uiPostParentHashHex
        ) {
          // We also want to increment the comment count on any other notifications related to the same post hash hex.
          return [this.globalVars.incrementCommentCount(currentPost)];
        }
        // Leave all other items in the datasource as is.
        return true;
      },
    });
  }
  
  profileBelongsToLoggedInUser(): boolean {
    return (
      this.globalVars.loggedInUser?.ProfileEntryResponse &&
      this.globalVars.loggedInUser.ProfileEntryResponse.PublicKeyBase58Check ===
        this.profile.PublicKeyBase58Check
    );
  }

  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    ProfileNftsComponent.PAGE_SIZE,
    this.getPage.bind(this),
    ProfileNftsComponent.WINDOW_VIEWPORT,
    ProfileNftsComponent.BUFFER_SIZE,
    ProfileNftsComponent.PADDING
  );
  datasource: IDatasource<
    IAdapter<any>
  > = this.infiniteScroller.getDatasource();

  onActiveTabChange(event): Subscription {
    if (this.activeTab !== event) {
      this.activeTab = event;
      this.loadingNewSelection = true;
      this.isLoading = true;
      this.infiniteScroller.reset();
      if (this.activeTab === ProfileNftsComponent.MY_BIDS) {
        return this.getNFTBids().add(() => {
          this.resetDatasource(event);
        });
      } else {
        return this.getNFTs(
          this.getIsForSaleValue(),
          this.getIsPendingValue()
        ).add(() => {
          this.resetDatasource(event);
        });
      }
    } else {
      return of('').subscribe((res) => res);
    }
  }

  resetDatasource(event): void {
    this.infiniteScroller.reset();
    this.datasource.adapter.reset().then(() => {
      this.loadingNewSelection = false;
      this.isLoading = false;
      this.updateNFTTabParam(event);
    });
  }

  updateNFTTabParam(event): void {
    // Update query params to reflect current tab
    const urlTree = this.router.createUrlTree([], {
      queryParams: {
        nftTab: this.nftTabInverseMap[event] || 'for_sale',
        tab: 'nfts',
      },
      queryParamsHandling: 'merge',
      preserveFragment: true,
    });
    this.location.go(urlTree.toString());
  }

  cancelBid(bidEntry: NFTBidEntryResponse): void {
    SwalHelper.fire({
      target: this.globalVars.getTargetComponentSelector(),
      title: 'Cancel Bid',
      html: `Are you sure you'd like to cancel this bid?`,
      showCancelButton: true,
      customClass: {
        confirmButton: 'btn btn-light',
        cancelButton: 'btn btn-light no',
      },
      reverseButtons: true,
    }).then((res) => {
      if (res.isConfirmed) {
        this.backendApi
          .CreateNFTBid(
            this.globalVars.localNode,
            this.globalVars.loggedInUser.PublicKeyBase58Check,
            bidEntry.PostEntryResponse.PostHashHex,
            bidEntry.SerialNumber,
            0,
            this.globalVars.defaultFeeRateNanosPerKB
          )
          .subscribe(
            () => {
              return this.datasource.adapter.remove({
                predicate: ({ data }) => {
                  const currBidEntry = (data as any) as NFTBidEntryResponse;
                  return (
                    currBidEntry.SerialNumber === bidEntry.SerialNumber &&
                    currBidEntry.BidAmountNanos ===
                      currBidEntry.BidAmountNanos &&
                    currBidEntry.PostEntryResponse.PostHashHex ===
                      bidEntry.PostEntryResponse.PostHashHex
                  );
                },
              });
            },
            (err) => {
              console.error(err);
            }
          );
      }
    });
  }

  getIsForSaleValue(): boolean | null {
    if (this.activeTab === ProfileNftsComponent.FOR_SALE) {
      return true;
    } else if (this.activeTab === ProfileNftsComponent.TRANSFERABLE) {
      return false;
    } else {
      return null;
    }
  }

  getIsPendingValue(): boolean | null {
    if (this.activeTab === ProfileNftsComponent.MY_PENDING_TRANSFERS) {
      return true;
    } else if (
      this.activeTab === ProfileNftsComponent.MY_GALLERY ||
      this.activeTab === ProfileNftsComponent.TRANSFERABLE
    ) {
      return false;
    } else {
      return null;
    }
  }
}
