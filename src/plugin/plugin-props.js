import { bus, butler } from '../common';
import { PTM } from './WfPluginTranslationManager';
import { getPluginIdFromUniqueComponentName } from './helpers'

const pluginProps = (componentName) => {
  const pluginId = getPluginIdFromUniqueComponentName(componentName);
  return {
    t: PTM.t(butler.config.locale)(pluginId),
    pluginData: bus.pluginsData[pluginId],
    commonData: bus.commonData,
    broadcast: bus.$emit,
    listenTo: bus.listenTo,
    enough: bus.enough,
    db: butler.db,
    auth: butler.auth,
    config: butler.config,
  };
};

export default pluginProps;
