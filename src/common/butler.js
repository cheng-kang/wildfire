import i18next from '../modules/i18next';
import { b64EncodeUnicode, b64DecodeUnicode } from '../utils';

class WfButler {
  constructor() {
    this.config = {};
    this.i18next = i18next;
    this.dbApp = undefined;
    this.db = undefined;
    this.auth = undefined;
    this.authService = undefined;
    this.formatDate = undefined;
    this.distanceInWordsToNow = undefined;
    this.b64EncodeUnicode = b64EncodeUnicode;
    this.b64DecodeUnicode = b64DecodeUnicode;
  }
}

const butler = new WfButler();

export default butler; 