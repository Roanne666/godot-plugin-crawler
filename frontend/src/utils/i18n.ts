import { ref, computed } from "vue";

const DEFAULT_LOCALE = 'en';

export const SUPPORTED_LOCALES = ['en', 'zh-cn'];

const LOCALE_MAP: { [key: string]: string } = {
  'zh': 'zh-cn',
  'zh-cn': 'zh-cn',
  'zh-hans': 'zh-cn',
  'en': 'en',
  'en-us': 'en',
  'en-gb': 'en'
};

const currentLocale = ref(DEFAULT_LOCALE);

const messages: { [key: string]: { [key: string]: string } } = {
  'en': {
    'refresh_plugin': 'Refresh Plugin',
    'search_placeholder': 'Search for...',
    'sort_by': 'Sort by:',
    'last_updated': 'Last Updated',
    'stars': 'Stars',
    'last_commit': 'Last Commit',
    'godot_version': 'Godot Version:',
    'category': 'Category:',
    'license': 'License:',
    'support_level': 'Support Level:',
    'show_only_favorites': 'Show only favorites',
    'first_page': 'First Page',
    'previous_page': 'Previous',
    'next_page': 'Next',
    'last_page': 'Last Page',
    'page_info': 'Page {current} of {total} (Total {items} items)',
    'testing': 'Testing',
    'community': 'Community',
    'featured': 'Featured',
    'any': 'Any',
    'no_plugins_match': 'No plugins match the current filters.',
    'page_title': 'Godot Asset Manager'
  },
  'zh-cn': {
    'refresh_plugin': '重新爬取插件',
    'search_placeholder': '搜索...',
    'sort_by': '排序方式：',
    'last_updated': '最后更新',
    'stars': '星标',
    'last_commit': '最后提交',
    'godot_version': 'Godot 版本：',
    'category': '分类：',
    'license': '许可证：',
    'support_level': '支持级别：',
    'show_only_favorites': '只显示收藏',
    'first_page': '首页',
    'previous_page': '上一页',
    'next_page': '下一页',
    'last_page': '末页',
    'page_info': '第 {current} 页，共 {total} 页 (总计 {items} 项)',
    'testing': '测试中',
    'community': '社区',
    'featured': '精选',
    'any': '任意',
    'no_plugins_match': '没有插件符合当前筛选条件。',
    'page_title': 'Godot 资源管理器'
  }
};

const initLocale = (): void => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  const langCode = browserLang.toLowerCase();
  
  let locale = LOCALE_MAP[langCode] || DEFAULT_LOCALE;
  
  if (langCode.startsWith('zh')) {
    locale = 'zh-cn';
  }
  
  currentLocale.value = locale;
};

initLocale();

export const t = (key: string, params?: { [key: string]: string | number }): string => {
  const localeMessages = messages[currentLocale.value] || messages[DEFAULT_LOCALE] || {};
  let message = localeMessages[key] || messages[DEFAULT_LOCALE]?.[key] || key;

  if (params) {
    Object.keys(params).forEach(param => {
      message = message.replace(`{${param}}`, String(params[param]));
    });
  }

  return message;
};

export const getCurrentLocale = (): string => currentLocale.value;

export const setLocale = (locale: string): void => {
  if (SUPPORTED_LOCALES.includes(locale) && messages[locale]) {
    currentLocale.value = locale;
    document.title = t('page_title');
  }
};

export const getLanguageName = (locale: string): string => {
  const names: { [key: string]: string } = {
    'en': 'English',
    'zh-cn': '简体中文'
  };
  return names[locale] || locale;
};

export function useI18n() {
  return {
    t,
    currentLocale: computed(() => currentLocale.value),
    setLocale,
    getLanguageName
  };
}