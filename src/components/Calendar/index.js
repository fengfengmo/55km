/**
 * 2017/01/04
 */
import React from 'react';
import { Link } from 'react-router'
import './index.scss'
import Calendar from 'rc-calendar';
import DatePicker from 'rc-calendar/lib/Picker';
import {Input,Icon} from 'antd'
import {unshiftArray,_includes} from 'utils/'
// import 'rc-calendar/assets/index.css';
import moment from 'moment';
const format = 'YYYY-MM-DD HH:mm:ss';
const now = moment();
// console.log(now)
class MCalendar extends React.Component {
  constructor(...args) {
    super(...args);
    this.state={
      disabled: false,
    //  defaultValue: this.props.defaultValue && moment(this.props.defaultValue) || now,
      value: this.props.value && moment(this.props.value) || '',
      operationWeek: this.props.operationWeek && unshiftArray(this.props.operationWeek.split("")) || []
      // value: this.props.defaultValue,
    }
    this.disabledDate = this.disabledDate.bind(this)
  }
  componentWillUpdate(nextProps, nextState) {
     this.props = nextProps;
     this.state.value = nextProps.value &&  moment(nextProps.value)
     //console.log(nextProps.value && moment(nextProps.value))
    // this.state.defaultValue = nextProps.defaultValue && moment(nextProps.defaultValue)
     this.state.operationWeek = nextProps.operationWeek && unshiftArray(nextProps.operationWeek.split("")) || []
   }
  onPanelChange(value, mode) {
    console.log(value, mode);
  }
  onStandaloneChange (date){
  //  console.log(data)
  }
  onStandaloneSelect (date) {
    const {onSelect} = this.props
    console.log(date)
    this.setState({
      value:date
    },()=>{
      onSelect && onSelect(date)
    });
  }
  disabledDate (current){
    if (!current) {
      return false;
    }
    const {availableDay,busyDay} = this.props
    const weekDay = parseInt(current.format('d'))
    const day = current.format('MMDD').toString()
    const {operationWeek} = this.state
    const availableDayArray = availableDay && availableDay.split(",") || []
    const busyDayArray = busyDay && busyDay.split(",") || []
    /**
     * includes 安卓有兼容
     * @type {Number} !availableDayArray.includes(day)
     */
    // console.log(!(availableDayArray.indexOf(day)>=0))
    for (var i = 0; i < operationWeek.length; i++) {
      if ( parseInt(operationWeek[i]) ===0 && i ===weekDay && !_includes(availableDayArray,day)) {
        return true
      }
      if (_includes(busyDayArray,day)) {
        return true
      }
    }
    return moment(current).isBefore(now, 'day')
    //return current.date() < date.date();  // can not select days before today
  }
  getFormat(time) {
    return time ? format : 'YYYY-MM-DD';
  }
  _onChange(value) {
    this.setState({
      value,
    });
  }
  _renderCalendar (type) {
    const { disabled,value} = this.state
    return (<Calendar
      className={ type && "calendar_input" || "calendar"}
      showWeekNumber={false}
      defaultValue={this.state.value}
      showToday={true}
      formatter={()=>{this.getFormat(true)}}
      showOk={false}
      onChange={(date)=>{this.onStandaloneChange(date)}}
      disabledDate={this.disabledDate}
      onSelect={(date)=>{this.onStandaloneSelect(date)}}
    />)
  }
  render() {
    const {type,placeholder} = this.props
    const { disabled,value} = this.state
    const suffix = value ? <Icon type="close-circle" onClick={()=>{
      this.onStandaloneSelect(null)
    }} /> : null;
    if (type==='input') {
      return(
        <div >
        <DatePicker
            animation="slide-up"
            disabled={disabled}
            calendar={this._renderCalendar(true)}
            value={value}
          >
            {
              ({ value }) => {
                return (
                  <Input
                    placeholder={placeholder}
                    size={'large'}
                    disabled={disabled}
                    suffix={suffix}
                    readOnly
                    className="ant-calendar-picker-input ant-input"
                    value={value && value.format(this.getFormat(false)) || ''}
                  />

                );
              }
            }
          </DatePicker>
          </div>
      )
    }
    return (
      <div className="calendar_wrap">
        {this._renderCalendar()}
      </div>
    )
  }
}
module.exports = MCalendar;
