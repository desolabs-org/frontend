import { Component, HostListener, Input, OnInit } from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';

@Component({
  selector: 'app-page',
  templateUrl: './app-page.component.html',
})
export class AppPageComponent implements OnInit {
  @Input() hideSidebar: string;
  @Input() showPostButton = false;
  mobile = false;

  @HostListener('window:resize') onResize() {
    this.setMobileBasedOnViewport();
  }

  constructor(private globalVars: GlobalVarsService) {}

  ngOnInit() {
    this.setMobileBasedOnViewport();
  }

  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }
}
