import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  ChangeDetectorRef,
  AfterViewChecked,
} from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { BackendApiService } from 'src/lib/services/backend-api';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { tap, finalize, first } from 'rxjs/operators';
import * as _ from 'lodash';
import PullToRefresh from 'pulltorefreshjs';
import { Title } from '@angular/platform-browser';
import { NftPostComponent } from 'src/app/nft/nft-post-page/nft-post/nft-post.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'feed',
  templateUrl: './feed.component.html',
})
export class FeedComponent implements OnInit, OnDestroy, AfterViewChecked {
  static DESO_TAB = 'Deso';
  static FOLLOWING_TAB = 'Following';
  static NEW_TAB = 'New';
  static TABS = [
    FeedComponent.FOLLOWING_TAB,
    FeedComponent.DESO_TAB,
    FeedComponent.NEW_TAB
  ];
  static NUM_TO_FETCH = 50;
  static MIN_FOLLOWING_TO_SHOW_FOLLOW_FEED_BY_DEFAULT = 10;
  static PULL_TO_REFRESH_MARKER_ID = 'pull-to-refresh-marker';

  @Input() activeTab: string;
  @Input() isMobile = false;

  loggedInUserSubscription: Subscription;
  followChangeSubscription: Subscription;
  FeedComponent = FeedComponent;
  switchingTabs = false;

  followedPublicKeyToProfileEntry = {};

  loadingFirstBatchOfFollowFeedPosts = false;
  loadingFirstBatchOfNewFeedPosts = false;
  loadingFirstBatchOfGlobalFeedPosts = false;
  isLoadingFollowingOnPageLoad;

  globalVars: GlobalVarsService;
  serverHasMoreFollowFeedPosts = true;
  serverHasMoreNewFeedPosts = true;
  serverHasMoreGlobalFeedPosts = true;
  loadingMoreFollowFeedPosts = false;
  loadingMoreNewFeedPosts = false;
  loadingMoreGlobalFeedPosts = false;

  pullToRefreshHandler;

  feedTabs = [];

  constructor(
    private appData: GlobalVarsService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private backendApi: BackendApiService,
    private titleService: Title
  ) {
    this.globalVars = appData;

    // A default activeTab will be set after we load the follow feed (based on whether
    // the user is following anybody)
    this.activeTab = null;

    // Reload the follow feed any time the user follows / unfollows somebody
    this.followChangeSubscription = this.appData.followChangeObservable.subscribe(
      (followChangeObservableResult) => {
        this._reloadFollowFeed();
      }
    );

    this.loggedInUserSubscription = this.appData.loggedInUserObservable.subscribe(
      (loggedInUserObservableResult) => {
        // Reload the follow feed if the logged in user changed
        if (!loggedInUserObservableResult.isSameUserAsBefore) {
          // Set activeTab to null so that a sensible default tab is selected
          this.activeTab = null;
          this._initializeFeeds();
        }
      }
    );
  }

  ngOnInit() {
    this._initializeFeeds();
    this.titleService.setTitle(`Feed - ${environment.node.name}`);
  }

  ngAfterViewChecked() {
    // if the marker was removed for some reason,
    // then clear out the handler to allow it to be recreated later
    if (!document.getElementById(this.getPullToRefreshMarkerId())) {
      this.pullToRefreshHandler?.destroy();
      this.pullToRefreshHandler = undefined;
    } else if (!this.pullToRefreshHandler) {
      // initialize the handler only once when the
      // marker is first created
      this.pullToRefreshHandler = PullToRefresh.init({
        mainElement: `#${this.getPullToRefreshMarkerId()}`,
        onRefresh: () => {
          const globalPostsPromise = this._loadPosts(true);
          const followPostsPromise = this._loadFollowFeedPosts(true);
          const newPostsPromise = this._loadFollowFeedPosts(true);
          if (this.activeTab === FeedComponent.FOLLOWING_TAB) {
            return followPostsPromise;
          } else if (this.activeTab === FeedComponent.DESO_TAB) {
            return globalPostsPromise;
          } else {
            return newPostsPromise;
          }
        },
      });
    }
  }

  ngOnDestroy() {
    this.pullToRefreshHandler?.destroy();
    this.loggedInUserSubscription.unsubscribe();
  }

