import { Component, OnInit, Input } from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';

@Component({
  selector: 'left-bar-button',
  templateUrl: './left-bar-button.component.html',
})
export class LeftBarButtonComponent {
  @Input() link: string;
  @Input() buttonLabel: string;
  @Input() hasNotifications = false;
  @Input() isUnread = false;
  @Input() queryParams = null;
  notificationCount = 1;

  constructor(public globalVars: GlobalVarsService) {}

  _queryParamsForLink(link: string) {
    if (this.queryParams) {
      return this.queryParams;
    }
    if (link.includes(this.globalVars.RouteNames.FEEDS)) {
      return { stepNum: null, adminTab: null };
    }
    return { stepNum: null, adminTab: null, feedTab: null };
  }
}
