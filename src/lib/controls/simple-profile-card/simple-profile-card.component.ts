import { Component, OnInit, Input } from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { Router } from '@angular/router';
import { ProfileEntryResponse } from 'src/lib/services/backend-api';

@Component({
  selector: 'simple-profile-card',
  templateUrl: './simple-profile-card.component.html',
})
export class SimpleProfileCardComponent implements OnInit {
  @Input() profile: ProfileEntryResponse;
  @Input() diamondLevel = -1;
  @Input() showHeartIcon = false;
  @Input() showRepostIcon = false;
  @Input() containerModalRef: any = null;
  @Input() singleColumn = false;
  @Input() hideFollowLink = false;
  @Input() isBold = true;
  
  constructor(public globalVars: GlobalVarsService, private router: Router) {}

  ngOnInit(): void {}

  counter(num: number) {
    return Array(num);
  }

  onClick() {
    if (this.containerModalRef !== null) {
      this.containerModalRef.hide();
    }
    if (!this.profile.Username) {
      return;
    }
    this.router.navigate(
      ['/' + this.globalVars.RouteNames.USER_PREFIX, this.profile.Username],
      {
        queryParamsHandling: 'merge',
      }
    );
  }
}
