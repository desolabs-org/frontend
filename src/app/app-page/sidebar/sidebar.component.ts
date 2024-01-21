import { Component, Input, OnInit } from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { BackendApiService } from 'src/lib/services/backend-api';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

export class SidebarTabOption {
  name: string;
  width: number;
  poweredBy: {
    name: string;
    link: string;
  };
}

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {

  constructor(
    public globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private router: Router
  ) {}

  activeTab: string;
  selectedOptionWidth: string;
  activeTabOption: SidebarTabOption;

  SidebarComponent = SidebarComponent;
  static SidebarTabKey = 'SidebarTab';

  static GAINERS: SidebarTabOption = {
    name: 'Top Daily Gainers',
    width: 175,
    poweredBy: {
      name: 'Altumbase',
      link: `https://altumbase.com/tools?${environment.node.name}`,
    },
  };
  static DIAMONDS: SidebarTabOption = {
    name: 'Daily Diamonded Creators',
    width: 275,
    poweredBy: {
      name: 'Altumbase',
      link: `https://altumbase.com/tools?${environment.node.name}`,
    },
  };

  static ALL_TIME: SidebarTabOption = {
    name: 'Top Creator Coins',
    width: 210,
    poweredBy: {
      name: 'Deso',
      link: `https://deso.com`,
    },
  };

  static chartMap = {
    [SidebarComponent.GAINERS.name]: SidebarComponent.GAINERS,
    [SidebarComponent.DIAMONDS.name]: SidebarComponent.DIAMONDS,
    [SidebarComponent.ALL_TIME.name]: SidebarComponent.ALL_TIME,
  };

  ngOnInit() {
    const defaultTab = this.backendApi.GetStorage(
      SidebarComponent.SidebarTabKey
    );
    this.activeTab =
      defaultTab in SidebarComponent.chartMap
        ? defaultTab
        : SidebarComponent.GAINERS.name;
    this.selectTab(true);
  }

  selectTab(skipStorage: boolean = false) {
    const tabOption = SidebarComponent.chartMap[this.activeTab];
    this.activeTabOption = tabOption;
    this.selectedOptionWidth = tabOption.width + 'px';
    if (!skipStorage) {
      this.backendApi.SetStorage(
        SidebarComponent.SidebarTabKey,
        this.activeTab
      );
    }
  }
}
