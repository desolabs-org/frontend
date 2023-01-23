import { Component, Input } from '@angular/core';
import { AppRoutingModule, RouteNames } from '../../app-routing.module';
import { GlobalVarsService } from '../../global-vars.service';

@Component({
  selector: 'wallet-actions-dropdown',
  templateUrl: './wallet-actions-dropdown.component.html',
})
export class WalletActionsDropdownComponent {
  @Input() hodlingUsername: string;
  AppRoutingModule = AppRoutingModule;

  RouteNames = RouteNames;
  constructor(public globalVars: GlobalVarsService) {}
}