  _reloadFollowFeed() {
    // Reload the follow feed from scratch
    this.globalVars.followFeedPosts = [];
    this.loadingFirstBatchOfFollowFeedPosts = true;
    return this._loadFollowFeedPosts();
  }

  _reloadNewFeed() {
    // Reload the follow feed from scratch
    this.globalVars.newFeedPosts = [];
    this.loadingFirstBatchOfNewFeedPosts = true;
    return this._loadNewFeedPosts();
  }

  _initializeFeeds() {
    if (this.globalVars.postsToShow.length === 0) {
      // Get some posts to show the user.
      this.loadingFirstBatchOfGlobalFeedPosts = true;
      this._loadPosts();
    } else {
      // If we already have posts to show, delay rendering the posts for a hot second so nav is fast.
      // this._onTabSwitch()
    }

    // Request the follow feed (so we have it ready for display if needed)
    if (this.globalVars.followFeedPosts.length === 0) {
      this.loadingFirstBatchOfFollowFeedPosts = true;
      this._reloadFollowFeed();
    }

    // Request the new feed (so we have it ready for display if needed)
    if (this.globalVars.newFeedPosts.length === 0) {
      this.loadingFirstBatchOfFollowFeedPosts = true;
      this._reloadNewFeed();
    }

    // The activeTab is set after we load the following based on whether the user is
    // already following anybody
    if (this.appData.loggedInUser) {
      this._loadFollowing();
    } else {
      // If there's no user, consider the following to be loaded (it's empty)
      this._afterLoadingFollowingOnPageLoad();
    }
  }

  getPullToRefreshMarkerId() {
    return FeedComponent.PULL_TO_REFRESH_MARKER_ID;
  }

  prependPostToFeed(postEntryResponse) {
    FeedComponent.prependPostToFeed(this.postsToShow(), postEntryResponse);
  }

  onPostHidden(postEntryResponse) {
    const parentPostIndex = FeedComponent.findParentPostIndex(
      this.postsToShow(),
      postEntryResponse
    );
    const parentPost = this.postsToShow()[parentPostIndex];

    FeedComponent.onPostHidden(
      this.postsToShow(),
      postEntryResponse,
      parentPost,
      null /*grandparentPost... don't worry about them on the feed*/
    );

    // Remove / re-add the parentPost from postsToShow, to force
    // angular to re-render now that we've updated the comment count
    this.postsToShow()[parentPostIndex] = _.cloneDeep(parentPost);
  }

  userBlocked() {
    this.cdr.detectChanges();
  }

  appendCommentAfterParentPost(postEntryResponse) {
    FeedComponent.appendCommentAfterParentPost(
      this.postsToShow(),
      postEntryResponse
    );
  }

  hideFollowLink() {
    return this.activeTab === FeedComponent.FOLLOWING_TAB;
  }

  postsToShow() {
    if (this.activeTab === FeedComponent.FOLLOWING_TAB) {
      // No need to delay on the Following tab. It handles the "slow switching" issue itself.
      return this.globalVars.followFeedPosts;
    } else if (this.activeTab === FeedComponent.DESO_TAB) {
      return this.globalVars.postsToShow;
    } else {
      return this.globalVars.newFeedPosts;
    }
  }

  activeTabReadyForDisplay() {
    // If we don't have the following yet, we don't even know which tab to display
    if (this.isLoadingFollowingOnPageLoad) {
      return false;
    }

    if (this.activeTab === FeedComponent.FOLLOWING_TAB) {
      // No need to delay on the Following tab. It handles the "slow switching" issue itself.
      return this.loadingMoreFollowFeedPosts;
    } else {
      return this.loadingMoreGlobalFeedPosts;
    }
  }

  showLoadingSpinner() {
    return (
      this.loadingFirstBatchOfActiveTabPosts() || this.switchingTabs
    );
  }

  // controls whether we show the loading spinner
  loadingFirstBatchOfActiveTabPosts() {
    if (this.activeTab === FeedComponent.FOLLOWING_TAB) {
      return this.loadingFirstBatchOfFollowFeedPosts;
    } else if (this.activeTab === FeedComponent.DESO_TAB) {
      return this.loadingFirstBatchOfGlobalFeedPosts;
    } else {
      return this.loadingFirstBatchOfNewFeedPosts;
    }
  }

