/**
 * 个人中心
 */
import React from 'react';
import { connect } from 'react-redux'
import { Affix,Icon,notification } from 'antd';
import LeftBar from 'components/LeftBar'
import DashboardHeader from 'components/Header/DashboardHeader'
import { Link,browserHistory} from 'react-router'
import styles from './index.scss'
import {dashboard_item,commaize,commaizeInt,exchangeRates,getCurrencyPrice}  from 'utils/'

// import {maximumNumber,replaceCon,getDisplayPrice,getCurrencyPrice,getFormat,commaize,commaizeInt,exchangeRates} from 'utils/'
import {_getBalance} from 'api/'
import { FormattedMessage,injectIntl,intlShape } from 'react-intl';

const exchange = 1/exchangeRates['CNY']
class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      totalBalance: 0
    }
  }
  componentDidMount (){
    const {dispatch,userData,intl} = this.props

    const description = intl.formatMessage({id:"Common.Info.tip1", defaultMessage: "Please submit your information firstly, so that you can communicate better. And also, our coupon only goes to the users who has completed their profile. "})
    const message = intl.formatMessage({id:"Common.Info", defaultMessage: "Info"})
    const bnt = intl.formatMessage({id:"Dashboard.Common.Edit profile", defaultMessage: "Edit profile"})
    if (!userData.avatarUrl) {
      const key = `open${Date.now()}`
      notification.info({
          message: message,
          description: description,
          duration:10,
          key,
          btn: (<a onClick={()=>{
            notification.close(key);
            browserHistory.push('/dashboard/profile/')
          }}>{bnt}</a>)
      })
      // browserHistory.push('/dashboard/profile/')
    }
    _getBalance(userData.userId).then((res)=>{
      //console.log(res)
      if (res) {
        this.setState({
          totalBalance:res.totalBalance || 0
        })
      }
    })
  }
  render() {
    const {userStatView,currency,intl} =this.props
    const {totalBalance} = this.state
    let dashboard_data = dashboard_item.slice(1,10)
    dashboard_data[0].num = userStatView.unreadNotification // 未读消息
    dashboard_data[1].num = commaize(getCurrencyPrice(totalBalance*exchange,currency)) // 用户余额
    dashboard_data[1].currency = currency
    dashboard_data[2].num = userStatView.numberOfOrders // 订单
    dashboard_data[3].num = userStatView.validNum // 验证
    dashboard_data[4].num = userStatView.numberOfPublishedJourney // 发布行程

    return (
      <div>
      <DashboardHeader />
      <div className="max_width flex dashboard_wrap">
        <LeftBar type={'dashboard'}></LeftBar>
        <div className="dashboard_right">
          <h1 className="list_title"><FormattedMessage id="Dashboard.Item.Dashboard" defaultMessage="Dashboard" /></h1>
          <div className="dashboard_main">
            <ul>
              {
                dashboard_data.map((item,index) => {
                  return (
                    <li className="dashboard_item" key={index}>
                      <Link to={item.uri}>
                        <div className="dashboard_item_box">
                          <div className="item_box_l">
                            <Icon type={item.icon} />
                            <div className="title">
                              <FormattedMessage id={'Dashboard.Item.'+item.title} defaultMessage={item.title} />
                            </div>
                          </div>
                          <div className="item_box_r">
                            <div className="num">{item.num}</div>
                            <div className="subtitle">{item.subtitle}  {item.currency && (<span>(<FormattedMessage id={'Common.Currencie.'+item.currency} defaultMessage={item.currency} />)</span>)}</div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  )
                })
              }
            </ul>
          </div>
        </div>
      </div>
      </div>
    )
  }
}

function select(store){
  return {
    userStatView: store.User.userStatView,
    currency: store.Common.currency,
    isLogin: store.User.isLogin,
    userData: store.User.userData
  }
}
Dashboard.propTypes = {
  intl: intlShape.isRequired
}
Dashboard = injectIntl(Dashboard)
Dashboard = connect(select)(Dashboard)
module.exports = Dashboard;
