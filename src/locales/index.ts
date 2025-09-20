import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import zh from './zh.json';
import ru from './ru.json';

export const languages = [
  {
    code: 'zh',
    name: '简体中文',
    file: zh,
  },
  {
    code: 'en',
    name: 'English',
    file: en,
  },
  {
    code: 'ru',
    name: 'Russian',
    file: ru,
  },
] as const;

const fallbackLng = 'en';
function getLang() {
  const localLang = localStorage.getItem('lang');
  if (localLang && languages.some((language) => language.code === localLang)) {
    return localLang;
  }

  const browserLang = window.navigator.language;
  for (const language of languages) {
    if (browserLang.includes(language.code)) {
      return language.code;
    }
  }

  return fallbackLng;
}

i18n.use(initReactI18next).init({
  lng: getLang(),
  fallbackLng,
  interpolation: {
    escapeValue: false,
    prefix: '{',
    suffix: '}',
  },
  resources: Object.fromEntries(languages.map((language) => [language.code, { translation: language.file }])),
});

export const changeLanguage = (code: 'zh' | 'en' | 'ru') => {
  i18n.changeLanguage(code);
  localStorage.setItem('lang', code);
};

export default i18n;
