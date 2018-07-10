import { CONNECTOR } from './constants';

export const concatenated = ({ pluginId, name }) => `${pluginId}${CONNECTOR}${name}`;

export const splited = (uniqueName) => {
  const [pluginId, componentName] = uniqueName.split(CONNECTOR);
  return { pluginId, componentName };
}