  showGlobalOrFollowingPosts() {
    return (
      this.postsToShow().length > 0 &&
      (this.activeTab === FeedComponent.DESO_TAB ||
        this.activeTab === FeedComponent.FOLLOWING_TAB ||
        this.activeTab === FeedComponent.NEW_TAB)
    );
  }

  showNoPostsFound() {
    // activeTab == FeedComponent.GLOBAL_TAB && globalVars.postsToShow.length == 0 && !loadingPosts
    return (
      this.postsToShow().length === 0 &&
      (this.activeTab === FeedComponent.DESO_TAB ||
        this.activeTab === FeedComponent.FOLLOWING_TAB ||
        this.activeTab === FeedComponent.NEW_TAB) &&
      !this.loadingFirstBatchOfActiveTabPosts()
    );
  }

  loadMorePosts() {
    if (this.activeTab === FeedComponent.FOLLOWING_TAB) {
      this._loadFollowFeedPosts();
    } else if (this.activeTab === FeedComponent.DESO_TAB) {
      this._loadPosts();
    } else {
      this._loadNewFeedPosts();
    }
  }

  showMoreButton() {
    if (this.loadingFirstBatchOfActiveTabPosts()) {
      return false;
    }

    if (this.activeTab === FeedComponent.FOLLOWING_TAB) {
      return this.serverHasMoreFollowFeedPosts;
    } else if (this.activeTab === FeedComponent.DESO_TAB) {
      return this.serverHasMoreGlobalFeedPosts;
    } else {
      return this.serverHasMoreNewFeedPosts;
    }
  }

  _onTabSwitch() {
    // Delay rendering the posts for a hot second so nav is fast.
    this.switchingTabs = true;
    setTimeout(() => {
      this.switchingTabs = false;
    }, 0);
  }

  _loadPosts(reload: boolean = false) {
    this.loadingMoreGlobalFeedPosts = true;

    // Get the reader's public key for the request.
    let readerPubKey = '';
    if (this.globalVars.loggedInUser) {
      readerPubKey = this.globalVars.loggedInUser.PublicKeyBase58Check;
    }

    // Get the last post hash in case this is a "load more" request.
    let lastPostHash = '';
    if (this.globalVars.postsToShow.length > 0 && !reload) {
      lastPostHash = this.globalVars.postsToShow[
        this.globalVars.postsToShow.length - 1
      ].PostHashHex;
    }

    const hotFeedPostHashes = _.map(this.globalVars.postsToShow, 'PostHashHex');
    return this.backendApi
      .GetHotFeed(
        this.globalVars.localNode,
        readerPubKey,
        hotFeedPostHashes,
        this.FeedComponent.NUM_TO_FETCH
      )
      .pipe(
        tap(
          (res) => {
            if (res.HotFeedPage) {
              this.globalVars.postsToShow = this.globalVars.postsToShow.concat(
                res.HotFeedPage
              );
            }
          },
          (err) => {
            console.error(err);
            this.globalVars._alertError(
              'Error loading posts: ' + this.backendApi.stringifyError(err)
            );
          }
        ),
        finalize(() => {
          this.loadingFirstBatchOfGlobalFeedPosts = false;
          this.loadingMoreGlobalFeedPosts = false;
        }),
        first()
      )
      .toPromise();
  }

  _loadFollowing() {
    this.isLoadingFollowingOnPageLoad = true;
    this.backendApi
      .GetFollows(
        this.appData.localNode,
        '' /* username */,
        this.appData.loggedInUser.PublicKeyBase58Check,
        false /* getEntriesFollowingPublicKey */
      )
      .subscribe(
        (response) => {
          this.followedPublicKeyToProfileEntry =
            response.PublicKeyToProfileEntry;
        },
        (error) => {}
      )
      .add(() => {
        this._afterLoadingFollowingOnPageLoad();
      });
  }

