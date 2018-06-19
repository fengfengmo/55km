/**
 * by minh8023 2016/12/26
 */
 import React from 'react';
 import ReactDOM from 'react-dom'
 import { Provider } from 'react-redux';
 import { Router, browserHistory ,hashHistory,applyRouterMiddleware} from 'react-router'
 import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
 import { syncHistoryWithStore, routerReducer as routing ,routerMiddleware} from 'react-router-redux';
 import thunkMiddleware from 'redux-thunk';
 import { connect } from 'react-redux'
 import { useScroll } from 'react-router-scroll';
 import reducers from './reducers/index';
 import { LocaleProvider } from 'antd';

 import { addLocaleData, IntlProvider } from 'react-intl';

 import en from 'react-intl/locale-data/en';
 import zh from 'react-intl/locale-data/zh';


 //import {getLocale} from 'locales/index';
 //////////////////////
 // Store
 const debugware = [];
 if (process.env.NODE_ENV !== 'production') {
   const createLogger = require('redux-logger');
   debugware.push(createLogger({
     collapsed: true
   }));
 }
 const initialState = {};
 const enhancer = compose(
   applyMiddleware(thunkMiddleware, routerMiddleware(history), ...debugware),
     window.devToolsExtension ? window.devToolsExtension() : f => f
 );
 const store = createStore(combineReducers({
   ...reducers, routing,
 }), initialState, enhancer);

 if (module.hot) {
   module.hot.accept('./reducers', () => {
     const reducers = require('./reducers');
     const combinedReducers = combineReducers({ ...reducers, routing });
     store.replaceReducer(combinedReducers);
   });
 }

 //////////////////////
 // Render

 const history = syncHistoryWithStore(browserHistory, store);
 function shouldUpdateScroll(prevRouterState, routerState) {
  //  console.log('prevRouterState',prevRouterState && prevRouterState.location && prevRouterState.location.pathname)
  //  console.log('routerState',routerState.location && routerState.location.pathname)
    /**
     * 暂时屏蔽
     */
    // if (prevRouterState && prevRouterState.location.pathname.match(/^\/search/) &&  routerState && routerState.location.pathname.match(/^\/search/)) {
    //   // return false
    //   if (window.document.body.offsetWidth<768) {
    //     return [0, 200];
    //   }
    //   return [0, 400];
    // }

    return true;
  }
  /**
   * 统计相关 微信分享相关
   * @type {[type]}
   */
  history.listen(location => {
    //console.log(location.pathname)
    if (window._hmt) {
      window._hmt.push(['_setAutoPageview', false])
      window._hmt.push(['_trackPageview', location.pathname])
    }
    //console.log(window._hmt)
  });


 let render = () => {
   const Routes = require('./routes/index')(store);
   const appLocale = store.getState().Common.appLocale;
   const I18nProvider = connect(state => {
      return {
        locale: state.Common.appLocale.locale,
        messages: state.Common.appLocale.messages
      };
    })(IntlProvider)
  const I18nLocaleProvider = connect(state => {
     return {
       locale: state.Common.appLocale.antd
     };
   })(LocaleProvider)
   addLocaleData([...en, ...zh]);
   ReactDOM.render(
     <Provider store={store}>
       <I18nLocaleProvider >
           <I18nProvider >
             <Router
               history={history}
               routes={Routes}
               render={applyRouterMiddleware(useScroll(shouldUpdateScroll))}
             />
           </I18nProvider>
      </I18nLocaleProvider>
    </Provider>
   , document.getElementById('app'));
 };

 if (module.hot) {
   const renderNormally = render;
   const renderException = (error) => {
     const RedBox = require('redbox-react').default;
     ReactDOM.render(<RedBox error={error} />, document.getElementById('app'));
   };
   render = () => {
     try {
       renderNormally();
     } catch (error) {
       console.error('error', error);
       renderException(error);
     }
   };
   module.hot.accept('./routes/index', () => {
     render();
   });
 }

 render();
