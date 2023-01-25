import { Component, OnInit } from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendApiService } from 'src/lib/services/backend-api';

@Component({
  selector: 'trade-creator-page',
  templateUrl: './trade-creator-page.component.html',
  styleUrls: ['./trade-creator-page.component.scss'],
})
export class TradeCreatorPageComponent {
  constructor(public globalVars: GlobalVarsService) {}
}
