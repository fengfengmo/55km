/**
 * Inbox 信息详情
 */
import React from 'react';
import { connect } from 'react-redux'
import { Link,browserHistory } from 'react-router'
import { Button,Icon,Spin,Tabs,Rate,notification } from 'antd'
import moment from 'moment'
import styles from './index.scss'
import Inboxstyles from './Inbox.scss'

import DashboardHeader from 'components/Header/DashboardHeader'
import ChatItem from 'components/ChatItem'
import {_getNotificationOutboxDetail,_getNotificationInboxDetail,_getGrouptour} from 'api/'
import {getDisplayPrice,getCurrencyPrice} from 'utils/'
const TabPane = Tabs.TabPane;
class InboxChat extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      isLoading :false,
      chatDetail: {},
      tripDetail: {}, // 预定旅程的详情
      type: null, // 发件箱 收件箱 outbox inbox
      id: null, // 消息id
    }
  }
  componentWillMount (){
    const {dispatch,userData,location,params } = this.props
    this.setState({
      type: params.type,
      id: parseInt(params.id)
    },()=>{
      this.getNotificationDetail(params.type,params.id)
    })
  }
  /**
   * 根据grouptourId返回旅程详情
   * @param  {[type]} grouptourId [description]
   * @return {[type]}          [description]
   */
  getGrouptour(grouptourId){
    if (!grouptourId) {
      return
    }
    _getGrouptour(grouptourId).then((res)=>{
      this.setState({
        tripDetail: res
      })
    })
  }
  /**
   * 获取发件箱详情
   */
  getJson (){
    const {chatDetail} = this.state
    if (!chatDetail.title) {
      return {}
    }
    const json = chatDetail.title && chatDetail.title.split('|json|')
    if (!json[1]) {
      return {}
    }
    return JSON.parse(json[1])
  }
  getNotificationDetail (type,id) {
    const {userData} = this.props
    if (type==='outbox') {
      _getNotificationOutboxDetail(id).then((res)=>{
        if (res.title==='恭喜你！注册成功！') {
          notification.info({
           message: res.title,
           description: res.content,
         })
         browserHistory.push('/dashboard')
         return
        }
        this.setState({
          chatDetail: res
        },()=>{
          this.getGrouptour(parseInt(this.getJson().tripid))
        })
      })
    }
    if (type==='inbox') {
      _getNotificationInboxDetail(id).then((res)=>{
        if (res.title==='恭喜你！注册成功！') {
          notification.info({
           message: res.title,
           description: res.content,
         })
         browserHistory.push('/dashboard')
         return
        }


        this.setState({
          chatDetail: res
        },()=>{
          this.getGrouptour(parseInt(this.getJson().tripid))
        })
      })
    }
  }

  render() {
    const {currency} = this.props
    const {chatDetail,tripDetail} = this.state
    const data = this.getJson()
    const fristPhoto = tripDetail.photo && tripDetail.photo.filter(item => item.default === 1) || []
    return (
      <div>
        <DashboardHeader />
        <div className="max_width960 inbox_chat_wrap flex">
          <div className="inbox_chat_mainwrap">
            {/*
              <div className="inbox_chat_header">
                <h3>Inquiry</h3>
                <p>Info textInfo textInfo textInfo textInfo textInfo textInfo textInfo text</p>
              </div>
              */}
            <div className="inbox_chat_body">
              <ChatItem chatDetail={chatDetail} tripDetail={tripDetail}/>
            </div>
          </div>
          <div className="inbox_chat_information_wrap">
          <div className="booking_r_header">
            <div className="item_image ">
            {
              fristPhoto[0] && fristPhoto[0].url && <img src={fristPhoto[0].url+'?imageView2/3/w/640'} />
            }
                <div className="item_image_bar flex">
                <div className='item_rate'>
                  <div className="item_address">
                      <Icon type="environment" />{tripDetail.destination}
                  </div>
                  <Rate allowHalf defaultValue={5} disabled/>
                </div>
                <div className='item_person_price'>
                  {getCurrencyPrice(getDisplayPrice(tripDetail.priceInfo, tripDetail.basePrice,data.guestNum,true),currency)} <br/>
                  <span>per person </span>
                </div>
              </div>
            </div>

          </div>
            <div className="inbox_chat_information">
              {/*<div className="inbox_chat_avatar_wrap">
                <div className="inbox_chat_avatar">
                  <img src="http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1484146001_dr7vb_mwg1v?imageView2/3/w/200" />
                </div>
                <h2>Guest0001</h2>
                <p>Member since November 2016</p>
              </div>*/}


              <div className="inbox_chat_information_header">
                {tripDetail.tourTitle}
              </div>
              <div className="inbox_chat_information_body">
                <div className="body_item flex">
                  <div className="body_item_label">
                    <Icon type="calendar" />
                    Trip Date :
                  </div>
                  <div className="body_item_text">
                    {moment(data.startDate).format("MMMM Do YYYY")}
                  </div>
                </div>
                <div className="body_item flex">
                  <div className="body_item_label">
                    <Icon type="no_people" />
                    Guest(s) :
                  </div>
                  <div className="body_item_text">
                    {data.guestNum} People
                  </div>
                </div>
                {/*
                  <div className="body_item flex">
                    <div className="body_item_label">
                      <Icon type="no_people" />
                      Total Price :
                    </div>
                    <div className="body_item_text">
                      900.00 USD
                    </div>
                  </div>
                  */}
                <div className="inbox_chat_information_footer flex">
                  <Button type="next" >
                    <Link to={'/trip/'+tripDetail.id}>Book Now</Link>

                  </Button>
                {/*  <Button type="ghost">Cancel</Button>*/}
                </div>
              </div>
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
    currency: store.Common.currency,
  }
}
InboxChat = connect(select)(InboxChat)
module.exports = InboxChat;
