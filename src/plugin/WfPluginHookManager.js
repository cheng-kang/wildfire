import Vue from 'vue';
import forIn from 'lodash/forIn';
import values from 'lodash/values';
import flattenDeep from 'lodash/flattendeep';
import { EVENTS } from './constants';
import bus from '../common/bus';

const WfPluginHookManager = new Vue({
  data() {
    const events = values(EVENTS);
    return {
      befores: {},
      afters: {},
      events,
    };
  },
  created() {
    this.reset();
  },
  methods: {
    // TODO: handle [before, after], and unique name
    // TODO: avoid duplicate events
    add({ pluginId, hooks }) {
      forIn(hooks, (hook, event) => {
        if (this.events.indexOf(event) === -1) return;

        // TODO: add parameter type check, e.g. before: Array
        const { before = [], after = [] } = hook;
        Vue.set(this.befores[event], pluginId, before);
        Vue.set(this.afters[event], pluginId, after);
      });
    },

    // TODO: test remove
    remove({ pluginId, hooks }) {
      forIn(hooks, (hook, event) => {
        if (this.events.indexOf(event) === -1) return;

        Vue.delete(this.befores[event], pluginId);
        Vue.delete(this.afters[event], pluginId);
      });
    },

    beforeEvent(event, params) {
      return new Promise(
        (resolve, reject) =>
          Promise.all(
            flattenDeep(values(this.befores[event])).map((cb) =>
              cb(Object.assign({}, params, { bus })),
            ),
          )
            .then((results) => results.reduce((a, b) => a && b, true) ? resolve() : reject())
            .catch((error) => reject())
      );
    },

    afterEvent(event, params) {
      return flattenDeep(values(this.afters[event])).forEach((cb) =>
        cb(Object.assign({}, params, { bus })),
      );
    },

    reset() {
      const befores = {};
      const afters = {};
      this.events.forEach((event) => {
        befores[event] = {};
        afters[event] = {};
      });
      this.befores = befores;
      this.afters = afters;
    }
  },
});

export default WfPluginHookManager;
