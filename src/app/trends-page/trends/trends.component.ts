import { Component, OnInit } from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { BackendApiService } from 'src/lib/services/backend-api';
import { HttpClient } from '@angular/common/http';
import { AltumbaseService } from '../../../lib/services/altumbase/altumbase-service';
import {
  RightBarCreatorsComponent,
  RightBarTabOption,
} from '../../right-bar-creators/right-bar-creators.component';
import { IAdapter, IDatasource } from 'ngx-ui-scroll';
import { InfiniteScroller } from 'src/lib/services/infinite-scroller';

@Component({
  selector: 'trends',
  templateUrl: './trends.component.html',
  styleUrls: ['./trends.component.scss'],
})
export class TrendsComponent implements OnInit {
  static BUFFER_SIZE = 5;
  static PADDING = 0.25;
  static PAGE_SIZE = 20;
  static WINDOW_VIEWPORT = true;

  RightBarCreatorsComponent = RightBarCreatorsComponent;

  tabs: string[] = Object.keys(RightBarCreatorsComponent.chartMap).filter(
    (tab: string) => tab !== RightBarCreatorsComponent.ALL_TIME.name
  );
  activeTab: string = RightBarCreatorsComponent.GAINERS.name;
  activeRightTabOption: RightBarTabOption;
  selectedOptionWidth: string;

  pagedRequestsByTab = {};
  lastPageByTab = {};
  lastPage = null;
  loading = true;
  loadingNextPage = false;

  altumbaseService: AltumbaseService;

  constructor(
    public globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private httpClient: HttpClient
  ) {
    this.tabs.forEach((tab) => {
      this.pagedRequestsByTab[tab] = {
        '-1': new Promise((resolve) => {
          resolve([]);
        }),
      };
      this.lastPageByTab[tab] = null;
    });
    this.altumbaseService = new AltumbaseService(
      this.httpClient,
      this.backendApi,
      this.globalVars
    );
    this.selectTab();
  }

  selectTab() {
    const rightTabOption = RightBarCreatorsComponent.chartMap[this.activeTab];
    this.activeRightTabOption = rightTabOption;
    this.selectedOptionWidth = rightTabOption.width + 'px';
    this.loading = true;
    this.infiniteScroller.reset();
    this.datasource.adapter.reset().then(() => (this.loading = false));
  }

  ngOnInit() {
    this.globalVars.updateLeaderboard(true);
  }

  getPage(page: number) {
    if (this.activeTab === RightBarCreatorsComponent.GAINERS.name) {
      this.loadingNextPage = page !== 0;
      return this.altumbaseService
        .getDeSoLockedPage(page + 1, TrendsComponent.PAGE_SIZE, true)
        .toPromise()
        .then(
          (res) => {
            if (res.length < TrendsComponent.PAGE_SIZE) {
              this.lastPageByTab[this.activeTab] = page;
              this.lastPage = page;
            }
            this.loadingNextPage = false;
            return res;
          },
          (err) => {
            console.error(this.backendApi.stringifyError(err));
          }
        );
    }
    if (this.activeTab === RightBarCreatorsComponent.DIAMONDS.name) {
      this.loadingNextPage = page !== 0;
      return this.altumbaseService
        .getDiamondsReceivedPage(page + 1, TrendsComponent.PAGE_SIZE, false)
        .toPromise()
        .then(
          (res) => {
            if (res.length < TrendsComponent.PAGE_SIZE) {
              this.lastPageByTab[this.activeTab] = page;
              this.lastPage = page;
            }
            this.loadingNextPage = true;
            return res;
          },
          (err) => {
            console.error(this.backendApi.stringifyError(err));
          }
        );
    }
  }

  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    TrendsComponent.PAGE_SIZE,
    this.getPage.bind(this),
    TrendsComponent.WINDOW_VIEWPORT,
    TrendsComponent.BUFFER_SIZE,
    TrendsComponent.PADDING
  );
  datasource: IDatasource<
    IAdapter<any>
  > = this.infiniteScroller.getDatasource();
}
