/**
 * by minh8023 2016/12/26
 * 路由部分
 * webpack 分包
 */
import React, { PropTypes } from 'react';

import {connect} from 'react-redux';
import { Router, Route, IndexRoute} from 'react-router'
import moment from 'moment';
import {getLS} from 'actions/common'
import {setLSdata} from 'actions/User'
/**
 * 需要登录
 */
let Routes = function (store) {
const _needLogin = async (nextState, replace, cb) => {
  function checkAuth() {
    const isLoggedIn = store.getState().User.isLogin;
    if (!isLoggedIn) {
      const pathName = nextState.location.pathname;
      // console.log(nextState.location)
      const query = nextState.location.search || '';
      // if (nextState.location.pathname.match(/^\/booking\/new/)) {
      //   cb();
      //   return;
      // }
      replace('/login?redirect=' + pathName + query);
    }
    cb();
  }
  const userData = getLS('userData') && JSON.parse(getLS('userData'))
  const expirationTime = getLS('expirationTime') || 0;
  if (getLS('isLogin') && userData && userData.token && moment().unix()< expirationTime) {
    await store.dispatch(setLSdata(userData))
    checkAuth()
  }else{
    checkAuth()
  }
  //console.log(store.getState().User.isLogin)
}

return  {
    path: '/',
    component: require('containers/App/index'),
    indexRoute: {
      component: require('containers/Index')
    },
    childRoutes: [{
      /* 需要登录 */
      onEnter: _needLogin,
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
        }, {
          path: 'dashboard/profile',
          getComponent: function getComponent(nextState, cb) {
            require.ensure([], function (require) {
              return cb(null, require('containers/Dashboard/Profile'));
            }, 'edit-profile');
          }
        }, {
          path: 'dashboard/booking',
          getComponent: function getComponent(nextState, cb) {
            require.ensure([], function (require) {
              return cb(null, require('containers/Dashboard/Booking'));
            }, 'booking-list');
          }
        }, {
          path: 'dashboard/wallet(/:slug)',
          getComponent: function getComponent(nextState, cb) {
            require.ensure([], function (require) {
              return cb(null, require('containers/Dashboard/Wallet'));
            }, 'wallet');
          }
        }, {
          path: 'dashboard/calendar',
          getComponent: function getComponent(nextState, cb) {
            require.ensure([], function (require) {
              return cb(null, require('containers/Dashboard/Calendar'));
            }, 'calendar');
          }
        }, {
          path: 'dashboard/verifications',
          getComponent: function getComponent(nextState, cb) {
            require.ensure([], function (require) {
              return cb(null, require('containers/Dashboard/Verifications'));
            }, 'verifications');
          }
        }, {
          path: 'dashboard/setting',
          getComponent: function getComponent(nextState, cb) {
            require.ensure([], function (require) {
              return cb(null, require('containers/Dashboard/Setting'));
            }, 'setting');
          }
        }, {
          path: 'dashboard/inbox',
          getComponent: function getComponent(nextState, cb) {
            require.ensure([], function (require) {
              return cb(null, require('containers/Dashboard/Inbox'));
            }, 'inboxs');
          }
        }, {
          path: 'dashboard/:type/:id',
          getComponent: function getComponent(nextState, cb) {
            require.ensure([], function (require) {
              return cb(null, require('containers/Dashboard/InboxChat'));
            }, 'inbox');
          }
        }, {
          path: 'booking/:slug', // 预定
          getComponent: function getComponent(nextState, cb) {
            require.ensure([], function (require) {
              return cb(null, require('containers/Booking'));
            }, 'booking');
          }
        }, {
          path: 'reviews', // 评价
          getComponent: function getComponent(nextState, cb) {
            require.ensure([], function (require) {
              return cb(null, require('containers/Reviews'));
            }, 'reviews');
          }
        }, {
          path: 'reviews/:slug', // 评价
          getComponent: function getComponent(nextState, cb) {
            require.ensure([], function (require) {
              return cb(null, require('containers/Reviews/compose'));
            }, 'reviews');
          }
        },
        {
          path: 'local-expert/:slug',
          getComponent: function getComponent(nextState, cb) {
            require.ensure([], function (require) {
              return cb(null, require('containers/LocalExpertProfile'));
            }, 'local-expert');
          }
        }
      ]
    },
    {
      path: 'login', // 登录
      getComponent: function getComponent(nextState, cb) {
        require.ensure([], function (require) {
          return cb(null, require('containers/Index'));
        }, 'login');
      }
    },
    {
      path: 'search/:destination', // 搜索列表
      getComponent: function getComponent(nextState, cb) {
        require.ensure([], function (require) {
          return cb(null, require('containers/Search'));
        }, 'search');
      }
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
      path: 'user-agreement',
      getComponent: function getComponent(nextState, cb) {
        require.ensure([], function (require) {
          return cb(null, require('containers/Agreement'));
        }, 'user-agreement');
      }
    },
    {
      path: 'aboutus',
      getComponent: function getComponent(nextState, cb) {
        require.ensure([], function (require) {
          return cb(null, require('containers/Aboutus'));
        }, 'Aboutus');
      }
    },
    {
      path: 'help',
      getComponent: function getComponent(nextState, cb) {
        require.ensure([], function (require) {
          return cb(null, require('containers/Help'));
        }, 'Help');
      }
    },
    {
      path: 'news/:slug',
      getComponent: function getComponent(nextState, cb) {
        require.ensure([], function (require) {
          return cb(null, require('containers/NewsDetail'));
        }, 'NewsDetail');
      }
    },
    {
      path: 'logout',
      getComponent: function getComponent(nextState, cb) {
        require.ensure([], function (require) {
          return cb(null, require('containers/Index/logout'));
        }, 'Logout');
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
}
module.exports = Routes;
// export default Routes;
