import Vue from 'vue';
import { bus, butler } from '../common';
import PCM from './WfPluginComponentManager';
import PHM from './WfPluginHookManager';
import WfPluginWidgetManager from './WfPluginWidgetManager';
import WfPluginTranslationManager from './WfPluginTranslationManager';
import _pluginProps from './plugin-props';
import { getPluginIdFromUniqueComponentName } from './helpers';

export * from './helpers';
export * from './constants';

export { PCM, PHM };
export const PWM = new WfPluginWidgetManager();
export const PTM = new WfPluginTranslationManager();
export const PTM4Meta = new WfPluginTranslationManager();


const t = (componentName) => (
  PTM.t(butler.config.locale)(
    componentName
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .reduce((acc, cur) => acc + cur, ''),
  )
)

export const pluginProps = (componentName) => Object.assign(_pluginProps(componentName), { t: t(getPluginIdFromUniqueComponentName(componentName)) })

export const injectPlugin = (pluginId) => {
  const plugin = window[pluginId];

  if (!plugin) {
    Vue.$Message.error('Plugin.error.no_plugin');
    return;
  }

  // TODO: test this part
  const { components, hooks, widgets, translation } = (plugin.default || plugin);

  Vue.set(bus.pluginsData, pluginId, {});
  PCM.add({ pluginId, components });
  PHM.add({ pluginId, hooks });
  PWM.add(widgets);
  PTM.add({ pluginId, translation });
}

export const ejectPlugin = (pluginId) => {
  const plugin = window[pluginId];

  if (!plugin) {
    Vue.$Message.error('Plugin.error.no_plugin');
    return;
  }

  const { components, hooks, widgets } = (plugin.default || plugin);

  PCM.remove(components);
  PHM.remove({ pluginId, hooks });
  PWM.remove(widgets);
  PTM.remove(pluginId);
  Vue.delete(bus.pluginsData, pluginId)
}

export const handlePluginHookError = (error) => {
  // not sure what to put here :)
};
