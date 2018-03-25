<template> 
  <i-tabs class="wf-auth-helpers">
    <i-tab-pane :label="t('AdminHelpers.tab.helpers')" name="helpers">
      <i-collapse>
          <i-panel name="admin_helpers">
              {{t('AdminHelpers.text.resetting_discussion_count_for_all_pages')}}
              <div slot="content">
                <p align="left">{{t('AdminHelpers.text.desc_resetting_discussion_count_for_all_pages')}}</p>
                <br>
                <i-poptip
                  confirm
                  :title="t('AdminHelpers.confirm.resetting_discussion_count_for_all_pages')"
                  @on-ok="resetDiscussionCountForAllPages"
                  :ok-text="t('common.btn.confirm')"
                  :cancel-text="t('common.btn.cancel')">
                  <i-button type="primary" :loading="isResettingDiscussionCountForAllPages">
                    <span v-if="!isResettingDiscussionCountForAllPages">{{t('AdminHelpers.btn.reset')}}</span>
                    <span v-else>{{t('AdminHelpers.btn.resetting')}}</span>
                  </i-button>
                </i-poptip>
              </div>
          </i-panel>
      </i-collapse>
    </i-tab-pane>
  </i-tabs>
</template>

<script>
import { butler } from '../common';

export default {
  name: 'wf-admin-helpers',
  data() {
    return {
      isResettingDiscussionCountForAllPages: false,
      pagesDiscussionCountToResetCount: 0,
    };
  },
  computed: {
    t: () => (key) => butler.i18next.t(key),
  },
  methods: {
    resetDiscussionCountForAllPages() {
      this.isResettingDiscussionCountForAllPages = true;
      butler.db.ref('pages').once('value').then(snap => {
        const pages = snap.val() || {};
        this.pagesDiscussionCountToResetCount = Object.keys(pages).length;
        Object.keys(pages).forEach(pageURL => {
          const commentIds = Object.keys(pages[pageURL].comments || {});
          let discussionCount = commentIds.length;
          Promise.all(commentIds.map(commentId => butler.db.ref(`commentReplies/${commentId}`).once('value'))).then(snaps => {
            discussionCount += (
              snaps.reduce(
                (res, snap) => res + Object.keys(snap.val() || {}).length,
                0,
              )
            );
            butler.db.ref(`pages/${pageURL}/discussionCount`).set(discussionCount);
            this.pagesDiscussionCountToResetCount -= 1;
            if (!this.pagesDiscussionCountToResetCount) {
              this.isResettingDiscussionCountForAllPages = false;
              this.$Message.success(this.t('AdminHelpers.success.resetting_discussion_count_for_all_pages'));
            }
          });
        });
      }).catch(() => {
        this.$Message.error(this.t('AdminHelpers.error.resetting_discussion_count_for_all_pages'));
      });
    },
  },
};
</script>
