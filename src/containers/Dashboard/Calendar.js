/**
 * 日历管理
 */
import React from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Button,Icon,Spin,Radio,Tag,notification } from 'antd';
import styles from './index.scss'
import Calendarstyles from './Calendar.scss'
import CalendarStyles from 'components/Calendar/index.scss'
import RangeCalendar from 'rc-calendar/lib/RangeCalendar'
import zhCN from 'rc-calendar/lib/locale/zh_CN'
import enUS from 'rc-calendar/lib/locale/en_US'
import FullCalendar from 'rc-calendar/lib/FullCalendar'
import CalendarHeader from 'components/Calendar/CalendarHeader'
import LeftBar from 'components/LeftBar'
import DashboardHeader from 'components/Header/DashboardHeader'
import { FormattedMessage } from 'react-intl'
import {_includes} from 'utils'
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const formatStr = 'YYYY-MM-DD HH:mm:ss';
import moment from 'moment'
import {_putSchedule,_putSchedule2} from 'api'
import {getUserStatView} from 'actions/User'
class Calendar extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      isLoading :false,
      type: 'Available',
      value: moment(),
      busyDay:[],
      availableDay:[]
    }
    this.dateCellRender = this.dateCellRender.bind(this)
  }
  async componentDidMount (){
    const {dispatch,userData,userStatView} = this.props
    if (!userStatView.info2) {
      await dispatch(getUserStatView(userData.userId))
    }
    this._initDayData()
  }
  _initDayData () {
    const {userStatView} = this.props
    this.setState({
      busyDay: userStatView.info2 && userStatView.info2.busyDay && userStatView.info2.busyDay.split(",")|| [],
      availableDay: userStatView.info2 && userStatView.info2.availableDay && userStatView.info2.availableDay.split(",") || [],
    })
  }
  /**
   * 下个月
   */
  getNextValue() {
    const endValue = this.state.value.clone();
    endValue.add(1, 'months');
    return endValue
  }
  getAvailable(value) {
    if (!moment(value).isAfter(moment())) {
      return 'disabled'
    }
    const {busyDay,availableDay} = this.state
    const index = busyDay.indexOf(moment(value).format('MMDD'))
    if (index!==-1) {
      return 'Busy'
    }
    const index2 = availableDay.indexOf(moment(value).format('MMDD'))
    if (index2!==-1) {
      return 'Available'
    }
    return false
  }
  _onSelect (value) {
    if (!moment(value).isAfter(moment())) {
      return false
    }
    const {busyDay,availableDay,type} = this.state
    const valueArray = moment(value).format('MMDD')
    let newBusyDay = []
    let newAvailableDay = []
    // const _valueArray =  _includes([valueArray],v)
    // const _availableDay = _includes(availableDay,v)
    // const _busyDay = _includes(busyDay,v)
    //
    if (type==='Busy') {
      if (!_includes(busyDay,valueArray)) {
        newBusyDay = busyDay.concat([valueArray].filter(v => !_includes(busyDay,v)))
      }else{
        newBusyDay = busyDay.concat([valueArray]).filter(v => !_includes(busyDay,v) || !_includes([valueArray],v))
      }
      newAvailableDay = availableDay.filter(v => !_includes(availableDay,v) || !_includes([valueArray],v))
    }
    if (type==='Available') {
      if (!_includes(availableDay,valueArray)) {
        newAvailableDay = availableDay.concat([valueArray].filter(v => !_includes(availableDay,v)))
      }else{
        newAvailableDay = availableDay.concat([valueArray]).filter(v => !_includes(availableDay,v) || !_includes([valueArray],v))
      }
      newBusyDay = busyDay.filter(v => !_includes(busyDay,v) || !_includes([valueArray],v))
    }
    this.setState({
      busyDay: newBusyDay,
      availableDay:newAvailableDay,
    },()=>{
      console.log(this.state.busyDay)
      console.log(this.state.availableDay)
    })
    return false
  }
  dateCellRender(value) {
    const data = this.getAvailable(value);
    if (data==='Busy') {
      return (
        <div className="rc-calendar-date busyDay">
          {
            value.date()
          }
        </div>
      )
    }
    if (data==='Available') {
      return (
        <div className="rc-calendar-date availableDay">
          {
            value.date()
          }
        </div>
      )
    }
    if (data==='disabled') {
      return (
        <div className="rc-calendar-date disabledDay" >
          {
            value.date()
          }
        </div>
      )
    }
    return (
      <div className="rc-calendar-date">
        {
          value.date()
        }
      </div>
    )
  }
  setValue (value) {
    if (!('value' in this.props) && this.state.value !== value) {
      this.setState({ value });
    }
  }
  getLocale  () {
    const {locale} = this.props;
    let localeLang = enUS;
    localeLang = (locale ==='zh') && {...localeLang,...zhCN} || enUS
    return localeLang;
  }
  _save (){
    const {busyDay,availableDay} = this.state
    const {userData} = this.props
    const data ={
      "busyDay": busyDay.join(","),
      "availableDay": availableDay.join(","),
    }
    console.log(data)
    _putSchedule2(data,userData.userId).then((res)=>{
      notification.success({
         message: '成功',
         description: '日期保存成功',
       })
    })

  }
  render() {
    const {locale} = this.props
    const {type,value} = this.state
    const nextValue = this.getNextValue()
    const localeLang = this.getLocale()
    const twoCalendar = !(window.document.body.offsetWidth<768)
    return (
      <div>
        <DashboardHeader />
        <div className="max_width flex calendar_wrap">
          <LeftBar type={'dashboard'}></LeftBar>
          <div className="dashboard_right">
            <h1 className="list_title"><FormattedMessage id="Dashboard.Item.Calendar" defaultMessage="Calendar" /></h1>
            <div className="calendar_main_wrap">
              <div className="calendar_title"><FormattedMessage id={"Dashboard.Calendar."+type} defaultMessage={type} /></div>
              <div className="calendar_main">
                <div className="calendar_header">
                  <RadioGroup defaultValue={type} onChange={(e)=>{
                      this.setState({
                        type:e.target.value
                      })
                    }}>
                    <RadioButton value="Available"><FormattedMessage id="Dashboard.Calendar.Available" defaultMessage="Available" /></RadioButton>
                    <RadioButton value="Busy"><FormattedMessage id="Dashboard.Calendar.Busy" defaultMessage="Busy" /></RadioButton>
                  </RadioGroup>
                  <p><FormattedMessage id="Dashboard.Calendar.p" defaultMessage="Selecting your available days/dates from the schedule enable a better and faster way for travelers to book your trip(s) instantly." /></p>
                </div>
                <div className="calendar_body">
                  <CalendarHeader
                    value={value}
                    prefixCls={'rc-calendar-full'}
                    enableNext={true}
                    twoCalendar={twoCalendar}
                    enablePrev={true}
                    locale={localeLang}
                    onValueChange={(value)=>{this.setValue(value)}}
                  />

                  <FullCalendar
                    Select={()=>{
                      return null
                    }}
                    {...this.props}
                    showHeader={false}
                    value={value}
                    dateCellRender= {this.dateCellRender}
                    fullscreen={false}
                    onSelect={(value)=>{
                      this._onSelect(value)
                    }}
                    />
                    {
                      twoCalendar && (<FullCalendar
                        {...this.props}
                        Select={()=>{
                          return null
                        }}
                        value={nextValue}
                        showHeader={false}
                        headerComponent={()=>{return (<div className='rc-calendar-full-header'></div>)}}
                        dateCellRender= {this.dateCellRender}
                        fullscreen={false}
                        onSelect={(value)=>{
                          this._onSelect(value)
                        }}
                        />)
                    }

                  {/*<RangeCalendar
                      showToday={false}

                      dateInputPlaceholder={['start', 'end']}
                      showOk={true}
                      format={formatStr}
                    />*/}
                </div>
                <div className="calendar_footer">

                  <Button type="primary"  onClick={()=>{
                    this._save()
                  }}><FormattedMessage id="Setting.Save" defaultMessage="Save" /></Button>
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
    userStatView: store.User.userStatView,
    locale: store.Common.locale
  }
}
Calendar = connect(select)(Calendar)
module.exports = Calendar;
