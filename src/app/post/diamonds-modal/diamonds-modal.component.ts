import { Component, OnInit, Input } from '@angular/core';
import { BackendApiService } from 'src/lib/services/backend-api';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { InfiniteScroller } from 'src/lib/services/infinite-scroller';
import { IAdapter, IDatasource } from 'ngx-ui-scroll';

@Component({
  selector: 'diamonds-modal',
  templateUrl: './diamonds-modal.component.html',
})
export class DiamondsModalComponent implements OnInit {
  @Input() postHashHex: string;
  diamonds = [];
  loading = false;
  errorLoading = false;

  constructor(
    private backendApi: BackendApiService,
    public globalVars: GlobalVarsService,
    public bsModalRef: BsModalRef
  ) {}

  ngOnInit(): void {
    this.loading = true;
  }

  // Infinite scroll metadata.
  pageOffset = 0;
  lastPage = null;
  pageSize = 25;

  getPage = (page: number) => {
    // After we have filled the lastPage, do not honor any more requests.
    if (this.lastPage != null && page > this.lastPage) {
      return [];
    }
    this.loading = true;
    return this.backendApi
      .GetDiamondsForPost(
        this.globalVars.localNode,
        this.postHashHex,
        this.pageOffset,
        this.pageSize,
        this.globalVars.loggedInUser.PublicKeyBase58Check
      )
      .toPromise()
      .then(
        (res) => {
          let diamondSendersPage = res.DiamondSenders;

          // Update the pageOffset now that we have successfully fetched a page.
          this.pageOffset += diamondSendersPage.length;

          // If we've hit the end of the followers with profiles, set last page and anonymous follower count.
          if (diamondSendersPage.length < this.pageSize) {
            this.lastPage = page;
          }

          this.loading = false;

          // Return the page.
          return diamondSendersPage;
        },
        (err) => {
          this.errorLoading = true;
        }
      );
  };

  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    this.pageSize,
    this.getPage,
    false
  );
  datasource: IDatasource<
    IAdapter<any>
  > = this.infiniteScroller.getDatasource();
}
