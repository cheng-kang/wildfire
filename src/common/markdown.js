import marked from 'marked'
import sanitizeHtml from 'sanitize-html'
import hljs from '../common/loadHighlightjs'

const validateEmail = (str) => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test((str || '').toLowerCase())

export default (content) => {
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
  const html = marked(content)
  const sanitizedHTML = sanitizeHtml(html, {
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
        if (validateEmail(title)) { attrs['@click'] = `showUserInfo('${title}')` }
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
  return sanitizedHTML
}
