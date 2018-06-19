/**
 * Inbox 信息页
 */
import React from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Button,Icon,Spin,Tabs } from 'antd';
import styles from './index.scss'
import Inboxstyles from './Inbox.scss'

import DashboardHeader from 'components/Header/DashboardHeader'
import InboxCard from 'components/InboxCard'
import { FormattedMessage,injectIntl,intlShape } from 'react-intl'
import {_getNotificationOutbox,_getNotificationInbox} from 'api/'
const TabPane = Tabs.TabPane;
//  import data0 from './InboxData'
// import data1 from './InboxData1'
class Inbox extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      isLoading :false,
      OutboxData: [], //发件箱
      InboxData: [], // 收件箱
    }
  }
  componentWillMount (){
    const {dispatch,userData} = this.props

    // console.log(data1)
    // const fj =  Array.from(data0,(item,index)=>{
    //     return {
    //       ...item,
    //       ...this.getJson(item),
    //
    //     }
    //   })
    //   const sj =  Array.from(data1,(item,index)=>{
    //       return {
    //         ...item,
    //         ...this.getJson(item),
    //
    //       }
    //     })
      /**
       * 发件箱咨询
       * @type {Set}
       */
    //   var tripData=new Set();
    //   fj.map((item,index)=>{
    //   	tripData.add(item.tripid)
    //   })
    //   var tripDatatemp=[];
    //   for(var i of tripData){
    //   	tripDatatemp.push(i)
    //   }
    //
    //   var tripData2=new Set();
    //   sj.map((item,index)=>{
    //   	tripData2.add(item.tripid)
    //   })
    //   var tripDatatemp2=[];
    //   for(var i of tripData2){
    //   	tripDatatemp2.push(i)
    //   }
    //
    // console.log(tripDatatemp)
    // console.log(sj)
    // this.getNotificationOutbox()
    this.getNotificationInbox()
  }
  /**
   * json 处理
   */
  getJson (data){
    if (!data.title) {
      return {}
    }
    const json = data.title && data.title.split('|json|')
    if (!json[1]) {
      return {}
    }
    return JSON.parse(json[1])
  }
  /**
   * 获取发件箱
   */
  getNotificationOutbox () {
    const {userData} = this.props
    _getNotificationOutbox(userData.userId).then((res)=>{
      // console.log(res)
      this.setState({
        OutboxData: res.data
      })
    })
  }
  /**
   * 获取收件箱
   */
  getNotificationInbox () {
    const {userData} = this.props
    _getNotificationInbox(userData.userId).then((res)=>{
      // console.log(res)
      this.setState({
        InboxData: res.data
      })
    })
  }
  render() {
    const {authorIdGroupTour,intl} = this.props
    const {OutboxData,InboxData} =this.state
    const Traveling = intl.formatMessage({id:"Inbox.Tabs.Traveling Messages", defaultMessage: "Traveling Messages"})
    const Inbox = intl.formatMessage({id:"Inbox.Tabs.Inbox Messages", defaultMessage: "Inbox Messages"})
    const Outbox = intl.formatMessage({id:"Inbox.Tabs.Outbox Messages", defaultMessage: "Outbox Messages"})
    const Hosting = intl.formatMessage({id:"Inbox.Tabs.Hosting Messages", defaultMessage: "Hosting Messages"})
    const Notifications = intl.formatMessage({id:"Inbox.Tabs.Notifications", defaultMessage: "Notifications"})
    const TravelingH3 = intl.formatMessage({id:"Inbox.Item.TravelingH3", defaultMessage: "Choose Your Next <span> Adventure</span>"})
    const HostingH3 = intl.formatMessage({id:"Inbox.Item.HostingH3", defaultMessage: "Become Local Expert Earn<span> Extra Money</span>"})
    return (
      <div>
        <DashboardHeader />
        <div className="max_width960 inbox_wrap">
          <div className="main_wrap">
            <h1 className="list_title"><FormattedMessage id="Dashboard.Item.Inbox" defaultMessage="Inbox" /></h1>
            <div>
              <Tabs defaultActiveKey="1" onChange={(index)=>{
                if (parseInt(index)===2) {
                  this.getNotificationOutbox()
                }
                if (parseInt(index)===1) {
                  this.getNotificationInbox()
                }
              }}>
              <TabPane tab={Inbox} key="1">
              {
                InboxData.length===0 && (
                  <div className="messages_empty">
                    <p><FormattedMessage id={'Inbox.Item.TravelingP'} defaultMessage={'You have no reservations.When guests contact you or send you reservation requests, you’ll see their messages here.'} /></p>
                    <h3 dangerouslySetInnerHTML={{__html: HostingH3}}></h3>
                    <Button type="primary" size={'large'} style={{width:140}}>
                      <Link to={'/dashboard/listing'}>
                        <FormattedMessage id={'Inbox.Item.Add New Listings'} defaultMessage={'Add New Listings'}/>
                      </Link>
                    </Button>
                  </div>
                ) || (
                  <div className="inbox_card_wrap">
                  {
                    InboxData && InboxData.map((item,index)=>{
                      return(<InboxCard data={item} type={'inbox'} key={index}/>)
                    })
                  }
                  </div>
                )
              }
              </TabPane>
                <TabPane tab={Outbox} key="2">
                {
                  OutboxData.length===0 && (
                    <div className="messages_empty">
                      <p><FormattedMessage id={'Inbox.Item.TravelingP'} defaultMessage={'You are currently have no message yet.When you make plans to travel,read messages from your host here.'} /></p>
                      <h3 dangerouslySetInnerHTML={{__html: TravelingH3}}></h3>
                      <Button type="primary" size={'large'} style={{width:140}}>
                        <Link to={'/search/Any'}>
                          <FormattedMessage id={'Inbox.Item.Explore'} defaultMessage={'Explore'}/>
                        </Link>
                      </Button>
                    </div>
                  ) || (
                    <div className="inbox_card_wrap">
                    {
                      OutboxData && OutboxData.map((item,index)=>{
                        return(<InboxCard data={item} type={'outbox'}/>)
                      })
                    }
                    </div>
                  )
                }
                </TabPane>

                <TabPane tab={Notifications} key="3">
                  <div className="notifications_wrap">
                    <div className="messages_empty">
                      <p><FormattedMessage id={'Inbox.Item.NotificationsP'} defaultMessage={'No message.'} /></p>
                    </div>
                    <ul>
                    {
                    /*  [1,2].map(()=>{
                        return (
                          <li className="notifications_item">
                            <Link>Notifications 4</Link>
                          </li>
                        )
                      })
                    */}
                  </ul>
                  </div>
                </TabPane>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function select(store){
  return {
    userData: store.User.userData,
    authorIdGroupTour: store.Trip.authorIdGroupTour,
  }
}
Inbox.propTypes = {
  intl: intlShape.isRequired
}
Inbox = injectIntl(Inbox)
Inbox = connect(select)(Inbox)
module.exports = Inbox;
