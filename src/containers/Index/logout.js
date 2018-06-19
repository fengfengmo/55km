import React from 'react';
import { browserHistory} from 'react-router'
import { connect } from 'react-redux'
import {notification} from 'antd'
import {trackEvent} from 'actions/common'
import styles from './index.scss'
import {signOut} from 'actions/User'
class Logout extends React.Component {
  constructor(props) {
    super(props);
  }
  async _signOut () {
    const {dispatch} =this.props
    notification.warn({
      message: '提示信息',
      description: '您的登录信息已超时，请重新登录。',
    })
    trackEvent('用户行为','loginOut','success')
    await dispatch(signOut())
    browserHistory.push('/')
  }
  componentWillMount () {
    setTimeout(()=>{
      this._signOut()
    },1000)
  }
  render() {
    return (
      <div className="logout_wrap">

      </div>
    )
  }
}
Logout = connect()(Logout)
module.exports = Logout
