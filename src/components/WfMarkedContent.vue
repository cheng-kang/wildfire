<template >
  <div ref="markedContent"></div>
</template>

<script>
import Vue from 'vue'
import sanitizeHtml from 'sanitize-html'
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
      const cleanedContent = this.markdown(sanitizeHtml(this.content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]),
        allowedAttributes: {
          '*': ['alt', 'title'],
          a: [ 'href', 'name', 'target' ],
          // We don't currently allow img itself by default, but this
          // would make sense if we did
          img: [ 'src', 'width', 'height' ]
        }
      }))
      const Component = Vue.extend({
        template: `<div> ${cleanedContent} </div>`,
        methods: {
          showUserInfo (email) {
            Bus.$emit('ShowUserInfo', email)
          }
        }
      })
      const markedComponent = new Component().$mount()
      this.$refs['markedContent'].appendChild(markedComponent.$el)
    },
    markdown (content) {
      const render = new marked.Renderer()
      render.link = (href, title, text) => {
        if (text.indexOf('@') === 0) {
          const email = href
          return `<a @click="showUserInfo('${email}')" title="${email}">${text}</a>`
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
