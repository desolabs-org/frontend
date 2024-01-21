import { Component, HostListener, OnInit } from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { FeedComponent } from '../feed.component';
import { Router } from '@angular/router';

@Component({
  selector: 'feed-page',
  templateUrl: './feed-page.component.html',
})
export class FeedPageComponent implements OnInit {
  FeedComponent = FeedComponent;

  activeTab: string = FeedComponent.DESO_TAB;
  isLeftBarMobileOpen = false;
  mobile = false;

  constructor(public globalVars: GlobalVarsService, private router: Router) {}

  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }

  @HostListener('window:resize')
  onResize() {
    this.setMobileBasedOnViewport();
  }

  ngOnInit() {
    this.setMobileBasedOnViewport();
  }
}
