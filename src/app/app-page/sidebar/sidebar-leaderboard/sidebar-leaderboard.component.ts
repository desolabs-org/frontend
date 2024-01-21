import { Component, Input, OnInit } from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { SidebarComponent } from '../sidebar.component';

@Component({
  selector: 'sidebar-leaderboard',
  templateUrl: './sidebar-leaderboard.component.html',
})
export class SidebarLeaderboardComponent implements OnInit {
  static MAX_PROFILE_ENTRIES = 10;
  @Input() activeTab: string;

  SidebarComponent = SidebarComponent;

  constructor(
    public globalVars: GlobalVarsService,
  ) {}

  ngOnInit() {
    this.globalVars.updateLeaderboard();
  }
}
