import forIn from 'lodash/forIn';
import values from 'lodash/values';
import flattenDeep from 'lodash/flattendeep'
import { EVENTS } from './constants';
import bus from '../common/bus';

class WfPluginHookManager {
  constructor() {
    this.befores = {};
    this.afters = {};
    this.events = values(EVENTS);
    this.events.forEach((event) => {
      this.befores[event] = {};
      this.afters[event] = {};
    });
  }

  // TODO: handle [before, after], and unique name
  // TODO: avoid duplicate events
  add({ pluginId, hooks }) {
    forIn(hooks, (hook, event) => {
      if (this.events.indexOf(event) === -1) return;

      // TODO: add parameter type check, e.g. before: Array
      const { before = [], after = [] } = hook
      Vue.set(this.befores[event], pluginId, before)
      Vue.set(this.afters[event], pluginId, after)
    });
  }

  // TODO: test remove
  remove({ pluginId, hooks }) {
    forIn(hooks, (hook, event) => {
      if (this.events.indexOf(event) === -1) return;

      Vue.delete(this.befores[event], pluginId) 
      Vue.delete(this.afters[event], pluginId) 
    });
  }

  beforeEvent(event, params) {
    return new Promise((resolve, reject) => (
      flattenDeep(values(this.befores[event]))
        .map((cb) => cb(Object.assign({}, params, { bus })))
        .reduce((a, b) => a && b, true)
        ? resolve()
        : reject()
    ));
  }

  afterEvent(event, params) {
    return flattenDeep(values(this.afters[event])).forEach((cb) => cb(Object.assign({}, params, { bus })));
  }
}

export default WfPluginHookManager;
