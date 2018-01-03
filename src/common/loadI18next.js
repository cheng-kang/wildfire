import i18next from 'i18next'
import {
  langEn,
  langZhCN
} from './translation'

export const initI18next = (locale) => {
  i18next.init({
    lng: locale,
    fallbackLng: 'en',
    debug: true,
    resources: {
      en: {
        translation: langEn
      },
      'zh-CN': {
        translation: langZhCN
      }
    }
  }, (err, t) => {
    if (err) {
      console.error(err)
    } else {
      console.log('i18next Initialized!')
    }
  })
}

export const resetI18next = (locale) => {
  i18next.changeLanguage(locale, (err) => {
    if (err) return console.error(err)
  })
}

export const addTranslation = (lang, translation) => {
  i18next.addResourceBundle(lang, 'translation', translation, true, true)
}

export default i18next
