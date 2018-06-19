/**
 * by minh8023 2016/12/26
 * 路由部分
 * webpack 分包
 */
import React, { PropTypes } from 'react';

import {connect} from 'react-redux';
// import { Router, browserHistory } from 'react-router'
import { Router, Route, IndexRoute, browserHistory ,applyRouterMiddleware} from 'react-router'
import { useScroll } from 'react-router-scroll';
import {getuserData} from 'actions/User'

/**
 * 需要登录
 */
const _requireLogin = (nextState, replace, cb) => {
  // console.log(store)
  // const query = nextState
  // console.log(query)
  // if (localStorage.token) {
  //     if (cb) cb(true)
  //     this.onChange(true)
  //     return
  //   }
  // console.log('已登录')
  // localStorage.token && cb && cb()

  console.log(nextState)
  cb()
}

const rootRoute =  {
    path: '/',
    component: require('containers/App/index'),
    indexRoute: {
      component: require('containers/Home/index')
    },
    childRoutes: [{
      /* 需要登录 */
      onEnter: _requireLogin,
      childRoutes: [
        {
          path: 'dashboard', // 个人中心
          getComponent: function getComponent(nextState, cb) {
            require.ensure([], function (require) {
              return cb(null, require('containers/Dashboard/Dashboard'));
            }, 'dashboard');
          }
        },
        {
          path: 'dashboard/listing/:id', // 发布行程
          getComponent: function getComponent(nextState, cb) {
            require.ensure([], function (require) {
              return cb(null, require('containers/Dashboard/Trip'));
            }, 'listing');
          }
        }, {
          path: 'dashboard/listing', // 发布行程的list页面
          getComponent: function getComponent(nextState, cb) {
            require.ensure([], function (require) {
              return cb(null, require('containers/Dashboard/ListTrip'));
            }, 'listings');
          }
        }
      ]
    },
    {
      path: 'trip/:slug', // 目的旅行详情页面
      getComponent: function getComponent(nextState, cb) {
        require.ensure([], function (require) {
          return cb(null, require('containers/TripDetail'));
        }, 'trip');
      }
    },
    {
      path: '*', // 404页面
      getComponent: function getComponent(nextState, cb) {
        require.ensure([], function (require) {
          return cb(null, require('containers/NotFound/index'));
        }, 'not-found');
      }
    }]
}
const Routes = ({ history }) =>
  <Router
    history={history}
    routes={rootRoute}
    render={applyRouterMiddleware(useScroll())}
    />

export default Routes
// export default Routes;
