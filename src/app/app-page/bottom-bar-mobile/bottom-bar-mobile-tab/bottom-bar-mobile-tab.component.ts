import { Component, Input, OnInit } from '@angular/core';
import { NavigationService } from 'src/lib/services/navigation';

@Component({
  selector: 'bottom-bar-mobile-tab',
  templateUrl: './bottom-bar-mobile-tab.component.html',
})
export class BottomBarMobileTabComponent {
  @Input() link: string;

  constructor(private navigationService: NavigationService) {}

  clearNavigationHistory() {
    this.navigationService.clearHistoryAfterNavigatingToNewUrl();
  }
}
