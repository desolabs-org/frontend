import { Component, OnInit } from '@angular/core';
import {
  DomSanitizer,
  SafeResourceUrl,
  Title,
} from '@angular/platform-browser';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'buy-deso-heroswap',
  templateUrl: './buy-deso-heroswap.component.html',
  styleUrls: ['./buy-deso-heroswap.component.scss'],
})
export class BuyDeSoHeroSwapComponent implements OnInit {
  iframeURL: SafeResourceUrl = '';

  constructor(
    public globalVars: GlobalVarsService,
    private sanitizer: DomSanitizer
  ) {
    if (!environment.heroswapURL) {
      return;
    }

    // Map theme to HeroSwap theme.
    let theme =
      {
        cake: 'light-peach',
        dark: 'dark-gray',
        greenish: 'dark-green',
        icydark: 'dark-icy',
        legends: 'dark-brown',
        light: 'default',
      }[localStorage.getItem('theme')] || 'default';

    if (
      theme === 'default' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      theme = 'dark-gray';
    }

    this.iframeURL = this.sanitizer.bypassSecurityTrustResourceUrl(
      [
        environment.heroswapURL,
        '/widget?',
        `network=${environment.production ? 'mainnet' : 'testnet'}`,
        `&theme=${theme}`,
        '&destinationTickers=DESO',
        '&destinationTicker=DESO',
        `&destinationAddress=${
          this.globalVars.loggedInUser?.PublicKeyBase58Check || ''
        }`,
        `${environment.heroswapAffiliateName ? '&affiliateName=' + environment.heroswapAffiliateName : ''}`,
        `&now=${Date.now()}`,
      ].join('')
    );
  }

  ngOnInit() {
    window.scroll(0, 0);
  }
}