  _loadFollowFeedPosts(reload: boolean = false) {
    this.loadingMoreFollowFeedPosts = true;

    // Get the reader's public key for the request.
    let readerPubKey = '';
    if (this.globalVars.loggedInUser) {
      readerPubKey = this.globalVars.loggedInUser.PublicKeyBase58Check;
    }

    // Get the last post hash in case this is a "load more" request.
    let lastPostHash = '';
    if (this.globalVars.followFeedPosts.length > 0 && !reload) {
      lastPostHash = this.globalVars.followFeedPosts[
        this.globalVars.followFeedPosts.length - 1
      ].PostHashHex;
    }
    return this.backendApi
      .GetPostsStateless(
        this.globalVars.localNode,
        lastPostHash /*PostHash*/,
        readerPubKey /*ReaderPublicKeyBase58Check*/,
        'newest' /*OrderBy*/,
        parseInt(this.globalVars.filterType) /*StartTstampSecs*/,
        '',
        FeedComponent.NUM_TO_FETCH /*NumToFetch*/,
        false /*FetchSubcomments*/,
        true /*GetPostsForFollowFeed*/,
        false /*GetPostsForGlobalWhitelist*/,
        false,
        false /*MediaRequired*/,
        0,
        this.globalVars.showAdminTools() /*AddGlobalFeedBool*/
      )
      .pipe(
        tap(
          (res) => {
            if (lastPostHash !== '') {
              this.globalVars.followFeedPosts = this.globalVars.followFeedPosts.concat(
                res.PostsFound
              );
            } else {
              this.globalVars.followFeedPosts = res.PostsFound;
            }
            if (res.PostsFound.length < FeedComponent.NUM_TO_FETCH) {
              this.serverHasMoreFollowFeedPosts = false;
              // Note: the server may be out of posts even if res.PostsFond == NUM_TO_FETCH.
              // This can happen if the server returns the last NUM_TO_FETCH posts exactly.
              // In that case, the user will click the load more button one more time, and then
              // the server will return 0. Obviously this isn't great behavior, but hopefully
              // we'll swap out the load more button for infinite scroll soon anyway.
            }
            this.loadingFirstBatchOfFollowFeedPosts = false;
            this.loadingMoreFollowFeedPosts = false;
          },
          (err) => {
            console.error(err);
            this.globalVars._alertError(
              'Error loading posts: ' + this.backendApi.stringifyError(err)
            );
          }
        ),
        finalize(() => {
          this.loadingFirstBatchOfFollowFeedPosts = false;
          this.loadingMoreFollowFeedPosts = false;
        }),
        first()
      )
      .toPromise();
  }

  _loadNewFeedPosts(reload: boolean = false) {
    this.loadingMoreNewFeedPosts = true;

    // Get the reader's public key for the request.
    let readerPubKey = '';
    if (this.globalVars.loggedInUser) {
      readerPubKey = this.globalVars.loggedInUser.PublicKeyBase58Check;
    }

    // Get the last post hash in case this is a "load more" request.
    let lastPostHash = '';
    if (this.globalVars.newFeedPosts.length > 0 && !reload) {
      lastPostHash = this.globalVars.newFeedPosts[
        this.globalVars.newFeedPosts.length - 1
      ].PostHashHex;
    }
    return this.backendApi
      .GetPostsStateless(
        this.globalVars.localNode,
        lastPostHash /*PostHash*/,
        readerPubKey /*ReaderPublicKeyBase58Check*/,
        'newest' /*OrderBy*/,
        parseInt(this.globalVars.filterType) /*StartTstampSecs*/,
        '',
        FeedComponent.NUM_TO_FETCH /*NumToFetch*/,
        false /*FetchSubcomments*/,
        false /*GetPostsForFollowFeed*/,
        false /*GetPostsForGlobalWhitelist*/,
        false,
        false /*MediaRequired*/,
        0,
        this.globalVars.showAdminTools() /*AddGlobalFeedBool*/
      )
      .pipe(
        tap(
          (res) => {
            if (lastPostHash !== '') {
              this.globalVars.newFeedPosts = this.globalVars.newFeedPosts.concat(
                res.PostsFound
              );
            } else {
              this.globalVars.newFeedPosts = res.PostsFound;
            }
            if (res.PostsFound.length < FeedComponent.NUM_TO_FETCH) {
              this.serverHasMoreNewFeedPosts = false;
              // Note: the server may be out of posts even if res.PostsFond == NUM_TO_FETCH.
              // This can happen if the server returns the last NUM_TO_FETCH posts exactly.
              // In that case, the user will click the load more button one more time, and then
              // the server will return 0. Obviously this isn't great behavior, but hopefully
              // we'll swap out the load more button for infinite scroll soon anyway.
            }
            this.loadingFirstBatchOfNewFeedPosts = false;
            this.loadingMoreNewFeedPosts = false;
          },
          (err) => {
            console.error(err);
            this.globalVars._alertError(
              'Error loading posts: ' + this.backendApi.stringifyError(err)
            );
          }
        ),
        finalize(() => {
          this.loadingFirstBatchOfNewFeedPosts = false;
          this.loadingMoreNewFeedPosts = false;
        }),
        first()
      )
      .toPromise();
  }

