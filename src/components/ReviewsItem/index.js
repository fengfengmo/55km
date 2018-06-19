import React from 'react'
import { Rate,Input,Button} from 'antd'
import { FormattedMessage, FormattedDate } from 'react-intl'
import moment from 'moment'
import {_postReviewReply} from 'api'
import styles from './index.scss'
class ReplyReviewsItem extends React.Component {
  constructor(...args) {
    super(...args)
    this.state={
      replyBox:false
    }
  }
  postReviewReply () {
    const {data,userData} = this.props
    const postData = {
      "reviewId": data.review.id,
      "content": "回复评价内容",
      "userIdOfReply": userData.userId
    }
    _postReviewReply(postData).then((res)=>{

      console.log(res)
    })
  }

  render() {
    const {data,userData,reply} = this.props
    const {replyBox} = this.state
    if (data.review.userIdOfReply) {
      return (
        <div>
        <p className="createAt">{moment(data.review.createAt).format("MMMM Do YYYY")}</p>
        <div className="reviews_item_reply reviews_item">
          <div className="reviews_item_avatar">
            <div><img src={data.avatarOfReply+'?imageView2/1/w/120/h/120'} /></div>
            <span>{data.nickOfReply}</span>
          </div>
          <div className="reviews_item_con">
            <p>{data.review.contentOfReply}</p>
            <p className="createAt">{moment(data.review.replyAt).format("MMMM Do YYYY")}</p>
          </div>
        </div>
        </div>
      )
    }
    if (replyBox && reply) {
      return (
        <div>
        <p className="createAt">{moment(data.review.createAt).format("MMMM Do YYYY")}</p>
          <div className="reviews_item_reply reviews_item clearboth">
            <div className="reviews_item_avatar">
              <div><img src={userData.avatarUrl+'?imageView2/1/w/120/h/120'} /></div>
            </div>
            <div className="reviews_item_con clearboth">
              <Input type="textarea"  maxLength="150" rows={4} className="textarea_lg"/>
              <Button  type="primary" className="replyBnt" onClick={()=>{
                this.postReviewReply()
                this.setState({
                  replyBox: false
                })
              }}>Reply</Button>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="reviews_item_reply reviews_item clearboth">
        <p className="createAt">{moment(data.review.createAt).format("MMMM Do YYYY")}</p>
        {
          reply && (<div className="reviews_item_reply_button">
            <Button type="ghost" onClick={()=>{
              this.setState({
                replyBox: true
              })
            }}>Leave Public Respouse</Button>
          </div>)
        }
      </div>
    )
  }
}
class ReviewsItem extends React.Component {
  constructor(...args) {
    super(...args)
  }
  render() {
    const {data,type,userData} = this.props
    const _class = type==='reviews' && 'reviews_main reviews_type_reviews' || 'reviews_main'
    return (
      <div className={_class}>
        {
          data && data.map((item,index)=>{
            return(
              <div className="reviews_item" key={index}>
                <div className="reviews_item_avatar">
                  <div><img src={item.evaluatorAvatar+'?imageView2/1/w/120/h/120'} /></div>
                  <span>{item.evaluatorNick}</span>
                </div>
                <div className="reviews_item_con">
                  <p>{item.review.experience}</p>
                  <ReplyReviewsItem data={item} userData={userData}/>
                </div>
              </div>
            )
          })
        }
      </div>
    )
  }
}
export default ReviewsItem
