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
    validateEmail (str) {
      return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test((str || '').toLowerCase())
    },
    compile () {
      const cleanedContent = sanitizeHtml(this.markdown(this.content), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'span' ]),
        allowedAttributes: {
          '*': ['alt', 'title', 'class'],
          a: [ 'href', 'target', '@click' ],
          img: [ 'src', 'width', 'height' ]
        },
        transformTags: {
          'a': (tagName, attribs) => {
            const { title, href, alt } = attribs
            let attrs = { target: '_blank' }
            if (this.validateEmail(title)) { attrs['@click'] = `showUserInfo('${title}')` }
            if (title) { attrs['title'] = title }
            if (href) { attrs['href'] = href }
            if (alt) { attrs['alt'] = alt }
            return {
              tagName: 'a',
              attribs: attrs
            }
          }
        }
      })
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
          return `<a title="${email}">${text}</a>`
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
