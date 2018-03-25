import butler from './common/butler';
import init from './init';

export const install = (Vue, config) => {
  butler.initApp(Vue, config);
  init(Vue);
};

export const reset = butler.resetApp;

export default { install, reset };
