/**
 * 测试用
 */


import enAppLocaleData from 'react-intl/locale-data/en';
import zhAppLocaleData from 'react-intl/locale-data/zh';
import antdEn from 'antd/lib/locale-provider/en_US';
// import enMessages from 'locales/en.json';

import en_US from './en.json';
import zh_Hans_CN from './zh.json';
//import en-US from './en-US';

window.enAppLocale = {
  messages: {
    ...en_US,
  },
  antd: null,
  locale: 'en',
  data: enAppLocaleData,
};
window.zhAppLocale = {
  messages: {
    ...zh_Hans_CN,
  },
  antd: null,
  locale: 'zh-Hans-CN',
  data: zhAppLocaleData,
};
window.appLocale = window.enAppLocale


export function getLocale(store){
  if (store.getState().Common.locale==='en') {
    return {
      ...window.enAppLocale
    }
  }
	return {
    ...window.zhAppLocale
  }
}
