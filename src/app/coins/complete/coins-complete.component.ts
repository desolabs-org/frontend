import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { BackendApiService } from 'src/lib/services/backend-api';
import { CreatorCoinTrade } from 'src/lib/helpers/creator-coin-trade';

@Component({
  selector: 'coins-complete',
  templateUrl: './coins-complete.component.html',
})
export class CoinsCompleteComponent implements OnInit {
  @Input() creatorCoinTrade: CreatorCoinTrade;
  @Output() tradeAgainButtonClicked = new EventEmitter();

  router: Router;
  appData: GlobalVarsService;

  constructor(
    private globalVars: GlobalVarsService,
    private route: ActivatedRoute,
    private _router: Router,
    private backendApi: BackendApiService
  ) {
    this.appData = globalVars;
    this.router = _router;
  }

  _buyMoreClicked() {
    this.creatorCoinTrade.clearAllFields();
    this.tradeAgainButtonClicked.emit();
  }

  ngOnInit() {
    window.scroll(0, 0);
  }
}
