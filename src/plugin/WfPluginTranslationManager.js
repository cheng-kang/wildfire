class WfPluginTranslationManager {
  constructor() {
    this.translations = {};
  }

  add({ pluginId, translation }) {
    Object.assign(this.translations, { [pluginId]: translation });
  }

  remove(pluginId) {
    if (this.translations[pluginId]) {
      delete this.translations[pluginId];
    }
  }

  t(locale) {
    return (pluginId) => (key) => {
      let translation;
      if (!this.translations[pluginId]) {
        return key;
      }
      if (!this.translations[pluginId][locale]) {
        const { fallback } = this.translations[pluginId];
        if (fallback) {
          translation = this.translations[pluginId][fallback];
        } else {
          const availableLocales = Object.keys(this.translations[pluginId]);
          if (availableLocales.length === 0) {
            return key;
          }
          translation = this.translations[pluginId][availableLocales[0]];
        }
      } else {
        translation = this.translations[pluginId][locale];
      }
      return translation[key] || key;
    };
  }

  reset() {
    this.translations = {};
  }
}

export const PTM = new WfPluginTranslationManager();
export const PTM4Meta = new WfPluginTranslationManager();

export default WfPluginTranslationManager;
