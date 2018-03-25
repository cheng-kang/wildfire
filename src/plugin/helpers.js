export const CONNECTOR = '=-wf-=';

export const uniquePluginComponentName = ({ pluginId, name }) => `${pluginId}${CONNECTOR}${name}`;

export const getPluginIdFromUniqueComponentName = ({ uniqueName }) => uniqueName.split(CONNECTOR)[0];
