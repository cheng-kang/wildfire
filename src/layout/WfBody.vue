<template>
  <section class="wf-body">
    <wf-reply-area
      :comments-loading-state="commentsLoadingState"
      style="margin-bottom: 30px;"
      :isMain="true"/>

    <template v-if="comments.length !== 0">
      <ul class="wf-comment-group">
        <component
          v-for="(cpntName, idx) in pluginComponents.comments.before"
          :is="cpntName"
          :key="cpntName+idx"
          v-bind="pluginProps(cpntName)"/>
        <wf-comment-card
          v-for="comment in currentPageComments"
          :key="comment.commentId"
          :comment="comment"/>
      </ul>
      <i-page
        :total="pageCommentsCount"
        :page-size="numberOfCommentsPerPage"
        v-if="pageCommentsCount > numberOfCommentsPerPage"
        size="small"
        @on-change="pageChanged"/>
    </template>

    <p v-else class="wf-no-content-tip">
      <span v-if="commentsLoadingState === 'loading'">
        <i-icon
          type="load-c"
          size="14"
          class="spin-icon"
          :style="{marginRight: '5px'}">
        </i-icon>
        {{t('Body.text.loading_comments')}}
      </span>
      <span v-if="commentsLoadingState === 'finished'">
        {{t('Body.text.post_the_first_comment')}}
      </span>
      <span v-if="commentsLoadingState === 'failed'" class="wf-error">
        {{t('Body.text.loading_comments_failed')}}
      </span>
    </p>

    <i-modal
      v-model="shouldShowMentionAutoComplete"
      width="330"
      style="text-align: center;"
      :closable="false"
      :footer-hide="true">
      <i-auto-complete
        ref="mentionAutoComplete"
        v-model="mentioningUsername"
        icon="ios-search"
        :placeholder="t('Body.placeholder.mention_autocomplete')"
        style="width:300px"
        @on-select="mentionAutoCompleteOnSelect">

        <i-option v-for="user in mentioningUserAutoComplete" :value="JSON.stringify(user)" :key="user.id">
          <div class="wf-mention-option">
            <img :src="user.photoURL">
            <span>{{ user.displayName }}</span>
            <span>{{ user.email }}</span>
          </div>
        </i-option>

      </i-auto-complete>
    </i-modal>

    <i-modal
      v-model="shouldShowCommentUserModal"
      :closable="false"
      :footer-hide="true"
      class-name="wf-vertical-center-modal">
      <wf-user-info-modal/>
    </i-modal>
  </section>
</template>

<script>
import Vue from 'vue';
import { bus, butler } from '../common';
import { PCM, pluginProps } from '../plugin';

export default {
  name: 'wf-body',
  props: ['comments', 'commentsLoadingState', 'pageCommentsCount'],
  data() {
    return {
      numberOfCommentsPerPage: 8,
      currentPage: 1,
      /* ↓for mention */
      shouldShowMentionAutoComplete: false,
      mentioningUsername: '',
      /* ↓for comment user modal */
      shouldShowCommentUserModal: false,
    };
  },
  computed: {
    t: () => (key) => butler.i18next.t(key),
    pluginComponents: () => ({
      comments: {
        before: PCM.get('comments.before'),
      },
    }),
    pluginProps: () => pluginProps,
    currentPageComments() {
      const start = (this.currentPage - 1) * this.numberOfCommentsPerPage;
      const end = this.currentPage * this.numberOfCommentsPerPage;
      return this.comments.slice(start, end);
    },
    mentioningUserAutoComplete() {
      if (!this.mentioningUsername) {
        return [];
      }
      return bus.users.filter(user => {
        const usernameLC = user.displayName.toLowerCase();
        const emailLC = user.email.toLowerCase();
        const mentioningUsernameLC = this.mentioningUsername.toLowerCase();
        return (
          usernameLC.indexOf(mentioningUsernameLC) !== -1 ||
          emailLC.indexOf(mentioningUsernameLC) !== -1
        );
      });
    },
  },
  created() {
    /**
     * Format users data for Mention auto complete
     */
    butler.db
      .ref('/users')
      .once('value')
      .then(snapshot => {
        const result = snapshot.val() || {};
        bus.users = Object.keys(result).map(id => {
          const {
            displayName,
            photoURL,
            email,
            isAdmin,
          } = result[id];

          if (isAdmin) {
            bus.admin = {
              displayName,
              photoURL,
              email,
              uid: id,
            };
          }

          return {
            displayName,
            photoURL,
            email,
            uid: id,
          };
        });
        bus.isLoadingUserData = false;
      });
    /**
     * ↓Observe `ShowMentionAutoComplete` event.
     *  Show Mention auto complete modal when needed.
     *
     *  It saves the uid of the current active reply
     *  area for later use (to specify reciever of
     *  `MentionAutoCompleteSelected-${id}` event).
     */
    bus.listenTo('ShowMentionAutoComplete', id => {
      bus.currentReplyAreaId = id;
      this.shouldShowMentionAutoComplete = true;
      Vue.nextTick(() => {
        this.$refs.mentionAutoComplete.$refs.input.focus();
      });
    });
    /**
     * ↓Observe `ShowUserInfo` event.
     *  Show user info modal which displays selected
     *  user information. If the param type is not `object`,
     *  retrieve user data with the passed param (which
     *  should be the email of the user).
     */
    bus.listenTo('ShowUserInfo', data => {
      if (typeof data === 'object') {
        this.$set(bus, 'selectedCommentUserInfo', data);
      } else {
        butler.db
          .ref('/users')
          .orderByChild('email')
          .equalTo(data)
          .once('value', snapshot => {
            const res = snapshot.val();
            if (res) {
              const uid = Object.keys(res)[0];
              const userByEmail = res[uid];
              this.$set(bus, 'selectedCommentUserInfo', {
                uid,
                displayName: userByEmail.displayName,
                photoURL: userByEmail.photoURL,
                email: userByEmail.email,
              });
            }
          });
      }
      this.shouldShowCommentUserModal = true;
    });
  },
  methods: {
    pageChanged(newPage) {
      this.currentPage = newPage;
    },
    mentionAutoCompleteOnSelect(value) {
      this.shouldShowMentionAutoComplete = false;
      this.mentioningUsername = '';
      const selectedUser = JSON.parse(value);
      const formattedMentionText = `[@${selectedUser.displayName}](${
        selectedUser.email
      }) `;
      /**
       * ↓Broadcast auto complete selection.
       *  A uid suffix is included in the event
       *  name to specify the reciever.
       */
      bus.$emit(
        `MentionAutoCompleteSelected-${bus.currentReplyAreaId}`,
        formattedMentionText,
      );
    },
  },
};
</script>
