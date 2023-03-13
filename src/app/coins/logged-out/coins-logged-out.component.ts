import { Component, Input, OnInit } from '@angular/core';
import { CreatorCoinTrade } from 'src/lib/helpers/creator-coin-trade';
import { GlobalVarsService } from 'src/lib/services/global-vars';

@Component({
  selector: 'coins-logged-out',
  templateUrl: './coins-logged-out.component.html',
})
export class CoinsLoggedOutComponent {
  @Input() creatorCoinTrade: CreatorCoinTrade;

  constructor(public globalVars: GlobalVarsService) {}
}
