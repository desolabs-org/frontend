import { Component } from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';

@Component({
  selector: 'tokens-page',
  templateUrl: './tokens-page.component.html',
})
export class TokensPageComponent {
  constructor(public globalVars: GlobalVarsService) {}
}
