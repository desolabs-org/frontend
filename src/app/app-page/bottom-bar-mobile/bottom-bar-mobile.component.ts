import { Component, Input, OnInit } from '@angular/core';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { GlobalVarsService } from 'src/lib/services/global-vars';

@Component({
  selector: 'bottom-bar-mobile',
  templateUrl: './bottom-bar-mobile.component.html',
})
export class BottomBarMobileComponent {
  @Input() showPostButton = false;

  AppRoutingModule = AppRoutingModule;

  constructor(public globalVars: GlobalVarsService) {}
}
