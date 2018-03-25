import { bus, butler } from '../common';
import { getPluginIdFromUniqueComponentName } from './helpers'

export default (componentName) => ({
  pluginData: bus.pluginsData[getPluginIdFromUniqueComponentName(componentName)],
  commonData: bus.commonData,
  broadcast: bus.$emit,
  listenTo: bus.listenTo,
  enough: bus.enough,
  db: butler.db,
  auth: butler.auth,
  config: butler.config,
});