<template> 
  <i-tabs class="wf-auth-helpers">
    <i-tab-pane :label="i18next.t('AdminHelpers.tab.helpers')" name="helpers">
      <i-collapse>
          <i-panel name="admin_helpers">
              {{i18next.t('AdminHelpers.text.resetting_discussion_count_for_all_pages')}}
              <div slot="content">
                <p align="left">{{i18next.t('AdminHelpers.text.desc_resetting_discussion_count_for_all_pages')}}</p>
                <br>
                <i-poptip
                  confirm
                  :title="i18next.t('AdminHelpers.confirm.resetting_discussion_count_for_all_pages')"
                  @on-ok="resetDiscussionCountForAllPages"
                  :ok-text="i18next.t('common.btn.confirm')"
                  :cancel-text="i18next.t('common.btn.cancel')">
                  <i-button type="primary" :loading="isResettingDiscussionCountForAllPages">
                    <span v-if="!isResettingDiscussionCountForAllPages">{{i18next.t('AdminHelpers.btn.reset')}}</span>
                    <span v-else>{{i18next.t('AdminHelpers.btn.resetting')}}</span>
                  </i-button>
                </i-poptip>
              </div>
          </i-panel>
      </i-collapse>
    </i-tab-pane>
  </i-tabs>
</template>

<script>
import Bus from '../common/bus'
export default {
  name: 'wf-admin-helpers',
  data () {
    return {
      isResettingDiscussionCountForAllPages: false,
      pagesDiscussionCountToResetCount: 0
    }
  },
  computed: {
    db: () => Bus.db,
    i18next: () => Bus.i18next
  },
  methods: {
    resetDiscussionCountForAllPages () {
      this.isResettingDiscussionCountForAllPages = true
      this.db.ref(`pages`).once('value').then(snap => {
        const pages = snap.val() || {}
        this.pagesDiscussionCountToResetCount = Object.keys(pages).length
        Object.keys(pages).forEach(pageURL => {
          const commentIds = Object.keys(pages[pageURL].comments || {})
          let discussionCount = commentIds.length
          Promise.all(
            commentIds.map(commentId => this.db.ref(`commentReplies/${commentId}`).once('value'))
          ).then(snaps => {
            discussionCount += snaps.reduce((res, snap) => { return res + Object.keys(snap.val() || {}).length }, 0)
            this.db.ref(`pages/${pageURL}/discussionCount`).set(discussionCount)
            if (!--this.pagesDiscussionCountToResetCount) {
              this.isResettingDiscussionCountForAllPages = false
              this.$Message.success(this.i18next.t('AdminHelpers.success.resetting_discussion_count_for_all_pages'))
            }
          })
        })
      }).catch(() => {
        this.$Message.error(this.i18next.t('AdminHelpers.error.resetting_discussion_count_for_all_pages'))
      })
    }
  }
}
</script>
