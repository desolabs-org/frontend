import { Component, OnInit, Input } from '@angular/core';
import { NavigationService } from 'src/lib/services/navigation';

@Component({
  selector: 'top-bar-mobile-navigation-control',
  templateUrl: './top-bar-mobile-navigation-control.component.html',
})
export class TopBarMobileNavigationControlComponent {
  @Input() forceShowBackButton = false;
  @Input() isLightColor = false;

  constructor(public navigationService: NavigationService) {}
}
