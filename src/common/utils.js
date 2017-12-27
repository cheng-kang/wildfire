/*
  The "Unicode Problem" of Base64 encoding and decoding
  URL: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
 */
export const b64EncodeUnicode = (str) => btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1)))

export const b64DecodeUnicode = (str) => decodeURIComponent(atob(str).split('').map(c => ('%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))).join(''))
