/**
 * 行程发布页面
 */
import React ,{PropTypes} from 'react';
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'

import LeftBar from 'components/LeftBar';
import {getActivitylabel,postTrip,apiUri,_getQiniu} from 'api'
import UploadList from 'components/UploadList'
import QiniuUpload from 'components/QiniuUpload'

import { Form, Button,Radio,Select,Input,InputNumber,Row,Col,TimePicker,Switch,Upload,Icon,notification} from 'antd';
import moment from 'moment';
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Dragger = Upload.Dragger;
// import "scss/rc/_rc-select.scss"
// import "scss/rc/_rc-radio.scss"
import styles from './index.scss'



import {updateStepDate} from 'actions/Trip'
let uuid = 2;
class Trip extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      step: 1,   //默认步骤
      tripId: 0,
      activitylabel: [{name:'测试活动'}],
      more_suggest: false,
      transportation_choose: false,
      priceType: 1, //价格类型 1，2
      priceSet: 1, //价格设置 1，2，3
      postData: {},
      errorSign: [], // 错误标记 0 false 1true 初始值无意义
      fileList: [], // 上传图片
    }
  }

  _handleChange() {
    let {transportation_choose} = this.state
    this.setState({
      transportation_choose: !transportation_choose
    })
  }
  componentWillMount () {
    const {location,params,userData,form} = this.props
    const step = parseInt(location.query && location.query.step || '1', 10);
    const tripId = params.id
    this.setState({
      step,
      tripId
    })
    form.setFieldsValue({
      keys: [0,1,2],
      'textarea-0': 'Meet up at our meeting point',
      'week-1':true, // 默认日期开启
      'week-2':true, // 默认日期开启
      'week-3':true, // 默认日期开启
      'week-4':true, // 默认日期开启
      'week-5':true, // 默认日期开启
      'week-6':true, // 默认日期开启
      'week-7':true, // 默认日期开启
    });
    /**
     * 获取 label
     * @type {[type]}
     */
    getActivitylabel().then((res)=>{
      this.setState({
        activitylabel: res
      })
    })
    // getActivitylabel
  }
  /**
   * step更新
   */
  componentDidUpdate (prevProps) {
    const {location} = this.props
    const step = parseInt(location.query && location.query.step || '1', 10);
    const prevstep = parseInt(prevProps.location.query && prevProps.location.query.step || '1', 10)
    if (prevstep !== step) {
      this.setState({step})
      // 验证错误 应该验证上一个步骤的
      this._validateForm(prevstep)
      // 保存表单
      this._saveForm(step)
    }
  }
    /**
     * 删除
     */
    _remove (k){
       const { form } = this.props;
       const keys = form.getFieldValue('keys');
       if (keys.length < 3) {
         return;
       }
       form.setFieldsValue({
         keys: keys.filter(key => key !== k),
       });
   }
   /**
    * 新增
    */
   _add () {
     uuid++;
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(uuid);
    form.setFieldsValue({
      keys: nextKeys,
    });
   }
  /**
   * 负值数据
   */
  _setData (data) {
    const {setFieldsValue} = this.props.form
    setFieldsValue(data)
  }
  /**
   *
   */
  _changeMore (){

    let { more_suggest } = this.state
    this.setState({
      more_suggest : !more_suggest
    })
  }
  /**
   * 切换价格类型
   * 1 基础价格 2进阶价格
   */
  _changePriceType (e) {
    this.setState({
      priceType : e.target.value
    })
  }
  /**
   * 切换价格设置
   * 1 费用全包 2不含餐饮 3 不含交通
   */
  _changePriceSet (e) {
    this.setState({
      priceSet : e.target.value
    })
  }
  /**
   * 验证表单
   */
  _validateForm(step){
    const {dispatch,form} = this.props
    const {postData,errorData} =this.state

    form.validateFields((error, value) => {
      // 错误直接覆盖
      // errorSign 0 false 1true
      let {errorSign} = this.state
      if (!!error) {
        errorSign[parseInt(step)-1] = 1
      }else{
        errorSign[parseInt(step)-1] = 0
      }
      this.setState({
        errorSign
      })
    })
  }
  /**
   * 保存表单
   */
  _saveForm (step) {
    const {dispatch,form} = this.props
    const {postData,errorData} =this.state
    form.validateFields((error, value) => {
       this.setState({
         postData : {
           ...postData,
           ...value,
         }
       },()=>{
         // 重新赋值
         this._setData(this.state.postData)
       })
    });
  }
  /**
   * 下一步
   */
  _nextStep () {
    let { step,tripId } = this.state
    if (step<6) {
      browserHistory.push('/dashboard/listing/'+tripId+'?step=' + parseInt(step + 1))
    }
  }
  /**
   * 处理post数据
   * 不填写的时候 可以保存拎到外面写
   */
  //  _getPostData (){
  //    const { step,tripId,postData,priceSet} = this.state
  //    const {userData,form} = this.props
   //
  //    let labels = postData.labels && postData.labels.join(",") || '' // 数组转成字符串
  //    // 自定义labels activities
  //    if (this.state.more_suggest) {
  //      labels = labels + ','+ form.getFieldValue('more_suggest')
  //    }
  //    const _postData = {
  //      "destination": postData.destination || '',
  //      "language": postData.language && postData.language.join(",") || '', // 数组转成字符串
  //      "tourSpan": postData.tourSpan && parseInt(postData.tourSpan) || '', // 数字
  //      "labels": labels, // 数组转成字符串
  //      "transportation": postData.transportation || 'Public Transportation', // transportation 不存在就是公共交通
  //      "tourTitle": postData.tourTitle,
  //      "willPlayReason": postData.willPlayReason,
  //      "meetingPlace": postData.meetingPlace,
  //      "photo": this._reformPhotos(), // 好像处理过了
  //      "itinerary": this._reformItinerary(),
  //      "travelToPrepare": postData.travelToPrepare,
  //      "priceType": (parseInt(priceSet) === 1 && ('费用全包')) || (parseInt(priceSet) === 2 && ('不含餐饮费用')) || (parseInt(priceSet) === 3 && ('不含交通餐饮门票费用')),
  //      "extraPayInfo": postData.extraPayInfo,
  //      "maximumNumber": postData.maximumNumber  && parseInt(postData.maximumNumber),
  //      "priceInfo": this._reformpriceInfo(),
  //      "basePrice": postData.basePrice && parseInt(postData.basePrice) || '',
  //      "operationWeek": this._reformWeek()
  //    }
  //    return _postData
  //  }
  /**
   * 提交表单
   */
    _submitForm () {
      const { step,tripId,postData,priceSet} = this.state
      const {userData,form} = this.props
      //const disabled = this._submitBnt()
      if (this._submitBnt()) {
        notification.error({
         message: '有错误',
         description: '有错误',
       })
        return false
      }
      let labels = postData.labels && postData.labels.join(",") // 数组转成字符串
      // 自定义labels activities
      if (this.state.more_suggest) {
        labels = labels + ','+ form.getFieldValue('more_suggest')
      }
      const _postData = {
        "destination": postData.destination,
        "language": postData.language && postData.language.join(","), // 数组转成字符串
        "tourSpan": postData.tourSpan && parseInt(postData.tourSpan), // 数字
        "labels": labels, // 数组转成字符串
        "transportation": postData.transportation || 'Public Transportation', // transportation 不存在就是公共交通
        "tourTitle": postData.tourTitle,
        "willPlayReason": postData.willPlayReason,
        "meetingPlace": postData.meetingPlace,
        "photo": this._reformPhotos(), // 好像处理过了
        "itinerary": this._reformItinerary(),
        "travelToPrepare": postData.travelToPrepare,
        "priceType": (parseInt(priceSet) === 1 && ('费用全包')) || (parseInt(priceSet) === 2 && ('不含餐饮费用')) || (parseInt(priceSet) === 3 && ('不含交通餐饮门票费用')),
        "extraPayInfo": postData.extraPayInfo,
        "maximumNumber": postData.maximumNumber  && parseInt(postData.maximumNumber),
        "priceInfo": this._reformpriceInfo(),
        "basePrice": postData.basePrice && parseInt(postData.basePrice) || 0,
        "operationWeek": this._reformWeek()
      }
      console.log(_postData)
      postTrip(_postData).then((res)=>{
          notification.success({
           message: '发布了成功',
           description: '发布了成功',
         })
         browserHistory.push('/dashboard/listing/')
      })
   }
   /**
    * 星期处理
    */
   _reformWeek () {
     const {getFieldValue} = this.props.form
     let week = []
     for (var i = 1; i < 8; i++) {
       if (!!getFieldValue(`week-${i}`)) {
         week.push(1)
       }else {
         week.push(0)
       }
     }
      return week.join('')
   }
   /**
    * 上传图片处理 uploadPhotos
    */
  _reformPhotos (){
    const {getFieldValue} = this.props.form
    // 先默认第一张
    return Array.from(getFieldValue('uploadPhotos'), (item,index) => {
      return Object.assign({},item,{
        "default" : (index===0) && 1 || 0,
        // "other": item // 方便回传的时候重组数据
      })
    })
  }

   /**
    * 咋项数据重组 introduction
    * more_suggest 新体验类型
    * why_this_trip 必玩理由
    * meeting_point 见面地点
    * trip_prepare 旅行
    * this.state.priceSet 1 2 3 费用范围 '费用全包' '不含餐饮费用' '不含交通餐饮门票费用'
    * extra_prepare 其他费用
    */
   _reformIntroduction (value){
     let introduction = []
     const {getFieldValue} = this.props.form
     const {priceSet} = this.state
     if (getFieldValue('more_suggest')) {
       introduction.push({
          "id":1, //方便回传读取
          "title": "体验类型",
          "description" : getFieldValue('more_suggest')
       })
     }
     if (getFieldValue('why_this_trip')) {
       introduction.push(
         {
           "id":2,
           "title": "必玩理由",
           "description" : getFieldValue('why_this_trip')
         }
       )
     }
     if (getFieldValue('meeting_point')) {
       introduction.push(
         {
           "id":3,
           "title": "见面地点",
           "description" : getFieldValue('meeting_point')
         }
       )
     }
     if (getFieldValue('trip_prepare')) {
       introduction.push(
         {
           "id":4,
           "title": "旅行准备",
           "description" : getFieldValue('trip_prepare')
         }
       )
     }
     if (priceSet) {
       introduction.push(
         {
           "id":5,
           "title": "费用范围",
           // '费用全包' '不含餐饮费用' '不含交通餐饮门票费用'
           "description" : (parseInt(priceSet) === 1 && ('费用全包')) || (parseInt(priceSet) === 2 && ('不含餐饮费用')) || (parseInt(priceSet) === 3 && ('不含交通餐饮门票费用'))
         }
       )
     }
     if (getFieldValue('extra_prepare')) {
       introduction.push(
         {
           "id":6,
           "title": "其他费用",
           "description" : getFieldValue('extra_prepare')
         }
       )
     }
     /**
      *  处理星期
      *  运营日期 用 0，1来表示 0 false 1true 7位数
      */
    let week = []
    for (var i = 1; i < 8; i++) {
      if (!!getFieldValue(`week-${i}`)) {
        week.push(1)
      }else {
        week.push(0)
      }
    }
    introduction.push(
      {
        "title": "运营日期",
        "description" : week.join('')
      }
    )
     return introduction
   }
   /**
    * 进阶价格处理
    */
    _reformpriceInfo(){
      const {getFieldValue} = this.props.form
      const {priceType} = this.state
      let priceItem = []
      if (parseInt(priceType)===2) { // 价格类型为2的时候处理 否则为 []
        for (var i = 1; i < parseInt(getFieldValue('maximumNumber'))+1; i++) {
          const price = getFieldValue(`pricing-${i}`) && getFieldValue(`pricing-${i}`)*parseInt(i) || 0
          priceItem.push({
            "id" : i,
            "title" : i.toString(),
            "description" : price.toString(),
          })
        }
      }
      return priceItem
    }

   /**
    *  时间流程 数据重组 Schedule
    */
   _reformItinerary () {
     const {getFieldValue} = this.props.form
     let itinerary = []
     const keys = getFieldValue('keys'); // itinerary 个数
     for (var i = 0; i < keys.length; i++) {
       const title = getFieldValue(`hour-${i}`)+':'+getFieldValue(`minutes-${i}`)
       itinerary.push({
         "id": i, // 存个标示  读取的时候方便
         "title" : title,
         "hour": getFieldValue(`hour-${i}`),
         "minutes": getFieldValue(`minutes-${i}`),
         "description": getFieldValue(`textarea-${i}`),
         "startTime":moment(title, "hh-mm").unix()*1000, // 存个时间戳
       })
     }
     return itinerary
   }
   /**
    * 全部错误汇统
    */
   _submitBnt (){
     const { errorSign } = this.state
     if (errorSign[0]===0 && errorSign[1]===0&& errorSign[2]===0&& errorSign[3]===0&& errorSign[4]===0) {
       return false
    }
     return true
   }
  /**
   * 按钮分类
   */
  _renderButton () {
    const { step } = this.state
    if (step===6) {
      const disabled = this._submitBnt()
      // 提交
      return (
        <div className="form_item form_item_bnt form_item_bnt_right">
          <Button type="primary" className=" mr20" onClick={()=>{this._saveForm(step)}}>Save</Button>
          <Button type="next" disabled={disabled} onClick={()=>{this._submitForm()}}>Submit</Button>
        </div>
      )
    }
    return (
      <div className="form_item form_item_bnt form_item_bnt_right">
        <Button type="primary" className="mr20" onClick={()=>{this._saveForm(step)}}>Save</Button>
        <Button type="next" onClick={()=>{this._nextStep()}}>Next</Button>
      </div>
    )
  }
  /**
   * 发布步骤渲染
   */
  _renderStep () {
    const { getFieldDecorator,getFieldValue,setFieldsValue } = this.props.form;
    const {userData} = this.props
    const { step,more_suggest,transportation_choose,activitylabel,errorData} = this.state
    // basic
    if (step===1) {
      return(
        <div>
          <h2>
            <span>Basic</span>
          </h2>
          <div className="form_item">
            <div className="form_item_label">Destination</div>
            <div className="form_item_select">
              <FormItem>
              {getFieldDecorator('destination',{
                rules: [
                  { required: true },
                ],
              })(
                <Select placeholder=""
                  className="item_select"
                  dropdownClassName="item_select_dropdown"
                  >
                    <OptGroup label="Popular Cities">
                    	<Option value="Bangkok">Bangkok</Option>
                    	<Option value="Ayutthaya">Ayutthaya</Option>
                    	<Option value="Chiang Mai">Chiang Mai</Option>
                    	<Option value="Karnchanaburi">Karnchanaburi</Option>
                    	<Option value="Pattaya">Pattaya</Option>
                    	<Option value="Phuket">Phuket</Option>
                    </OptGroup>
                    <OptGroup label="Bangkok and surroundings">
                    	<Option value="Chachoengsao">Chachoengsao</Option>
                    	<Option value="Chanthaburi">Chanthaburi</Option>
                    	<Option value="Chonburi">Chonburi</Option>
                    	<Option value="Hua Hin">Hua Hin</Option>
                    	<Option value="Nakhon Nayok">Nakhon Nayok</Option>
                    	<Option value="Nakhon Pathom">Nakhon Pathom</Option>
                    	<Option value="Nonthaburi">Nonthaburi</Option>
                    	<Option value="Pathum Thani">Pathum Thani</Option>
                    	<Option value="Ratchaburi">Ratchaburi</Option>
                    	<Option value="Samut Prakarn">Samut Prakarn</Option>
                    	<Option value="Samut Sakhon">Samut Sakhon</Option>
                    	<Option value="Samut Songkhram">Samut Songkhram</Option>
                    	<Option value="Saraburi">Saraburi</Option>
                    	<Option value="Suphan Buri">Suphan Buri</Option>
                    </OptGroup>
                    <OptGroup label="Northeast">
                    	<Option value="Bueng Kan">Bueng Kan</Option>
                    	<Option value="Buriram">Buriram</Option>
                    	<Option value="Khon Kaen">Khon Kaen</Option>
                    	<Option value="Loei">Loei</Option>
                    	<Option value="Nakhon Phanom">Nakhon Phanom</Option>
                    	<Option value="Nakhon Ratchasima">Nakhon Ratchasima</Option>
                    	<Option value="Nong Khai City">Nong Khai City</Option>
                    	<Option value="Sakon Nakhon">Sakon Nakhon</Option>
                    	<Option value="Surin">Surin</Option>
                    	<Option value="Udon Thani">Udon Thani</Option>
                    </OptGroup>
                    <OptGroup label="North">
                    	<Option value="Chiang Rai">Chiang Rai</Option>
                    	<Option value="Lampang">Lampang</Option>
                    	<Option value="Lamphun">Lamphun</Option>
                    	<Option value="Nan">Nan</Option>
                    </OptGroup>
                    <OptGroup label="South">
                    	<Option value="Chumphon">Chumphon</Option>
                    	<Option value="Hat Yai">Hat Yai</Option>
                    	<Option value="Krabi">Krabi</Option>
                    	<Option value="Nakhon Si Thammarat">Nakhon Si Thammarat</Option>
                    	<Option value="Phang Nga">Phang Nga</Option>
                    	<Option value="Ranong">Ranong</Option>
                    	<Option value="Songkhla">Songkhla</Option>
                    	<Option value="Surat Thani">Surat Thani</Option>
                    </OptGroup>
                    <OptGroup label="West">
                    	<Option value="Phetchaburi">Phetchaburi</Option>
                    	<Option value="Prachuap Khiri Khan">Prachuap Khiri Khan</Option>
                    	<Option value="Tak">Tak</Option>
                    </OptGroup>
                    <OptGroup label="East">
                    	<Option value="Prachinburi">Prachinburi</Option>
                    	<Option value="Rayong">Rayong</Option>
                    </OptGroup>
                </Select>
              )}
              </FormItem>
            </div>
          </div>
          <div className="form_item">
            <div className="form_item_label">Language</div>
            <div className="form_item_select">
              <FormItem>
              {getFieldDecorator('language',{
                rules: [
                  { required: true},
                ],
              })(
                <Select placeholder=""
                  multiple
                  className="item_select"
                  dropdownClassName="item_select_dropdown item_select_dropdown_multiple"
                  >
                  <Option value="中文">中文</Option>
                  <Option value="English">English</Option>
                </Select>
              )}
            </FormItem>
            </div>
          </div>
          <div className="form_item">
            <div className="form_item_label">Doration</div>
            <div className="form_item_select">
              <FormItem>
              {getFieldDecorator('tourSpan',{
                rules: [
                  { required: true},
                ],
              })(
                <Input />
              )}
            </FormItem>
            </div>
          </div>
          <div className="form_item">
            <div className="form_item_label">Main activities</div>
            <div className="form_item_input">
              <FormItem>
              {getFieldDecorator('labels',{
                rules: [
                  { required: true},
                ],
              })(
                <Select placeholder=""
                  multiple
                  className="item_select"
                  dropdownClassName="item_select_dropdown item_select_dropdown_multiple"
                  >
                  {
                    activitylabel && activitylabel.map((item,index) => {
                      return (
                        <Option value={item.name}>{item.name}</Option>
                      )
                    })
                  }
                </Select>
              )}
            </FormItem>
            </div>
            <div className="more_suggest">
              <span onClick={()=>{this._changeMore()}}>
              {  more_suggest && ('Hide') || ('Add')} more suggest activities
              </span>
            </div>
            {
              more_suggest && (  <div className="form_item_input" >
                    {getFieldDecorator('more_suggest')(
                      <Input />
                    )}
                </div>)
            }
          </div>
          <div className="form_item">
            <div className="form_item_label">Main Transportation</div>
            <div className="form_item_radio form_item_radio2">
              <FormItem>
              <RadioGroup onChange={()=>this._handleChange()} value={transportation_choose}>
                <Radio value={false}>Public Transportation</Radio>
                <Radio value={true}>Private Vehicle</Radio>
              </RadioGroup>
            </FormItem>
            </div>
            {
              transportation_choose && (
                  <div className="form_item_select">
                    <FormItem>
                    {getFieldDecorator('transportation',{
                      rules: [
                        { required: true},
                      ],
                    })(
                      <Select placeholder=""
                        className="item_select"
                        dropdownClassName="item_select_dropdown"
                        >
                        <Option value="Car">Car</Option>
                        <Option value="Motorcycle">Motorcycle</Option>
                        <Option value="Van">Van</Option>
                        <Option value="Jet Ski">Jet Ski</Option>
                        <Option value="Bike">Bike</Option>
                        <Option value="ATV">ATV</Option>
                        <Option value="Other">Other</Option>
                      </Select>
                    )}
                    </FormItem>
                  </div>
              )
            }
          </div>
        </div>
      )
    }

    //Overview
    if (step===2) {

      return (
        <div>
          <h2>
            <span>Overview</span>
          </h2>
          <div className="form_item">
            <div className="form_item_label">Name your trip</div>
            <div className="form_item_input">
              <FormItem>
                {getFieldDecorator('tourTitle',{
                  rules: [{
                    required: true
                  } ]})(
                   <Input type="textarea" autosize maxLength="150"/>
                 )}
               </FormItem>
            </div>
          </div>
          <div className="form_item">
            <div className="form_item_label">Why this trip？</div>
            <div className="form_item_input">
              <div className="form_item_input">
                <FormItem>
                  {getFieldDecorator('willPlayReason',{
                    rules: [{
                      required: true
                    } ]})(
                     <Input type="textarea" className="textarea_lg"/>
                   )}
                </FormItem>
              </div>
            </div>
          </div>
          <div className="form_item form_item_photo">

            <div className="form_item_label">Photos</div>
            <div className="form_item_tips">Please upload at least 3 pictures. <span>Click on photo to make cover, Tell more detail about your picture.</span></div>

            <div className="form_item_upload">

                <FormItem
                  hasFeedback={false}
                  >
                  <UploadList listType='picture-card'
                     items={this.state.fileList}
                     onRemove={(items,file,index)=>{
                       const {fileList} = this.state
                       let uploadPhotosItem = fileList.filter(item => item.photoId !== file.photoId)
                       this.setState({
                         fileList : uploadPhotosItem
                       },()=>{
                         setFieldsValue({
                           uploadPhotos: uploadPhotosItem
                         })
                       })
                     }}
                   />
                      {getFieldDecorator('uploadPhotos', {
                        name: 'file',
                        // valuePropName: 'fileList',
                        // fileList: this.state.fileList,
                        rules: [{
                          required: true,
                          type:'array',
                          len: 3,
                        }]
                      })(

                      <QiniuUpload
                        fileList={this.state.fileList}
                        classNames="qiniu_upload"
                        usertoken={userData.token}
                        onChange={(data)=>{
                          this.setState({
                            fileList : data
                          })
                        }}>
                        <div>
                           <Icon type="plus" />
                           <div className="ant-upload-text">Upload</div>
                         </div>
                      </QiniuUpload>

                    )}
                </FormItem>

            </div>
          </div>
        </div>
      )
    }
    //Detail
    if (step===3) {
      const hour = ['08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','00','01','02','03','04','05','06','07']
      const minutes = ['00','15','30','45']
      const keys = getFieldValue('keys');
      const ScheduleItems = keys.map((k, index) => {
        return (
          <div className="form_item_input_time">
            <div className="schedule_box">
              <div className="schedule_time">
                  <FormItem>
                  {getFieldDecorator(`hour-${k}`,{
                    rules: [{
                      required: true
                    } ]})(
                    <Select
                      className="item_select item_select_timepicker"
                      dropdownClassName="item_select_dropdown "
                      placeholder={'Hour'}
                      >
                      {
                        hour.map((item,index) => {
                          return (
                            <Option value={item}>{item}</Option>
                          )
                        })
                      }
                    </Select>
                  )}
                </FormItem>
                <span className="schedule_line">:</span>
                  <FormItem>
                  {getFieldDecorator(`minutes-${k}`,{
                    rules: [{
                      required: true
                    } ]})(
                    <Select
                      className="item_select item_select_timepicker"
                      dropdownClassName="item_select_dropdown "
                      placeholder={'Minutes'}
                      >
                      {
                        minutes.map((item,index) => {
                          return (
                            <Option value={item}>{item}</Option>
                          )
                        })
                      }
                    </Select>
                  )}
                </FormItem>
              </div>

              {
                index === 0 &&  (
                  <div className="schedule_txt">
                    Meet up at our meeting point
                  </div>
                )
              }
              {
                index !== 0 &&  (
                  <div className="schedule_textarea">
                    <FormItem>
                      {getFieldDecorator(`textarea-${k}`,{
                        rules: [{
                          required: true
                        } ]})(
                         <Input type="textarea" />
                       )}
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

                    </FormItem>
                  </div>
                )
              }
            </div>
          </div>
        );
      });
      return (
        <div>
          <h2>
            <span>Detail</span>
          </h2>
          <div className="form_item">
            <div className="form_item_label">Meeting Point</div>
            <div className="form_item_input">
              <FormItem>
                {getFieldDecorator('meetingPlace',{
                  rules: [{
                    required: true
                  } ]})(
                   <Input type="text" />
                 )}
               </FormItem>
            </div>
          </div>
          <div className="form_item">
            <div className="form_item_label">Schedule</div>
              {ScheduleItems}
            <div className="bnt_add_more">
                <Button type="primary"  onClick={()=>{this._add()}}>+Add more</Button>
            </div>
          </div>
          <div className="form_item">
            <div className="form_item_label">Things to prepare for the trip</div>
            <div className="form_item_tips">Is there anything travelers should prepare for this trip?</div>
            <div className="form_item_input">
              <div className="form_item_input">
                <FormItem>
                  {getFieldDecorator('travelToPrepare',{
                    rules: [{
                      required: true
                    } ]})(
                     <Input type="textarea" className="textarea_lg"/>
                   )}
                </FormItem>
              </div>

            </div>
          </div>
        </div>
      )
    }
    //Price
    if (step===4) {
      const {priceType,priceSet} = this.state
      const formItemLayout = {
        labelCol: { span: 12 },
        wrapperCol: { span: 12 },
      };

      let pricingItems = [];
      for (var i = 1; i < parseInt(getFieldValue('maximumNumber'))+1; i++) {
        pricingItems.push(<Row className="pricing_item_box flex ">
            <Col span={6} className="pricing_item_col">{i}</Col>
            <Col span={9} className="pricing_item_col">
              <FormItem
                hasFeedback={false}
                >
              {getFieldDecorator(`pricing-${i}`,{

                rules: [{
                  required: parseInt(priceType)===2,
                  type: 'integer',
                } ]})(
                 <InputNumber min={1} disabled={parseInt(priceType)===1} step={0}/>
               )}
               </FormItem>
              </Col>
            <Col span={9} className="pricing_item_col">${getFieldValue(`pricing-${i}`) && getFieldValue(`pricing-${i}`)*parseInt(i) || 0}USD</Col>
          </Row>);
      }
      return (
        <div>
          <h2>
            <span>Price</span>
          </h2>
          <div className="form_item form_item_min">
            <div className="form_item_tips">Please, use these price conditions as guides to calculate your trip fee and always make sure to inform your travelers about any additional expenses before the trip day.</div>
              <div className="form_item_radio">
                <FormItem>
                <RadioGroup onChange={(e)=>this._changePriceSet(e)} value={priceSet} className="form_item_radio_price">
                    <Radio value={1}>All inclusive</Radio>
                    {priceSet===1 && (
                      <div className="price_des">
                        <div>icon</div>
                        <p>Expenses, occur during a trip, are mainly included</p>
                        <p>- Public or private transportation fares : taxi, bts, mrt, etc.(Please estimate the cost of gasoline or vehicle rental fee, in case of using a private car)</p>
                        <p>- Foods; Meal(s) during the trip. (Please note that alcohol is always excluded)</p>
                        <p>- Admission fee: Amusement park, gallery, shows, and etc.</p>
                      </div>
                    )}
                  <Radio value={2}>Food excluded</Radio>
                    {priceSet===2 && (
                      <div className="price_des">
                        <div>icon</div>
                        <p>  Travelers pay for their meal(s) during a trip. Only the following expenses are included.</p>
                        <p>  Reminder; Local Experts should calculate your trip’s price including these two expenses</p>
                        <p>  - Public/ private transportation fares: taxi, bts, mrt, etc. (please estimate the cost of gasoline or vehicle rental fee, in case of using a private car)</p>
                        <p>  Admission fee: Amusement park, gallery, shows, and etc.</p>
                      </div>
                    )}
                  <Radio value={3}>Food, Transportation, Admission fee excluded</Radio>
                    {priceSet===3 && (
                      <div className="price_des">
                        <div>icon</div>
                        <p> The price you set is only for your guiding fee. All other expenses, occur during a trip, will be paid by travelers, themselves. Please roughly approximate travelers’ expenses and always inform them before the trip.</p>
                      </div>
                    )}
                </RadioGroup>
              </FormItem>
            </div>
          </div>
          <div className="form_item">
            <div className="form_item_label">Extra expense travelers should prepare</div>
            <div className="form_item_tips">Are there any extra expenses that travelers have to pay during the trip?</div>
            <div className="form_item_input">
              <FormItem>
                {getFieldDecorator('extraPayInfo',{
                  rules: [{
                    required: true
                  } ]})(
                   <Input type="textarea" className="textarea_lg" placeholder="e.g. your pocket money, alcoholic drinks, elephant ride fee."/>
                 )}
              </FormItem>
            </div>
          </div>
          <div className="form_item">
            <Row className="required_unit">
              <Col span={12}>
                <FormItem
                  label="Maximum travelers"
                  {...formItemLayout}
                  >
                  {getFieldDecorator('maximumNumber',{
                    initialValue: 1,
                    rules: [{
                      required: true
                    } ]})(
                      <Select
                        className="item_select"
                        dropdownClassName="item_select_dropdown"
                         style={{ width: 140 }}>
                        {
                          [1,2,3,4,5,6,7,8].map((item,index) => {
                            return (
                              <Option value={item}>{item}</Option>
                            )
                          })
                        }
                      </Select>
                   )}
                </FormItem>
              </Col>
              <Col span={12}>
              </Col>
            </Row>
          </div>

          <div className="form_item">

            <RadioGroup onChange={(e)=>this._changePriceType(e)} value={priceType} className="pricing_box flex">
                <Radio value={1} className="pricing_item">
                  <div className="pricing_item_main">
                    <div className="title">Basic pricing<Icon type="check-circle-o" /></div>
                    <Row className="pricing_item_box pricing_item_box2 flex hedaer">
                      <Col span={12} className="pricing_item_col">Price (per person)</Col>
                      <Col span={12} className="pricing_item_col">Total (per trip)</Col>
                    </Row>
                    <Row className="pricing_item_box pricing_item_box2 flex ">
                      <Col span={12} className="pricing_item_col">
                        <FormItem>
                        {getFieldDecorator('basePrice',{

                          rules: [{
                            required: parseInt(priceType)===1,
                            type: 'integer',
                          } ]})(
                            <InputNumber min={1} disabled={parseInt(priceType)===2} step={0}/>
                          )
                        }
                        </FormItem>
                        </Col>
                      <Col span={12} className="pricing_item_col">${getFieldValue('basePrice') && getFieldValue('basePrice') || 0}～{getFieldValue('basePrice') && getFieldValue('basePrice')* parseInt(getFieldValue('maximumNumber')) || 0}USD</Col>
                    </Row>
                  </div>
                </Radio>
                <Radio value={2} className="pricing_item">
                  <div className="pricing_item_main">
                    <div className="title">Advance pricing<Icon type="check-circle-o" /></div>
                    <Row className="pricing_item_box flex hedaer">
                      <Col span={6} className="pricing_item_col">Travelers</Col>
                      <Col span={9} className="pricing_item_col">Price (per person)</Col>
                      <Col span={9} className="pricing_item_col">Total (per trip)</Col>
                    </Row>
                    {pricingItems}

                  </div>
                </Radio>
            </RadioGroup>

          </div>
        </div>
      )
    }
    //Operating Day
    if (step===5) {
      const formItemLayout = {
       labelCol: { span: 14 },
       wrapperCol: { span: 6 },
     };
     //  const week = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
      return (
        <div>
          <h2>
            <span>Operating Day</span>
          </h2>
          <div className="form_item">
            <div className="form_item_tips">Please select days</div>
          </div>


          <div className="form_item form_item2">
            <Row className="form_item_switch">
              <Col span={11}>
                <FormItem
                  {...formItemLayout}
                  label="Monday"
                  >
                  {getFieldDecorator('week-1', { valuePropName: 'checked' })(
                     <Switch  />
                   )}
                </FormItem>
              </Col>
              <Col span={2}></Col>
              <Col span={11}>
                <FormItem
                  {...formItemLayout}
                  label="Tuesday"
                  >
                  {getFieldDecorator('week-2', { valuePropName: 'checked' })(
                     <Switch  />
                   )}
                </FormItem>
              </Col>
            </Row>
          </div>
          <div className="form_item form_item2">
            <Row className="form_item_switch">
              <Col span={11}>
                <FormItem
                  {...formItemLayout}
                  label="Wednesday"
                  >
                  {getFieldDecorator('week-3', { valuePropName: 'checked' })(
                     <Switch  />
                   )}
                </FormItem>
              </Col>
              <Col span={2}></Col>
              <Col span={11}>
                <FormItem
                  {...formItemLayout}
                  label="Thursday"
                  >
                  {getFieldDecorator('week-4', { valuePropName: 'checked' })(
                     <Switch  />
                   )}
                </FormItem>
              </Col>
            </Row>
          </div>

          <div className="form_item form_item2">
            <Row className="form_item_switch">
              <Col span={11}>
                <FormItem
                  {...formItemLayout}
                  label="Friday"
                  >
                  {getFieldDecorator('week-5', { valuePropName: 'checked' })(
                     <Switch  />
                   )}
                </FormItem>
              </Col>
              <Col span={2}></Col>
              <Col span={11}>
                <FormItem
                  {...formItemLayout}
                  label="Saturday"
                  >
                  {getFieldDecorator('week-6', { valuePropName: 'checked' })(
                     <Switch  />
                   )}
                </FormItem>
              </Col>
            </Row>
          </div>

          <div className="form_item form_item2">
            <Row className="form_item_switch form_item_switch_last">
              <Col span={11}>
                <FormItem
                  {...formItemLayout}
                  label="Sunday"
                  >
                  {getFieldDecorator('week-7', { valuePropName: 'checked' })(
                     <Switch  />
                   )}
                </FormItem>
              </Col>
              <Col span={2}></Col>
              <Col span={11}>

              </Col>
            </Row>
          </div>


        </div>
      )
    }

    //To complete your trip listing
    if (step===6) {
      return (
        <div>
          <h2>
            <span>To complete your trip listing</span>
          </h2>
          <div className="form_item ">
            <div className="form_item_tips">When you’ve completed your trip listing, click ‘Submit for approval’. Your trip will be under our review process. Please allow 3-7 business days for your trip to be approved and published on our website.</div>
          </div>
        </div>
      )
    }


    return null
  }
  /**
   * 渲染
   */
  render() {
    const { step,tripId,errorSign } = this.state
    return (
      <div className="max_width flex trip">
        <LeftBar activeStep={step} tripId={tripId} type={'step'} errorSign={errorSign}></LeftBar>
        <div className="dashboard_right trip_form">
          <Form>
            {this._renderStep()}
            {this._renderButton()}
          </Form>
        </div>
      </div>
    )
  }
}

function select(store){
  return {
    userData: store.User.userData
  }
}
Trip = Form.create()(Trip);
Trip = connect(select)(Trip)
module.exports = Trip;
