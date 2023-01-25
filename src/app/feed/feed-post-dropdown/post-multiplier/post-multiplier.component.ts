import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import {
  BackendApiService,
  PostEntryResponse,
} from 'src/lib/services/backend-api';
import { GlobalVarsService } from 'src/lib/services/global-vars';

@Component({
  selector: 'post-multiplier',
  templateUrl: './post-multiplier.component.html',
})
export class PostMultiplierComponent implements OnInit {
  post: PostEntryResponse;
  postMultiplier = 0;
  updatingPostMultiplier = false;
  errorUpdatingMultiplier = false;
  successfullyUpdatedMultiplier = false;

  constructor(
    public globalVars: GlobalVarsService,
    public bsModalRef: BsModalRef,
    private backendApi: BackendApiService
  ) {}

  ngOnInit(): void {}

  updatePostMultiplier() {
    this.updatingPostMultiplier = true;
    this.backendApi
      .AdminUpdateHotFeedPostMultiplier(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        this.post.PostHashHex,
        this.postMultiplier
      )
      .subscribe(
        (res) => {
          this.successfullyUpdatedMultiplier = true;
        },
        (err) => {
          console.error(err);
          this.errorUpdatingMultiplier = true;
        }
      )
      .add(() => {
        this.updatingPostMultiplier = false;
      });
  }
}
