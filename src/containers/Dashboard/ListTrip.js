/**
 * 发布的行程list
 */
import React from 'react';
import { connect } from 'react-redux'
import { Link,browserHistory } from 'react-router'
import { Button,Icon,Spin } from 'antd';
import styles from './index.scss'
import ListTripstyles from './ListTrip.scss'
import TripItem from 'components/TripItem'
import LeftBar from 'components/LeftBar'
import DashboardHeader from 'components/Header/DashboardHeader'
import {getGrouptourAuthor,delGrouptourAuthor} from 'actions/Trip'
import {_creatTrip} from 'api'
import { FormattedMessage} from 'react-intl'
/**
 * 需要上传的字段
 * https://git.oschina.net/searchbb/Travelapp-Server/wikis/v2.2-api
 * @type {Object}
 */
const _postData = {
  "destination": '',
  "language": '',
  "tourSpan": 1,
  "labels": '',
  "transportation": '',
  "tourTitle": '',
  "willPlayReason": '',
  "meetingPlace": '',
  "photo": [],
  "itinerary": [],
  "travelToPrepare": '',
  "priceType": '',
  "extraPayInfo": '',
  "maximumNumber": 1,
  "priceInfo": [],
  "operationWeek": '1234567',
  "inventory": 10, // 库存
}
class ListTrip extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      isLoading :true
    }
  }
  componentWillMount (){
    const {dispatch,userData} = this.props
    /**
     * 获取用户旅程
     */
    dispatch(getGrouptourAuthor(userData.userId)).then(()=>{
      this.setState({
        isLoading:false
      })
    })
  }
  /**
   * 新增旅程 -> 返回id ->进入编辑状态->能保存 ->提交发布
   */
  addNewTrip () {
    _creatTrip(_postData).then((res)=>{
      if (res && res.id) {
        browserHistory.push('/dashboard/listing/'+res.id+'?step=1')
      }
    })
  }
  render() {
    const {authorIdGroupTour,dispatch} = this.props
    const _className = authorIdGroupTour.data && authorIdGroupTour.data.length!==0 && 'listtrip_title listtrip_title2 clearafter' || 'listtrip_title'
    return (
      <div>
      <DashboardHeader />
      <div className="max_width flex listtrip_wrap">
        <LeftBar></LeftBar>
        <div className="dashboard_right">
          <Spin spinning={this.state.isLoading} tip="Loading..." size="large">
          <div className={_className}>
            <h1 className="list_title" ><FormattedMessage id={'Dashboard.Item.Your Listings'} defaultMessage={'Your Listings'} /></h1>
            <div className="list_add" onClick={()=>{
                this.addNewTrip()
              }}>
              <Icon type="add" />
              <span><FormattedMessage id={'Trips.List.Add New Listings'} defaultMessage={'Add New Listings'} /></span>
            </div>
          </div>
          <TripItem itemlist={authorIdGroupTour && authorIdGroupTour.data}
            deleteTrip={(id)=>{
              dispatch(delGrouptourAuthor(id))
            }}
          />
          </Spin>
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
ListTrip = connect(select)(ListTrip)
module.exports = ListTrip;
