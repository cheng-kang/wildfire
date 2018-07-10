(() => {
  /*
  The "Unicode Problem" of Base64 encoding and decoding
  URL: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
 */
  const b64EncodeUnicode = (str) => btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(`0x${p1}`)));
  // -- End --

  const {
    databaseProvider,
    databaseConfig,
  } = window.wildfireConfig();

  if (databaseProvider !== 'firebase' && databaseProvider !== 'wilddog') {
    console.error('Invalid `databaseProvider`.');
    return;
  }

  if (!databaseConfig) {
    console.error('Missing wildfire config: `databaseConfig`.');
    return;
  }

  let baseURL;
  if (databaseProvider === 'firebase') {
    baseURL = databaseConfig.databaseURL;
  } else {
    baseURL = `https://${databaseConfig.siteId}.wilddogio.com`;
  }

  const discussionCountEles = document.getElementsByClassName('wf-discussion-count-unit');

  for (let i = 0; i < discussionCountEles.length; i += 1) {
    const ele = discussionCountEles[i]
    const pageURL = ele.getAttribute('wf-page-url');
    if (!pageURL) {
      console.error('Missing attribute: `wf-page-url`.');
      return;
    }

    const url = `${baseURL}/pageComments/${b64EncodeUnicode(pageURL)}.json`;
    fetch(url).then((response) => {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      throw new TypeError("Oops, we haven't got JSON!");
    }).then((json = {}) => {
      const discussionCount = Object.keys(json).length;
      ele.innerHTML = discussionCount;
    }).catch((error) => { console.error(error); });
  }
})();
