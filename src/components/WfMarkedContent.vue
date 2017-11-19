<template >
  <div ref="markedContent"></div>
</template>

<script>
import Vue from 'vue'
import '../assets/highlight.css'
import '../assets/highlight.dark.css'
import hljs from '../common/loadHighlightjs'
import marked from 'marked'
import Bus from '../common/bus'
export default {
  name: 'wf-marked-content',
  props: ['content'],
  mounted () {
    this.compile()
  },
  methods: {
    compile () {
      const _this = this
      var Component = Vue.extend({
        template: `<div> ${_this.markdown(_this.content)} </div>`,
        methods: {
          showUserInfo (email) {
            Bus.$emit('ShowUserInfo', email)
          }
        }
      })
      var markedComponent = new Component().$mount()
      this.$refs['markedContent'].appendChild(markedComponent.$el)
    },
    markdown (content) {
      var render = new marked.Renderer()
      render.link = (href, title, text) => {
        if (text.indexOf('@') === 0) {
          const email = href
          return `<a @click="showUserInfo('${email}')">${text}</a>`
        } else {
          return `<a href="${href}" alt="${title}">${text}</a>`
        }
      }
      marked.setOptions({
        renderer: render,
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        highlight: (code) => {
          return hljs.highlightAuto(code).value
        }
      })
      return marked(content)
    }
  }
}
</script>
