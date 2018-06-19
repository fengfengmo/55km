import React from 'react';
import { Link ,browserHistory} from 'react-router'
import { Input,Button,notification } from 'antd'
import { connect } from 'react-redux'
import moment from 'moment'
import styles from './index.scss'
import {_postNotification}  from 'api/'
import {trackEvent} from 'actions/common'
class ChatItem extends React.Component {
  constructor(...args) {
    super(...args);
    this.state={
      sendMessageData: null,
      tripDetail: {}
    }
  }
  componentWillMount (){

  }

  render() {
    const {chatDetail,userData} = this.props
    const {sendMessageData} = this.state
    const json = chatDetail && chatDetail.title && chatDetail.title.split('|json|') || []
    if (!json[1]) {
      //  出错信息
      return null
    }
    const item = JSON.parse(json[1])
    let newitem = item
    if (chatDetail && chatDetail.receiveId===userData.userId) {
      newitem = {
        ...item,
        avatarUrl: item.senderAvatarUrl,// 收件人头像
        senderAvatarUrl: item.avatarUrl, //发件人头像
        authorId: item.authorId,// 行程发布者 收件人
        nickname: item.senderNickname,//收件人昵称
        senderNickname: item.nickname,//发件人昵称
      }
    }
    // console.log(chatDetail)
    // console.log(userData)
    const postMessage={
        //  "title": "title2"+'|json|' +data.id+'|s|'+postDate +'|s|' +guestNum,
          "title": json[0]+'|json|' + JSON.stringify(newitem),
          "receiveId": chatDetail && chatDetail.receiveId!==userData.userId && chatDetail.receiveId ||  chatDetail.userId,
          "content": sendMessageData
      }

    return (
      <div className="chat_item_wrap">
        <div className="chat_item flex chat_item_mine chat_item_send">
          <div className="chat_avatar">  <img src={userData.avatarUrl+'?imageView2/1/w/240/h/240'} /></div>
          <div className="chat_bubble">
            <Input type={'textarea'} rows={4} value={sendMessageData} onChange={(e)=>{
              this.setState({
                sendMessageData: e.target.value
              })
            }}/>
            <div className="chat_send_box_footer">
              <Button type="primary" onClick={()=>{
                if (!sendMessageData) {
                  return false
                }
                _postNotification(postMessage).then((res)=>{
                  trackEvent('用户行为','inbox/inquiry','success')
                  notification.success({
                   message: '成功',
                   description: '消息发送成功，返回消息列表页。',
                 })
                 browserHistory.push('/dashboard/inbox')
                })
              }}>Send message</Button>
            </div>
          </div>
          <div className="chat_avatar"></div>
        </div>
        {
         chatDetail.userId === userData.userId && (
           <div className="chat_item flex chat_item_mine">
             <div className="chat_avatar">  <img src={userData.avatarUrl+'?imageView2/1/w/240/h/240'} /></div>
             <div className="chat_bubble">{chatDetail.content}<span className="time">{moment(chatDetail.createAt).format("MMMM Do YYYY")}</span></div>
             <div className="chat_avatar"></div>
           </div>
         ) || (
           <div className="chat_item flex">
             <div className="chat_avatar"> <img src={item.senderAvatarUrl+'?imageView2/1/w/240/h/240'} /></div>
             <div className="chat_bubble">{chatDetail.content}<span className="time">{moment(chatDetail.createAt).format("MMMM Do YYYY")}</span></div>
             <div className="chat_avatar"></div>
           </div>
         )
        }


      </div>
    )
  }
}

function select(store){
  return {
    userData: store.User.userData,
  }
}
ChatItem = connect(select)(ChatItem)
module.exports = ChatItem;
