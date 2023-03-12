import { Component, OnInit } from '@angular/core'
import { AppRoutingModule } from 'src/app/app-routing.module'
import { GlobalVarsService } from 'src/lib/services/global-vars'
import { BackendApiService } from 'src/lib/services/backend-api'
import { Router } from '@angular/router'

@Component({
  selector: 'landing-hackathons',
  templateUrl: './landing-hackathons.component.html',
})
export class LandingHackathonsComponent implements OnInit {
  AppRoutingModule = AppRoutingModule

  goldSponsors = [
      { name: 'PBMC', banner: 'assets/img/hackathons/crypt0winter-2022/banners/pbmc_banner.jpg'},
      { name: 'Seelz', banner: 'assets/img/hackathons/crypt0winter-2022/banners/seelz_banner.gif'},
      { name: 'tijn', banner: 'assets/img/hackathons/crypt0winter-2022/banners/tijn_banner.png'},
      { name: 'WhaleSharkETH', banner: 'assets/img/hackathons/crypt0winter-2022/banners/whalesharketh_banner.png'},
      { name: 'GOOSIES', banner: 'https://arweave.net/JcoUbwaV2z2_N1gNgxizvz6fgNJJ-ARUKcF0mRD2yM0'},
      { name: 'MissKatiann', banner: 'assets/img/hackathons/crypt0winter-2022/banners/misskatiann_banner.png'},
      { name: 'Desomon', banner: 'assets/img/hackathons/crypt0winter-2022/banners/desomon_banner.jpg'},
    ]

  silverSponsors = []
  communitySponsors = []

  constructor(public globalVars: GlobalVarsService, private router: Router, private backendApi: BackendApiService) {}

  ngOnInit() {
    this.backendApi
      .GetNFTBidsForNFTPost(this.globalVars.localNode, 
        'BC1YLjBvzHjemzgY4va55AzZ7VhRBLDmjxsfxRHQ9PybPARMQvtDH5N', 
        'ece78b9f3f20c678f9433349fe6df2f32a410f17816d2e371714452b1ca32998')
      .toPromise()
      .then((res) => {
        this.silverSponsors = res.NFTEntryResponses.sort((l, r) => l.SerialNumber - r.SerialNumber);
      })

    this.backendApi
      .GetNFTBidsForNFTPost(this.globalVars.localNode, 
        'BC1YLjBvzHjemzgY4va55AzZ7VhRBLDmjxsfxRHQ9PybPARMQvtDH5N', 
        '0dfe7d735e756ce89f92bbd2b6a16f6ef3da621169bd507b20778a5b0bed6726')
      .toPromise()
      .then((res) => {
        this.communitySponsors = res.NFTEntryResponses.sort((l, r) => l.SerialNumber - r.SerialNumber);
      })
  }
}
