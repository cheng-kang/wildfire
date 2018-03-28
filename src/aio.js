import butler from './common/butler';
import init from './init';

export const install = (Vue, config) => {
  butler.initApp(Vue, config);
  init(Vue);
};

export const reset = (Vue, config, err) => {
  butler.resetApp(Vue, config, err)
};

export default { install, reset };
