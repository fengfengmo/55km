
import TYPES from 'actions/types'

import {saveLS,getLS} from 'actions/common'
import {_setApiOpts} from 'api'
import enAppLocaleData from 'react-intl/locale-data/en';
import zhAppLocaleData from 'react-intl/locale-data/zh';
import antdEn from 'antd/lib/locale-provider/en_US';
import {navigatorLanguage} from 'utils'
/**
 * 语言包先本地
 */
import en_US from 'locales/en.json'
import zh_Hans_CN from 'locales/zh.json'

const enAppLocale = {
  messages: {
    ...en_US,
  },
  antd: antdEn,
  locale: 'en',
  data: enAppLocaleData,
}
const zhAppLocale = {
  messages: {
		...zh_Hans_CN,
	},
  antd: null,
  locale: 'zh',
  data: zhAppLocaleData,
}
/**
 * 公共的
 * @type {Object}
 */
const initialState = {
	currency: getLS('currency') || 'CNY', // 默认人民币
  currencyTrip: getLS('currencyTrip') || 'THB', // 默认THB
	locale: getLS('locale') || navigatorLanguage(), // 默认中文
	appLocale: (getLS('locale') && getLS('locale') ==='en' && enAppLocale) || (navigatorLanguage()!=='zh' && enAppLocale) || zhAppLocale,
};

function Common (state=initialState, action){
    switch (action.type) {
			case TYPES.SET_CURRENCY:
        saveLS('currency',action.data)
        return {
  				...state,
          currency: action.data
  			};
      case TYPES.SET_CURRENCYTRIP:
        saveLS('currencyTrip',action.data)
        return {
          ...state,
          currencyTrip: action.data
        };
			case TYPES.SET_LOCALE:
        saveLS('locale',action.data)
        _setApiOpts({
          language:action.data
        })
        return {
  				...state,
          locale: action.data,
					appLocale: action.data ==='en' && enAppLocale || zhAppLocale
  			};
			default:
      	return state
    }
}
module.exports = Common;
