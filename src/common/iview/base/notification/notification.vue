<template>
  <div class="wf">
    <div :class="classes" :style="styles">
      <Notice
        v-for="notice in notices"
        :key="notice.name"
        :prefix-cls="prefixCls"
        :styles="notice.styles"
        :type="notice.type"
        :content="notice.content"
        :duration="notice.duration"
        :closable="notice.closable"
        :name="notice.name"
        :transition-name="notice.transitionName"
        :on-close="notice.onClose">
      </Notice>
    </div>
  </div>
</template>
<script>
  import Notice from './notice.vue';

  const prefixCls = 'ivu-notification';
  let seed = 0;
  const nextSeed = () => {
    seed += 1;
    return seed;
  };
  const now = Date.now();

  function getUuid() {
    return `ivuNotification_${now}_${nextSeed()}`;
  }

  export default {
    components: { Notice },
    props: {
      prefixCls: {
        type: String,
        default: prefixCls,
      },
      styles: {
        type: Object,
        default() {
          return {
            top: '65px',
            left: '50%',
          };
        },
      },
      content: {
        type: String,
      },
      className: {
        type: String,
      },
    },
    data() {
      return {
        notices: [],
      };
    },
    computed: {
      classes() {
        return [
          `${this.prefixCls}`,
          {
            [`${this.className}`]: !!this.className,
          },
        ];
      },
    },
    methods: {
      add(notice) {
        const name = notice.name || getUuid();

        const _notice = Object.assign({
          styles: {
            right: '50%',
          },
          content: '',
          duration: 1.5,
          closable: false,
          name,
        }, notice);

        this.notices.push(_notice);
      },
      close(name) {
        for (let i = 0; i < this.notices.length; i += 1) {
          if (this.notices[i].name === name) {
            this.notices.splice(i, 1);
            break;
          }
        }
      },
      closeAll() {
        this.notices = [];
      },
    },
  };
</script>
