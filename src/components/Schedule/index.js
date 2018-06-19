import React from 'react';
import { Select,Input,Icon,Button} from 'antd';
import moment from 'moment';
const Option = Select.Option;
import styles from './index.scss'
const hourData = ['08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','00','01','02','03','04','05','06','07']
const minutesData = ['00','15','30','45']
const dataSchedule = [
  {
    description:'Meet up at our meeting point',
    startTime:0,
    sort: 0,
    title:''
  },
  {
    description:'',
    startTime:1,
    sort: 1,
    title:''
  },
  {
    description:'',
    startTime:2,
    sort: 2,
    title:''
  }
]
class Schedule extends React.Component {
  constructor(...args) {
    super(...args);
    this.state={
      value: this.props.value || []
    }
  }
  /**
   * 删除
   */
  _remove (k){
    const {onChange} = this.props
    const { value } = this.state;
    if (value.length < 3) {
     return;
    }
    const item = value.filter(key => key.startTime !== k.startTime)
    this.setState({
     value: item
    },()=>{
      onChange && onChange(item)
    })
    // this.props.value = value.filter(key => key.startTime !== k.startTime)
     //this.forceUpdate()
 }
 /**
  * 新增
  */
 _add () {
    const {onChange} = this.props
    const { value } = this.state;
    let data = value

    data.push({
      description:'',
      startTime:moment("23:45", "hh-mm").unix()*1000, // 最后
      sort: data.length,
      title:''
    })
   this.setState({
     value: data
   },()=>{
     //console.log(data)
     onChange && onChange(data)
   })

 }
 /**
  * 获取后面的 8小时
  */
  _get8Hours(itinerary, index) {
    if (index === 0) {
      return hourData;
    }
    let prev = '08';
    itinerary && itinerary.map(function (item, i) {
      var hour = item.title ? item.title.split(':')[0] : '';
      if (hour && i < index) {
        prev = hour;
      }
    });
    return [...hourData.slice(hourData.indexOf(prev)), ...hourData.slice(0, hourData.indexOf(prev))].slice(0, 8).map((hr)=> {
      return hr;
    })
  }
 componentWillUpdate(nextProps, nextState) {
    this.props = nextProps;
    this.state.value = nextProps.value
  }
  handleChange (event,index,type){
    const {onChange} = this.props
    const { value } = this.state;
    let data = value
    let item = data[index]
    let title = ''
    let description = ''
    if (type==='Hour') {
      let Hour = event
      let Minutes = this._getHour(item.title,1)
      title = Hour + ':' + Minutes
      description = item.description
    }
    if (type==='Minutes') {
      let Hour = this._getHour(item.title)
      let Minutes = event
      title = Hour + ':' + Minutes
      description = item.description
    }
    if (type==='textarea') {
      let Hour = this._getHour(item.title)
      let Minutes = this._getHour(item.title,1)
      title = Hour + ':' + Minutes
      description = event.target.value
    }
    item = {
      title: title,
      description: description,
      sort: index,
      startTime: title===':' && moment("23:45", "hh-mm").unix()*1000 || (title && moment(title, "hh-mm").unix()*1000) || moment("23:45", "hh-mm").unix()*1000,
    }
    data[index] = item

    /**
     *  按时间来排序
     */
    // data = data && data.sort((a,b)=>{ return moment(a.title, "hh-mm").unix() - moment(b.title, "hh-mm").unix()})
    //
    data = data && data.sort((a,b)=>{ return a.sort - b.sort})
    /**
     * 更新 startTime
     */
    data = data && Array.from(data, (item,index) => {
      return {
        ...item,
        sort:index,
        startTime: item.title===':' && moment("23:45", "hh-mm").unix()*1000 || (item.title && moment(item.title, "hh-mm").unix()*1000) || moment("23:45", "hh-mm").unix()*1000,
      }
    })

    this.setState({
      value: data
    },()=>{
      //console.log(data)
      onChange && onChange(data)
    })
  }
  componentDidMount () {

  }
  _getHour (title,num=0){
    return title && title.split(":")[num] || ''
  }
  renderItem (){
    const {value} = this.state
    const {onChange} = this.props
    let dataItem = value
    if (dataItem && dataItem.length===0) {
      this.setState({
        value: dataSchedule
      },()=>{
        dataItem = this.state.value
        onChange && onChange(dataSchedule)
      })
      return null
    }
    /**
     *  按时间来排序
     * @type {[type]}
     */
    //  dataItem = dataItem && dataItem.sort((a,b)=>{
    //   return (moment(a.title, "hh-mm").unix() - moment(b.title, "hh-mm").unix())
    //  })
    dataItem = dataItem && dataItem.sort((a,b)=>{
      return a.sort - b.sort
    })
    return dataItem && dataItem.map((k, index) => {
      return (
        <div className="form_item_input_time" key={index+k.startTime}>
          <div className="schedule_box">
            <div className="schedule_time">
              <Select
                className="item_select item_select_timepicker"
                dropdownClassName="item_select_dropdown "
                placeholder={'Hour'}
                defaultValue={this._getHour(k.title)}
                onChange={(value)=>this.handleChange(value,index,'Hour')}
                >
                {
                  this._get8Hours(value,index).map((item,index) => {
                    return (
                      <Option value={item} key={index}>{item}</Option>
                    )
                  })
                }
              </Select>
              <span className="schedule_line">:</span>
              <Select
                className="item_select item_select_timepicker"
                dropdownClassName="item_select_dropdown "
                placeholder={'Minutes'}
                defaultValue={this._getHour(k.title,1)}
                onChange={(value)=>this.handleChange(value,index,'Minutes')}
                >
                {
                  minutesData.map((item,index) => {
                    return (
                      <Option value={item} key={index}>{item}</Option>
                    )
                  })
                }
              </Select>
            </div>
            {
              index === 0 &&  (
                <div className="schedule_txt">
                {k.description  || 'Meet up at our meeting point'}
                </div>
              )
            }
            {
              index !== 0 &&  (
                <div className="schedule_textarea">
                    <Input type="textarea" defaultValue={k.description} onChange={(e)=>this.handleChange(e,index,'textarea')}/>
                     {
                       index > 2 &&  (
                         <div className="bnt_add_remove">
                           <Icon
                             className="dynamic-delete-button"
                             type="close-circle"
                             onClick={() => this._remove(k)}
                           />
                          </div>
                       )
                     }
                </div>
              )
            }
          </div>
        </div>
      )
    })
  }
  render() {
    return (
      <div >
        {this.renderItem()}
        <div className="bnt_add_more">
            <Button type="primary"  onClick={()=>{this._add()}}>+Add more</Button>
        </div>
      </div>
    )
  }
}
module.exports = Schedule;
