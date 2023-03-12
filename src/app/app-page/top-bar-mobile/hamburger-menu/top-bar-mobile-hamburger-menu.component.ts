import { Component, OnInit } from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';

@Component({
  selector: 'top-bar-mobile-hamburger-menu',
  templateUrl: './top-bar-mobile-hamburger-menu.component.html',
})
export class TopBarMobileHamburgerMenuComponent {
  constructor(public globalVars: GlobalVarsService) {}
}
