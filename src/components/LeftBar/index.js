import React from 'react';
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { Rate,Button,Icon } from 'antd'
import styles from './index.scss'
import { FormattedMessage} from 'react-intl'
const trip_item =[
  {
    id: 1,
    title_en: 'Basic',
    title_zh: '基本信息'
  },
  {
    id: 2,
    title_en: 'Overview',
    title_zh: '产品介绍'
  },
  {
    id: 3,
    title_en: 'Detail',
    title_zh: '行程详情'
  },
  {
    id: 4,
    title_en: 'Price',
    title_zh: '费用说明'
  },
  {
    id: 5,
    title_en: 'Conditions',
    title_zh: '预定条件'
  },
  {
    id: 6,
    title_en: 'Submit',
    title_zh: '提交行程'
  }
]
class LeftBar extends React.Component {
  constructor(...args) {
    super(...args);
  }
  /**
   * 渲染分步骤
   */
  _renderStepBar () {
    const {activeStep,tripId,errorSign,locale} = this.props
    return (
      <div className="step_bar">
        <h1><FormattedMessage id={'Dashboard.Listing.List Trip'} defaultMessage={'List Trip'} /></h1>
        <ul className="flex">
            {
              // activeClassName="active"
              trip_item.map((item,index) => {
                  return (<li className="flex leftbar_item" key={index}>
                    <Link to={'/dashboard/listing/'+tripId+'?step='+item.id} className={activeStep == item.id && 'active'}  >
                      <div className="flex item_box">
                        <div className="num">{item.id}</div>
                        <div className="title">
                          <span>{item['title_'+locale]}</span>
                        </div>
                        <div className="sign">
                          {errorSign[index] ===0 && index!==5 && <Icon type="check-circle" className="success" />}
                          {errorSign[index] ===1 && index!==5 && <Icon type="exclamation-circle" className="warn"/>}
                        </div>
                      </div>
                    </Link>
                  </li>)
              })
            }
        </ul>
      </div>
    )
  }
  /**
   * 渲染用户中心bar
   */
  _renderUserBar () {
      const {type,userData} = this.props
      let _centerHtml= <Button className="bnt" >
      <Link to={'/dashboard/calendar'} >
        <FormattedMessage id={'Dashboard.Common.Manage Availability'} defaultMessage={'Manage Availability'} />
      </Link>
      </Button>
      if (type === 'dashboard') {
        _centerHtml = (<div className="profile_edit_bnt">
          <Link to={'/local-expert/'+userData.userId} >
              <Icon type="Home" />
              <FormattedMessage id={'Dashboard.Common.View profile'} defaultMessage={'View profile'} />
          </Link>
          <Link to={'/dashboard/profile'} >
              <Icon type="edit_gray" />
              <FormattedMessage id={'Dashboard.Common.Edit profile'} defaultMessage={'Edit profile'} />
          </Link>
        </div>)
      }
      const avatarUrl = userData.avatarUrl || '/static/images/usericon_120.png'
      const divStyle = {
        backgroundImage: 'url(' + avatarUrl + '?imageView2/1/w/240/h/240)'
      };
      return (
        <div className="user_left_bar">
          <div className="left_bar_top">
            <div className="avatar_big" style={divStyle} ></div>
            <h1 className="avatar_name">{userData.nickname} </h1>
            <div className="user_rate">
              <Link to={'/reviews'} >
                <Rate allowHalf defaultValue={5} disabled/>
              </Link>
            </div>
          <p className="user_rate_reviews">

          <Link to={'/reviews'} ><FormattedMessage id={'TripDetail.Main.Reviews'} defaultMessage={'Reviews'} /></Link><span></span></p>
          </div>
          <div className="left_bar_center">
            {_centerHtml}
          </div>
          <div className="left_bar_bottom">
              <div className="left_bar_tips">
                <div className="title"><Icon type="tips" /><FormattedMessage id={'Dashboard.Common.Tips'} defaultMessage={'Tips'} /></div>
                <p><FormattedMessage id={'Dashboard.Common.Tell us'} defaultMessage={'Tell us about yourself by filling in the information on the right to help your prospective travelers learn more about you.'} /></p>
              </div>
          </div>
        </div>
      )
  }
  /**
   * 渲染
   */
  render() {
    const {type} = this.props
    return (
      <div className="leftbar">
      {type==='step' && this._renderStepBar() || this._renderUserBar()}
      </div>
    )
  }
}
function select(store){
  return {
    userData: store.User.userData,
    locale: store.Common.locale
  }
}
LeftBar = connect(select)(LeftBar)
module.exports = LeftBar;
