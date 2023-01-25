import { Component, Input, OnInit } from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { BackendApiService } from 'src/lib/services/backend-api';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export class RightBarTabOption {
  name: string;
  width: number;
  poweredBy: {
    name: string;
    link: string;
  };
}

@Component({
  selector: 'right-bar-creators',
  templateUrl: './right-bar-creators.component.html',
})
export class RightBarCreatorsComponent implements OnInit {

  constructor(
    public globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private router: Router
  ) {}

  activeTab: string;
  selectedOptionWidth: string;
  activeRightTabOption: RightBarTabOption;

  RightBarCreatorsComponent = RightBarCreatorsComponent;
  static RightBarTabKey = 'RightBarTab';

  static GAINERS: RightBarTabOption = {
    name: 'Top Daily Gainers',
    width: 175,
    poweredBy: {
      name: 'Altumbase',
      link: `https://altumbase.com/tools?${environment.node.name}`,
    },
  };
  static DIAMONDS: RightBarTabOption = {
    name: 'Top Daily Diamonded Creators',
    width: 275,
    poweredBy: {
      name: 'Altumbase',
      link: `https://altumbase.com/tools?${environment.node.name}`,
    },
  };

  static ALL_TIME: RightBarTabOption = {
    name: 'Top Creators All Time',
    width: 210,
    poweredBy: null,
  };

  static chartMap = {
    [RightBarCreatorsComponent.GAINERS.name]: RightBarCreatorsComponent.GAINERS,
    [RightBarCreatorsComponent.DIAMONDS.name]:
      RightBarCreatorsComponent.DIAMONDS,
    [RightBarCreatorsComponent.ALL_TIME.name]:
      RightBarCreatorsComponent.ALL_TIME,
  };

  ngOnInit() {
    const defaultTab = this.backendApi.GetStorage(
      RightBarCreatorsComponent.RightBarTabKey
    );
    this.activeTab =
      defaultTab in RightBarCreatorsComponent.chartMap
        ? defaultTab
        : RightBarCreatorsComponent.ALL_TIME.name;
    this.selectTab(true);
  }

  selectTab(skipStorage: boolean = false) {
    const rightTabOption = RightBarCreatorsComponent.chartMap[this.activeTab];
    this.activeRightTabOption = rightTabOption;
    this.selectedOptionWidth = rightTabOption.width + 'px';
    if (!skipStorage) {
      this.backendApi.SetStorage(
        RightBarCreatorsComponent.RightBarTabKey,
        this.activeTab
      );
    }
  }
}
