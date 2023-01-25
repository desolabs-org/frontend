import { Component, Input, OnInit } from '@angular/core';
import { AppRoutingModule } from '../app-routing.module';
import { GlobalVarsService } from 'src/lib/services/global-vars';

@Component({
  selector: 'bottom-bar-mobile',
  templateUrl: './bottom-bar-mobile.component.html',
  styleUrls: ['./bottom-bar-mobile.component.scss'],
})
export class BottomBarMobileComponent {
  @Input() showPostButton = false;

  AppRoutingModule = AppRoutingModule;

  constructor(public globalVars: GlobalVarsService) {}
}
