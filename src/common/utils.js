import markdown from './markdown'

/*
  The "Unicode Problem" of Base64 encoding and decoding
  URL: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
 */
export const b64EncodeUnicode = (str) => btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1)))

export const b64DecodeUnicode = (str) => decodeURIComponent(atob(str).split('').map(c => ('%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))).join(''))

// Strip HTML to text content for better displaying
export const stripHTML = (html) => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return (tmp.textContent || tmp.innerText).trim()
}

// Get text content from Markdown content
export const textContent = (content) => stripHTML(markdown(content))

export const handleImageOnError = (imageEle, defaultImageURL, imageTitle) => {
  const originalImageURL = imageEle.src
  imageEle.title = imageTitle
  imageEle.setAttribute('data-original-url', originalImageURL)
  imageEle.src = defaultImageURL
}

export const defaultPageURL = (pageURLMode = 'normal') => {
  if (pageURLMode === 'full') return window.location.href
  const { origin, pathname, hash } = window.location
  if (pageURLMode === 'normal') return origin + pathname
  // if (pageURLMode === 'hash')
  const hashNoQM = hash.split('?')[0] // Hash without question mark (the search part of URL)
  return origin + pathname + hashNoQM
}
