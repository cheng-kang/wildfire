import Vue from 'vue';
import values from 'lodash/values';
import forIn from 'lodash/forIn';
import union from 'lodash/union';
import { concatenated } from './helpers';
import { PLACES } from './constants';

const WfPluginComponentManager = new Vue({
  data() {
    const places = values(PLACES);

    const order = {};
    Object.keys(PLACES).forEach((place) => {
      order[PLACES[place]] = [];
    });

    return {
      components: {},
      order,
      places,
    }
  },
  computed: {
    orderedComponents() {
      const ordered = {};
      Object.keys(this.components).forEach((place) => {
        ordered[place] = union(
          this.order[place].filter((item) => this.components[place].indexOf(item) !== -1),
          this.components[place]
        );
      });
      return ordered;
    },
  },
  created() {
    this.reset();
  },
  methods: {
    /**
     * `add` takes one parameter which is a plugin object
     */
    add({ pluginId, components }) {
      forIn(components, (componentList, place) => {
        if (this.places.indexOf(place) === -1) return;
  
        componentList.forEach(component => {
          const { name } = component;
          const uniqueName = concatenated({ pluginId, name })
          Vue.component(uniqueName, component);
          this.components[place].push(uniqueName);
        });
      });
    },
  
    /**
     * `remove` takes one parameter which is a plugin object
     */
    remove({ pluginId, components }) {
      forIn(components, (componentList, place) => {
        if (this.places.indexOf(place) === -1) return;
  
        componentList.forEach(({ name }) => {
          // TODO: unregister Vue component
          const uniqueName = concatenated({ pluginId, name })
          const idx = this.components[place].indexOf(uniqueName);
          if (idx !== -1) this.components[place].splice(idx, 1);
        });
      });
    },
  
    get(place) {
      return this.orderedComponents[place];
    },
  
    isEmpty(place) {
      return this.orderedComponents[place].length === 0;
    },

    reset() {
      const components = {};
      this.places.forEach(place => { components[place] = []; });
      this.components = components;
    }
  },
});

export default WfPluginComponentManager;
