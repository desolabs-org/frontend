import { Component, OnInit, Input } from '@angular/core';
import { BackendApiService } from 'src/lib/services/backend-api';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { InfiniteScroller } from 'src/lib/services/infinite-scroller';
import { IAdapter, IDatasource } from 'ngx-ui-scroll';

@Component({
  selector: 'likes-modal',
  templateUrl: './likes-modal.component.html',
})
export class LikesModalComponent implements OnInit {
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
  pageSize = 50;

  getPage = (page: number) => {
    // After we have filled the lastPage, do not honor any more requests.
    if (this.lastPage != null && page > this.lastPage) {
      return [];
    }
    this.loading = true;
    return this.backendApi
      .GetLikesForPost(
        this.globalVars.localNode,
        this.postHashHex,
        this.pageOffset,
        this.pageSize,
        this.globalVars.loggedInUser.PublicKeyBase58Check
      )
      .toPromise()
      .then(
        (res) => {
          let likersPage = res.Likers;

          // Update the pageOffset now that we have successfully fetched a page.
          this.pageOffset += likersPage.length;

          // If we've hit the end of the followers with profiles, set last page and anonymous follower count.
          if (likersPage.length < this.pageSize) {
            this.lastPage = page;
          }

          this.loading = false;

          // Return the page.
          return likersPage;
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
