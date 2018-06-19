import React from 'react';
import { Link } from 'react-router'
import { Icon } from 'antd';
import styles from './index.scss'
import moment from 'moment'
import { FormattedMessage,FormattedDate } from 'react-intl'
class InboxCard extends React.Component {
  constructor(...args) {
    super(...args);
  }
  /**
   * 渲染目的地 有多个的情况
   */
  _Destination (value){
    if (!value) {
      return null
    }
    let destination = value.split(",")
    let newDestination = []
    destination.map((item,index)=>{
      newDestination.push(<FormattedMessage id={'Destination.'+item} defaultMessage={item} />)
      if (index!==destination.length-1) {
       newDestination.push(<span>,</span>)
      }
    })
    return newDestination
  }
  render() {
    const {data,type} = this.props
    if (!data) {
      return null
    }
    const json = data.title.split('|json|')
    if (!json[1]) {
      return null
    }
    const item = JSON.parse(json[1])
    const _id = data.outBoxId || data.id
    return (
      <div className="inbox_card">
        <Link to={'/dashboard/'+type+'/'+_id}>
        <div className="inbox_card_header flex">
          <div  className="inbox_card_avatar">
            <img src={item.senderAvatarUrl+'?imageView2/1/w/240/h/240'} />
            <h3>{item.senderNickname}</h3>
          </div>
          <div className="inbox_card_con flex">
            <h3>{json[0]}</h3>
            <p>{data.content}</p>
          </div>
          <div className="inbox_card_state">
            {/*<div className="inbox_card_state_type state_inquiry">
              Inquiry
            </div>*/}
          </div>
        </div>
        <div className="inbox_card_footer">
          <div className="inbox_card_con ">
            <div className="inbox_card_other flex">
              <div className="inbox_card_other_item inbox_card_other_item_none">
                <Icon type="location" />
                {this._Destination(item.destination)}
              </div>
              <div className="inbox_card_other_item">
                <Icon type="calendar" />
                {item.startDate && <FormattedDate value={item.startDate} year='numeric'month='long'day='2-digit'/>}
                {/*moment(item.startDate).format("MMM Do YYYY")*/}
              </div>
              <div className="inbox_card_other_item">
                <Icon type="no_people" />
                {item.guestNum} <FormattedMessage id={'Booking.Common.People'} defaultMessage={'People'} />
              </div>
              <div className="inbox_card_other_item"></div>
            </div>
          </div>
        </div>
      </Link>
      </div>
    )
  }
}
module.exports = InboxCard;
