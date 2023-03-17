import { Component, Input, OnInit } from '@angular/core';
import { CreatorCoinTrade } from 'src/lib/helpers/creator-coin-trade';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { FollowService } from 'src/lib/services/follow.service';

@Component({
  selector: 'coins-table',
  templateUrl: './coins-table.component.html',
})
export class CoinsTableComponent {
  static FOUNDER_REWARD_EXPLANATION =
    'The founder reward is set by the creator and determines what percentage of your purchase goes directly to the creator. You can set a founder reward for yourself, too!';

  @Input() displayForCreatorForm: boolean = false;
  @Input() creatorCoinTrade: CreatorCoinTrade;

  hideFollowPrompt = true;
  CoinsTableComponent = CoinsTableComponent;
  appData: GlobalVarsService;
  buyVerb = CreatorCoinTrade.BUY_VERB;

  constructor(
    public globalVars: GlobalVarsService,
    private followService: FollowService
  ) {
    this.appData = globalVars;
  }
}