  _afterLoadingFollowingOnPageLoad() {
    this.isLoadingFollowingOnPageLoad = false;

    // defaultActiveTab is "Following" if the user is following anybody. Otherwise
    // the default is global.
    let defaultActiveTab;
    const numFollowing = Object.keys(this.followedPublicKeyToProfileEntry)
      .length;
    if (
      numFollowing >= FeedComponent.MIN_FOLLOWING_TO_SHOW_FOLLOW_FEED_BY_DEFAULT
    ) {
      defaultActiveTab = FeedComponent.FOLLOWING_TAB;
    } else {
      defaultActiveTab = FeedComponent.DESO_TAB;
    }

    this.feedTabs = [
      FeedComponent.DESO_TAB,
      FeedComponent.FOLLOWING_TAB,
      FeedComponent.NEW_TAB
    ];

    if (!this.activeTab) {
      this.activeTab = defaultActiveTab;
    }
    this._handleTabClick(this.activeTab);
  }

  _handleTabClick(tab: string) {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { feedTab: this.activeTab },
      queryParamsHandling: 'merge',
    });
    this._onTabSwitch();
  }

  static prependPostToFeed(postsToShow, postEntryResponse) {
    postsToShow.unshift(postEntryResponse);
  }

  // Note: the caller of this function may need to re-render the parentPost and grandparentPost,
  // since we update their CommentCounts
  static onPostHidden(
    postsToShow,
    postEntryResponse,
    parentPost,
    grandparentPost
  ) {
    const postIndex = postsToShow.findIndex((post) => {
      return post.PostHashHex === postEntryResponse.PostHashHex;
    });

    if (postIndex === -1) {
      console.error(
        `Problem finding postEntryResponse in postsToShow in onPostHidden`,
        {
          postEntryResponse,
          postsToShow,
        }
      );
    }

    // the current post (1) + the CommentCount comments/subcomments were hidden
    const decrementAmount = 1 + postEntryResponse.CommentCount;

    if (parentPost != null) {
      parentPost.CommentCount -= decrementAmount;
    }

    if (grandparentPost != null) {
      grandparentPost.CommentCount -= decrementAmount;
    }

    postsToShow.splice(postIndex, 1);
  }

  static findParentPostIndex(postsToShow, postEntryResponse) {
    return postsToShow.findIndex((post) => {
      return post.PostHashHex === postEntryResponse.ParentStakeID;
    });
  }

  static appendCommentAfterParentPost(postsToShow, postEntryResponse) {
    const parentPostIndex = FeedComponent.findParentPostIndex(
      postsToShow,
      postEntryResponse
    );
    const parentPost = postsToShow[parentPostIndex];

    // Note: we don't worry about updating the grandparent posts' commentCount in the feed
    parentPost.CommentCount += 1;

    // This is a hack to make it so that the new comment shows up in the
    // feed with the "replying to @[parentPost.Username]" content displayed.
    postEntryResponse.parentPost = parentPost;

    // Insert the new comment in the correct place in the postsToShow list.
    // TODO: This doesn't work properly for comments on subcomments (they appear in the wrong
    // place in the list), but whatever, we can try to fix this edge case later
    postsToShow.splice(parentPostIndex + 1, 0, postEntryResponse);

    // Add the post to the parent's list of comments so that the comment count gets updated
    parentPost.Comments = parentPost.Comments || [];
    parentPost.Comments.unshift(postEntryResponse);
  }
}
