import { distanceInWordsToNow, format } from 'date-fns'
import zhCNLocale from 'date-fns/locale/zh_cn'
import enLocale from 'date-fns/locale/en'

export default (locale) => {
  const fallbackLcl = 'en'

  const localeObjects = {
    'zh-CN': zhCNLocale,
    'en': enLocale
  }

  const localeObject = localeObjects[locale] || localeObjects[fallbackLcl]

  return {
    formatDate: (date) => format(date, 'YYYY-MM-DD HH:mm:ss', { locale: localeObject, addSuffix: true }),
    distanceInWordsToNow: (date) => distanceInWordsToNow(date, { locale: localeObject, addSuffix: true })
  }
}
