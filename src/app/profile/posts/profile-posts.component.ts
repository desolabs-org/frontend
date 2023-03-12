import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  BackendApiService,
  PostEntryResponse,
  ProfileEntryResponse,
} from 'src/lib/services/backend-api';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { IAdapter, IDatasource } from 'ngx-ui-scroll';
import { InfiniteScroller } from 'src/lib/services/infinite-scroller';
import * as _ from 'lodash';

@Component({
  selector: 'profile-posts',
  templateUrl: './profile-posts.component.html',
})
export class ProfilePostsComponent {
  static PAGE_SIZE = 10;
  static BUFFER_SIZE = 5;
  static WINDOW_VIEWPORT = true;
  static PADDING = 0.5;

  @Input() profile: ProfileEntryResponse;
  @Input() afterCommentCreatedCallback: any = null;
  @Input() showProfileAsReserved: boolean;

  lastPage = null;
  loadingFirstPage = true;
  loadingNextPage = false;

  pagedKeys = {
    0: '',
  };

  @Output() blockUser = new EventEmitter();

  constructor(
    private globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private location: Location
  ) {}

  getPage(page: number) {
    if (this.lastPage != null && page > this.lastPage) {
      return [];
    }
    this.loadingNextPage = true;
    const lastPostHashHex = this.pagedKeys[page];
    return this.backendApi
      .GetPostsForPublicKey(
        this.globalVars.localNode,
        '',
        this.profile.Username,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        lastPostHashHex,
        ProfilePostsComponent.PAGE_SIZE,
        false /*MediaRequired*/
      )
      .toPromise()
      .then((res) => {
        const posts: PostEntryResponse[] = res.Posts;
        this.pagedKeys[page + 1] = res.LastPostHashHex || '';
        if (
          !posts ||
          posts.length < ProfilePostsComponent.PAGE_SIZE ||
          this.pagedKeys[page + 1] === ''
        ) {
          this.lastPage = page;
        }

        posts.map((post) => (post.ProfileEntryResponse = this.profile));
        return posts;
      })
      .finally(() => {
        this.loadingFirstPage = false;
        this.loadingNextPage = false;
      });
  }

  async _prependComment(uiPostParent, index, newComment) {
    const uiPostParentHashHex = this.globalVars.getPostContentHashHex(
      uiPostParent
    );
    await this.datasource.adapter.relax();
    await this.datasource.adapter.update({
      predicate: ({ $index, data, element }) => {
        let currentPost = (data as any) as PostEntryResponse;
        if ($index === index) {
          newComment.parentPost = currentPost;
          currentPost.Comments = currentPost.Comments || [];
          currentPost.Comments.unshift(_.cloneDeep(newComment));
          return [this.globalVars.incrementCommentCount(currentPost)];
        } else if (
          this.globalVars.getPostContentHashHex(currentPost) ===
          uiPostParentHashHex
        ) {
          // We also want to increment the comment count on any other notifications related to the same post hash hex.
          return [this.globalVars.incrementCommentCount(currentPost)];
        }
        // Leave all other items in the datasource as is.
        return true;
      },
    });
  }

  userBlocked() {
    this.blockUser.emit();
  }

  profileBelongsToLoggedInUser(): boolean {
    return (
      this.globalVars.loggedInUser?.ProfileEntryResponse &&
      this.globalVars.loggedInUser.ProfileEntryResponse.PublicKeyBase58Check ===
        this.profile.PublicKeyBase58Check
    );
  }

  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    ProfilePostsComponent.PAGE_SIZE,
    this.getPage.bind(this),
    ProfilePostsComponent.WINDOW_VIEWPORT,
    ProfilePostsComponent.BUFFER_SIZE,
    ProfilePostsComponent.PADDING
  );
  datasource: IDatasource<
    IAdapter<any>
  > = this.infiniteScroller.getDatasource();
}
