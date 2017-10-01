<template >
  <div ref="markedContent"></div>
</template>

<script>
import 'highlight.js/styles/googlecode.css'
import hljs from 'highlight.js'
import marked from 'marked'
import Vue from 'vue'
import Bus from '../bus'
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
          showFullImage (href, title, text) {
            let image = new Image()
            image.src = href
            image.onload = () => {
              let imgWidth = image.width
              let imgHeight = image.height
              let ratio = imgHeight / imgWidth
              let imgInitWidth = Math.min(500, imgWidth)
              let warpWidth = Math.max(imgInitWidth, 400)
              let warpHeight = Math.min(350, imgHeight)

              let step = 50
              let modalInstance = this.$Modal.newInstance({
                closeable: true,
                maskClosable: true,
                footerHide: true,
                render: (h) => {
                  return h('div', {
                    style: {
                      'width': warpWidth + 'px',
                      'height': warpHeight + 'px',
                      'overflow': 'hidden',
                      'text-align': 'center'
                    }
                  }, [
                    h('img', {
                      style: {
                        'display': 'block',
                        'cursor': '-webkit-grab',
                        'position': 'absolute',
                        'left': (warpWidth - imgInitWidth) / 2 + 'px',
                        'top': (warpHeight - ratio * imgInitWidth) / 2 + 'px'
                      },
                      attrs: {
                        src: href,
                        alt: text,
                        width: imgInitWidth,
                        height: ratio * imgInitWidth
                      },
                      on: {
                        wheel: (event) => {
                          let e = event || window.event
                          if (e.wheelDelta > 0 || e.detail > 0) {
                            if (e.target.width < imgWidth) {
                              e.target.style.left = (parseFloat(e.target.style.left) - e.offsetX / e.target.width * step) + 'px'
                              e.target.style.top = (parseFloat(e.target.style.top) - e.offsetY / e.target.height * step * ratio) + 'px'
                              e.target.width += step
                              e.target.height = e.target.width * ratio
                            }
                          } else if (e.wheelDelta < 0 || e.detail < 0) {
                            if (e.target.width > imgInitWidth + step) {
                              e.target.style.left = parseFloat(e.target.style.left) + e.offsetX / e.target.width * step + 'px'
                              e.target.style.top = parseFloat(e.target.style.top) + e.offsetY / e.target.height * step * ratio + 'px'
                              e.target.width -= step
                              e.target.height = e.target.width * ratio
                            } else {
                              e.target.width = imgInitWidth
                              e.target.height = ratio * imgInitWidth
                              e.target.style.top = (warpHeight - ratio * imgInitWidth) / 2 + 'px'
                              e.target.style.left = (warpWidth - imgInitWidth) / 2 + 'px'
                            }
                          }
                          e = undefined
                        },
                        mousedown: (event) => {
                          let e = event || window.event
                          e.preventDefault()
                          let imgTarget = e.target
                          let disX = e.clientX - imgTarget.offsetLeft
                          let disY = e.clientY - imgTarget.offsetTop
                          imgTarget.onmousemove = (event) => {
                            let e = event || window.event
                            e.preventDefault()
                            let left = e.clientX - disX
                            let top = e.clientY - disY
                            imgTarget.style.left = left + 'px'
                            imgTarget.style.top = top + 'px'
                          }
                          document.onmouseup = (event) => {
                            let e = event || window.event
                            e.preventDefault()
                            imgTarget.onmousemove = () => {}
                          }
                        }
                      }
                    })
                  ])
                }
              })
              modalInstance.component.mask = () => {
                if (modalInstance.component.maskClosable) {
                  modalInstance.component.close()
                  modalInstance.remove()
                }
              }
              modalInstance.show({
                onRemove: () => {
                  modalInstance = null
                  image = null
                  // console.log(modalInstance)
                },
                title: '查看大图 - ' + text,
                okText: '确定',
                width: warpWidth + 40
              })
            }
          },
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
      // render.image = (href, title, text) => {
      //   // ![text](href "title")
      //   return `<div @click="showFullImage('${href}', '${title}', '${text}')" class="thumbnail" style="background-image: url(${href})" alt="${title}"> </div>`
      // }
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