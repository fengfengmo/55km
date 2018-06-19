/**
 * 行程发布页面
 */
import React from 'react'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import {getActivitylabel,_postTrip,_putTrip,apiUri,_getQiniu,_getGrouptour} from 'api'
import UploadList from 'components/UploadList'
import QiniuUpload from 'components/QiniuUpload'
import LeftBar from 'components/LeftBar'
import Schedule from 'components/Schedule'
import AdvancePrice from 'components/AdvancePrice'
import { Form,Button,Radio,Select,Input,InputNumber,Row,Col,Switch,Icon,notification,Spin} from 'antd';
import {groupDestinations,sortByBestinations,exchangeRates,getCurrencyPrice,getCurrencyPrice2} from 'utils'
import moment from 'moment';
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

import {currencies} from 'utils/'
import styles from './index.scss'
import Tripstyles from './Trip.scss'


import {updateStepDate} from 'actions/Trip'

class Trip extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      isLoading:true,
      step: 1,   //默认步骤
      tripId: 0,
      activitylabel: [],
      more_suggest: false,
      transportation_choose: false,
      priceType: 1, //价格类型 1，2
      priceSet: 1, //价格设置 1，2，3
      postData: {},
      errorSign: [], // 错误标记 0 false 1true 初始值无意义
      fileList: [], // 上传图片
    }
    this._checkItinerary = this._checkItinerary.bind(this)
    this._checkpriceInfo = this._checkpriceInfo.bind(this)
    this._checkuPloadPhotos = this._checkuPloadPhotos.bind(this)
  }
  _handleChange() {
    let {transportation_choose} = this.state
    this.setState({
      transportation_choose: !transportation_choose
    })
  }
  /**
   * 该页只会发生update trip
   */
  componentDidMount () {
    const {location,params,userData,form} = this.props
    const step = parseInt(location.query && location.query.step || '1', 10);
    const tripId = params.id
    this.setState({
      step,
      tripId
    })
    /**
     * 获取 Main activities
     * @type {[type]}
     */
    getActivitylabel().then((res)=>{
      this.setState({
        activitylabel: res
      },()=>{
        this.getGrouptour(tripId)
      })
    })
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
   * 根据grouptourId返回旅程详情
   * @param  {[type]} grouptourId [description]
   * @return {[type]}          [description]
   */
  getGrouptour (grouptourId) {
    const {userData,currency} = this.props
    _getGrouptour(grouptourId).then((res)=>{
      /**
       * 不是拥有者
       */
      if (res.authorId !==userData.userId && userData.userId!==81) {
        browserHistory.push('/dashboard/listing/')
        return
      }

      // /**
      //  * 不是公共交通 显示选择项
      //  */
      // if (res.transportation!=='Public Transportation' && res.transportation!=='') {
      //   this.setState({
      //     transportation_choose: true
      //   })
      //   this._setData({
      //     transportation: ' ',
      //     transportation2: ' '
      //   })
      //   //res.transportation = res.transportation && res.transportation.split(",") || []
      // }
      // if (res.transportation==='Uber/Taxi' || res.transportation==='Subway/Bus') {
      //   this.setState({
      //     transportation_choose: false
      //   })
      //   this._setData({
      //     transportation: ' ',
      //     transportation2: res.transportation
      //   })
      // }

      res.labels = res.labels && res.labels.split(",") || []
      // 修复最后一个空值问题
      res.labels = res.labels.filter((item) => {return item !== ''})
      //console.log(res.labels)

      res.language = res.language && res.language.split(",") || []
      /**
       * 城市多选
       * @type {[type]}
       */
      res.destination = res.destination && res.destination.split(",") || []

      /**
       * 星期转化
       */
      res.operationWeek = res.operationWeek && res.operationWeek.split("") || []

      this._setData({
        'week-1':res.operationWeek[0] && parseInt(res.operationWeek[0])!==0 || false,
        'week-2':res.operationWeek[1] && parseInt(res.operationWeek[1])!==0 || false,
        'week-3':res.operationWeek[2] && parseInt(res.operationWeek[2])!==0 || false,
        'week-4':res.operationWeek[3] && parseInt(res.operationWeek[3])!==0 || false,
        'week-5':res.operationWeek[4] && parseInt(res.operationWeek[4])!==0 || false,
        'week-6':res.operationWeek[5] && parseInt(res.operationWeek[5])!==0 || false,
        'week-7':res.operationWeek[6] && parseInt(res.operationWeek[6])!==0 || false,
      });
      /**
       * 价格包含处理
       */
      if (res.priceType ==='费用全包') {
        this.setState({
          priceSet:1
        })
      }
      if (res.priceType ==='不含餐饮费用') {
        this.setState({
          priceSet:2
        })
      }
      if (res.priceType ==='不含交通餐饮门票费用') {
        this.setState({
          priceSet:3
        })
      }
      // console.log(res)
      if (res.priceInfo.length>0) {
        this.setState({
          priceType: 2
        })
        res.priceInfo = Array.from(res.priceInfo, (item,index) => {
          //console.log(getCurrencyPrice2(parseInt(item.description), currency))
          return {
            ...item,
            description: parseInt(getCurrencyPrice(item.description, currency))
          }
        })
      }else{
        res.basePrice = parseInt(getCurrencyPrice(res.basePrice,currency))
      }
      /**
       * 其他
       */
      //console.log(res)
      this._setData(res)

      /**
       * 不是公共交通 显示选择项
       */
      if (res.transportation!=='Public Transportation' && res.transportation!=='') {
        this.setState({
          transportation_choose: true
        })
        this._setData({
          transportation: ' ',
          transportation2: ' '
        })
        //res.transportation = res.transportation && res.transportation.split(",") || []
      }
      if (res.transportation==='Uber/Taxi' || res.transportation==='Subway/Bus') {
        this.setState({
          transportation_choose: false
        })
        this._setData({
          transportation: ' ',
          transportation2: res.transportation
        })
      }

      this.setState({
        postData:res
      })
      /**
       * 处理返回来的照片
       * @type {[type]}
       */

        this._setData({
          uploadPhotos: res.photo
        })
        this.setState({
          fileList: res.photo,
          isLoading:false,
        })

        // if (this.state.step===6) {
        //   /**
        //    * 检查所有表单
        //    */
        //   for (var i = 0; i < 6; i++) {
        //     this._validateForm(i)
        //   }
        // }
    })
  }

  /**
   * 赋值数据到from表单
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
  _saveForm (step,type) {
    const {dispatch,form} = this.props
    const {postData,errorData} =this.state
    form.validateFields((error, value) => {
       this.setState({
         postData : {
           ...postData,
           ...value,
         }
       },()=>{
         console.log(this.state.postData)
         // 重新赋值
         this._setData(this.state.postData)
         if (type) {
           this._savePostForm()
         }
       })
    });
  }
  /**
   * 提交保存的表单
   */
  _savePostForm () {
    const _postData = this._postData()
    _putTrip(_postData,this.state.tripId).then((res)=>{
      notification.success({
       message: '成功',
       description: '保存成功',
     })
    })
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
   * 上传数据处理 先都写出来方便看
   */
  _postData () {
    const { step,tripId,postData,priceSet,transportation_choose,priceType} = this.state
    const {userData,form} = this.props
    let labels = postData.labels && postData.labels.join(",") // 数组转成字符串
    // 自定义labels activities
    if (this.state.more_suggest) {
      labels = labels + ','+ form.getFieldValue('more_suggest')
    }
    /**
     * 时常计算
     * 之后隔天旅程不适用
     */
    let tourSpan = 0
    this._checkItinerary(null, postData.itinerary, (e)=>{
      if (!e) {
        // const itinerary = postData.itinerary.sort((a,b)=>{ return a.startTime - b.startTime})
        const itinerary = postData.itinerary.sort((a,b)=>{ return moment(a.title, "hh-mm").unix() - moment(b.title, "hh-mm").unix()})
        // tourSpan = moment(itinerary[postData.itinerary.length-1].startTime).diff(moment(itinerary[0].startTime), 'hour')
        tourSpan = moment(itinerary[postData.itinerary.length-1].title, "hh-mm").diff(moment(itinerary[0].title, "hh-mm"), 'hour')
      }
    })
    const _postData = {
      "destination": postData.destination && postData.destination.join(","),
      "language": postData.language && postData.language.join(","), // 数组转成字符串
      "tourSpan": parseFloat(tourSpan), // 数字
      "labels": labels, // 数组转成字符串
      "transportation": transportation_choose && postData.transportation || postData.transportation2, // transportation 不存在就是公共交通
      "tourTitle": postData.tourTitle,
      "willPlayReason": postData.willPlayReason,
      "meetingPlace": postData.meetingPlace,
      "photo": this._reformPhotos(), // 好像处理过了
      "itinerary": postData.itinerary, //this._reformItinerary(),
      "travelToPrepare": postData.travelToPrepare,
      "priceType": (parseInt(priceSet) === 1 && ('费用全包')) || (parseInt(priceSet) === 2 && ('不含餐饮费用')) || (parseInt(priceSet) === 3 && ('不含交通餐饮门票费用')),
      "extraPayInfo": postData.extraPayInfo,
      "maximumNumber": postData.maximumNumber  && parseInt(postData.maximumNumber),
      "priceInfo": priceType ===2 && this._getCurrencyPrice2(postData.priceInfo) || [], //  this._reformpriceInfo(),
      // "basePrice": priceType ===1 && postData.basePrice && parseInt(postData.basePrice) || null,
      "operationWeek": this._reformWeek()
    }
    if (postData.basePrice && priceType ===1) {
      _postData.basePrice = this._getCurrencyPrice2(parseInt(postData.basePrice))
      _postData.inventory = parseInt(postData.inventory) // 库存
    }
    return _postData
  }
  _isArray(o) {
      return Object.prototype.toString.call(o) === '[object Array]';
  }
  /**
   * 货币转换 以THB为准录入后台 历史数据为THB以此为准
   */
  _getCurrencyPrice2 (price) {
    const {currencyTrip}= this.props
    if (this._isArray(price)) {
      return Array.from(price, (item,index) => {
        //console.log(getCurrencyPrice2(parseInt(item.description), currency))
        return {
          ...item,
          description: getCurrencyPrice2(parseInt(item.description), currencyTrip).toString()
        }
      })
    }else{
      return getCurrencyPrice2(price, currencyTrip)
    }

  }
  /**
   * 提交表单
   */
    _submitForm () {
      //const disabled = this._submitBnt()
      if (this._submitBnt()) {
        notification.error({
         message: '有错误',
         description: '有错误',
       })
        return false
      }
      const _postData = this._postData()
      const {tripId} = this.state
      console.log(this._postData())
      /**
       * 先保存 后提交
       * @type {String}
       */
      _putTrip(_postData,this.state.tripId).then((res)=>{
        if (res) {
          _postTrip(_postData,tripId,2).then((res)=>{
              notification.success({
               message: '成功',
               description: '发布了成功',
             })
             browserHistory.push('/dashboard/listing/')
          })
        }
      })

   }
   /**
    * 星期处理
    */
   _reformWeek () {
     // const {getFieldValue} = this.props.form
     const {postData} = this.state

     let week = []
     for (var i = 1; i < 8; i++) {
       if (!!postData[`week-${i}`] ) {
         // 1 改成具体的数字
         week.push(i)
       }else {
         if (parseInt(postData.operationWeek[i-1])===i) {
           week.push(i)
         }else{
           week.push(0)
         }
       }
     }
      return week.join('')
   }
   /**
    * 上传图片处理 uploadPhotos
    */
  _reformPhotos (){
    /**
     * 2017/01/31更新antd后取值不到？？？
     */
    const {postData} = this.state
    // const {getFieldValue} = this.props.form
    // console.log(getFieldValue('uploadPhotos'))
    // 先默认第一张
    // return postData && postData.uploadPhotos && Array.from(postData.uploadPhotos, (item,index) => {
    //   return Object.assign({},item,{
    //     "default" : (index===0) && 1 || 0,
    //     // "other": item // 方便回传的时候重组数据
    //   })
    // }) || []
    if (postData) {
      if (postData.uploadPhotos) {
        const data  = postData.uploadPhotos.filter((item)=>{
          return item.default === 1
        })
        return Array.from(postData.uploadPhotos, (item,index) => {
          return Object.assign({},item,{
            default: (data.length===0 && index=== 0) && 1 || (item.default===1 && 1) ||  0,
          })
        }) || []
      }
      if (postData.photo) {
        return postData.photo
      }
      return []
    }
    return []
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
          <Button type="primary" className=" mr20" onClick={()=>{this._saveForm(step,true)}}><FormattedMessage id={'Dashboard.Listing.Save'} defaultMessage={'Save'} /></Button>
          <Button type="next" disabled={disabled} onClick={()=>{this._submitForm()}}><FormattedMessage id={'Dashboard.Listing.Submit'} defaultMessage={'Submit'} /></Button>
        </div>
      )
    }
    return (
      <div className="form_item form_item_bnt form_item_bnt_right">
        <Button type="primary" className="mr20" onClick={()=>{this._saveForm(step,true)}}><FormattedMessage id={'Dashboard.Listing.Save'} defaultMessage={'Save'} /></Button>
        <Button type="next" onClick={()=>{this._nextStep()}}><FormattedMessage id={'Dashboard.Listing.Next'} defaultMessage={'Next'} /></Button>
      </div>
    )
  }
  /**
   * checkItinerary 检查Schedule 所有字段不为空
   */
  _checkItinerary (rule, value, callback){
    let error = false
    value && value.map(function (item, index) {
      // console.log(item)
      if (item.title ==='' ||item.title.length!==5 ||item.startTime ==='' || item.description === '') {
        error = true
      }
    })
    if (value.length<3) {
      error = true
    }
    if (!error) {
       callback();
       return;
     }
   callback('Schedule!');
  }
  /**
   * checkpriceInfo 检查阶梯价格
   */
  _checkpriceInfo (rule, value, callback){
    let error = false
    if (parseInt(this.state.priceType)!==2) {
      callback();
      return;
    }
    value && value.map(function (item, index) {
      if (item.description === '') {
        error = true
      }
    })
    if (!error) {
     callback();
     return;
   }
   callback('priceInfo!');
  }
  /**
   * checkuPloadPhotos 检查照片数量 最低3
   */
  _checkuPloadPhotos (rule, value, callback){
    let error = false
    if (!value) {
      error = true
    }
    if (value && value.length<3) {
      error = true
    }
    if (!error) {
     callback();
     return;
   }
   callback('checkuPloadPhotos!');
  }
  getDestinations (){
    const destinations = groupDestinations()
    const destinationsD = Object.keys(destinations).sort(sortByBestinations)
    return destinationsD.map((item,index)=>{
      return (<OptGroup label={<FormattedMessage id={'Destination.'+item} defaultMessage={item} />} key={index}>{
        destinations[item].map((item2,index2)=>{
          return (<Option value={item2.city} key={index2}><FormattedMessage id={'Destination.'+item2.city} defaultMessage={item2.city} /></Option>)
        })
      }</OptGroup>)
    })
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
            <FormattedMessage id={'Dashboard.Listing.Basic'} defaultMessage={'Basic'} />
          </h2>
          <div className="form_item">
            <div className="form_item_label"><FormattedMessage id={'Dashboard.Listing.Basic.Destination'} defaultMessage={'Destination'} /></div>
            <div className="form_item_select">
              <FormItem>
              {getFieldDecorator('destination',{
                rules: [
                  { required: true },
                ],
              })(
                <Select placeholder=""
                multiple
                  className="item_select"
                  dropdownClassName="item_select_dropdown"
                  >
                    {this.getDestinations()}
                </Select>
              )}
              </FormItem>
            </div>
          </div>
          <div className="form_item">
            <div className="form_item_label"><FormattedMessage id={'Dashboard.Listing.Basic.Language'} defaultMessage={'Language'} /></div>
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

                  <Option value="Chinese"><FormattedMessage id={'Common.Language.Chinese'} defaultMessage='Chinese' /></Option>
                  <Option value="English"><FormattedMessage id={'Common.Language.English'} defaultMessage='English' /></Option>
                  <Option value="Thai"><FormattedMessage id={'Common.Language.Thai'} defaultMessage='Thai' /></Option>
                  <Option value="Vienamese"><FormattedMessage id={'Common.Language.Vienamese'} defaultMessage='Vienamese' /></Option>
                  <Option value="Japanese"><FormattedMessage id={'Common.Language.Japanese'} defaultMessage='Japanese' /></Option>
                  <Option value="Singlish"><FormattedMessage id={'Common.Language.Singlish'} defaultMessage='Singlish' /></Option>
                  <Option value="Malay"><FormattedMessage id={'Common.Language.Malay'} defaultMessage='Malay' /></Option>
                  <Option value="Indonesian"><FormattedMessage id={'Common.Language.Indonesian'} defaultMessage='Indonesian' /></Option>
                </Select>
              )}
            </FormItem>
            </div>
          </div>
          {/*<div className="form_item">
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
          </div>*/}
          <div className="form_item">
            <div className="form_item_label"><FormattedMessage id={'Dashboard.Listing.Basic.Main activities'} defaultMessage={'Main activities'} /></div>
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
                        <Option value={item.name} key={index}><FormattedMessage id={'Label.'+item.name} defaultMessage={item.name} /></Option>
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
            <div className="form_item_label"><FormattedMessage id={'Dashboard.Listing.Basic.Main Transportation'} defaultMessage={'Main Transportation'} /></div>
            <div className="form_item_radio form_item_radio2">
              <FormItem>
              <RadioGroup onChange={()=>this._handleChange()} value={transportation_choose}>
                <Radio value={false}><FormattedMessage id={'Dashboard.Listing.Basic.Public Transportation'} defaultMessage={'Public Transportation'} /></Radio>
                <Radio value={true}><FormattedMessage id={'Dashboard.Listing.Basic.Private Vehicle'} defaultMessage={'Private Vehicle'} /></Radio>
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
                        <Option value="Car"><FormattedMessage id={'Transportation.Car'} defaultMessage={'Car'} /></Option>
                        <Option value="Motorcycle"><FormattedMessage id={'Transportation.Motorcycle'} defaultMessage={'Motorcycle'} /></Option>
                        <Option value="Mini Van"><FormattedMessage id={'Transportation.Mini Van'} defaultMessage={'Mini Van'} /></Option>
                        <Option value="Jet Ski"><FormattedMessage id={'Transportation.Jet Ski'} defaultMessage={'Jet Ski'} /></Option>
                        <Option value="Bike"><FormattedMessage id={'Transportation.Bike'} defaultMessage={'Bike'} /></Option>
                        <Option value="ATV"><FormattedMessage id={'Transportation.ATV'} defaultMessage={'ATV'} /></Option>
                        <Option value="Other"><FormattedMessage id={'Transportation.Other'} defaultMessage={'Other'} /></Option>
                      </Select>
                    )}
                    </FormItem>
                  </div>
              ) || (
                <div className="form_item_select">
                  <FormItem>
                  {getFieldDecorator('transportation2',{
                    rules: [
                      { required: true},
                    ],
                  })(
                    <Select placeholder=""
                      className="item_select"
                      dropdownClassName="item_select_dropdown"
                      >
                      <Option value="Uber/Taxi"><FormattedMessage id={'Transportation.Uber/Taxi'} defaultMessage={'Uber/Taxi'} /></Option>
                      <Option value="Subway/Bus"><FormattedMessage id={'Transportation.Subway/Bus'} defaultMessage={'Subway/Bus'} /></Option>
                      <Option value="Other"><FormattedMessage id={'Transportation.Other'} defaultMessage={'Other'} /></Option>
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
            <FormattedMessage id={'Dashboard.Listing.Overview'} defaultMessage={'Overview'} />
          </h2>
          <div className="form_item">
            <div className="form_item_label"><FormattedMessage id={'Dashboard.Listing.Name your trip'} defaultMessage={'Name your trip'} /></div>
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
            <div className="form_item_label"><FormattedMessage id={'Dashboard.Listing.Why this trip？'} defaultMessage={'Why this trip？'} /></div>
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
            <div className="form_item_label"><FormattedMessage id={'Dashboard.Listing.Photos'} defaultMessage={'Photos'} /></div>
            <div className="form_item_tips">
              <FormattedMessage id={'Dashboard.Listing.Photos.p1'} defaultMessage={'Please upload at least 3 pictures.'} />
              <span><FormattedMessage id={'Dashboard.Listing.Photos.p2'} defaultMessage={'Click on photo to make cover, Tell more detail about your picture.'} /></span>
            </div>
            <div className="form_item_upload">
                <FormItem
                  hasFeedback={false}
                  >
                  <UploadList listType='picture-card'
                     items={this.state.fileList}
                     onChange={(data)=>{
                       this.setState({
                         fileList : data
                       },()=>{
                         setFieldsValue({
                           uploadPhotos: data
                         })
                       })
                     }}
                     onRemove={(items,file,index)=>{
                       const {fileList} = this.state
                       let uploadPhotosItem = fileList.filter(item => item.url !== file.url)
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
                          validator: this._checkuPloadPhotos
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
                           <Icon type="add" />
                           <div className="ant-upload-text"><FormattedMessage id={'Dashboard.Listing.Upload'} defaultMessage={'Upload'} /></div>
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
      return (
        <div>
          <h2>
            <FormattedMessage id={'Dashboard.Listing.Detail'} defaultMessage={'Detail'} />
          </h2>
          <div className="form_item">
            <div className="form_item_label"><FormattedMessage id={'Dashboard.Listing.Meeting Point'} defaultMessage={'Meeting Point'} /></div>
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
            <div className="form_item_label"><FormattedMessage id={'Dashboard.Listing.Schedule'} defaultMessage={'Schedule'} /></div>
              {getFieldDecorator('itinerary',{
                rules: [{
                  required: true,
                  type:'array',
                  validator: this._checkItinerary
                } ]})(
                  <Schedule onChange={(data)=>{

                    }}/>
              )}
          </div>
          <div className="form_item">
            <div className="form_item_label"><FormattedMessage id={'Dashboard.Listing.Things'} defaultMessage={'Things to prepare for the trip'} /></div>
            <div className="form_item_tips"><FormattedMessage id={'Dashboard.Listing.Things.p1'} defaultMessage={'Is there anything travelers should prepare for this trip?'} /></div>
            <div className="form_item_input">
              <div className="form_item_input">
                <FormItem>
                  {getFieldDecorator('travelToPrepare',{
                    rules: [{
                      // required: true
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
      const {currency,currencyTrip,dispatch}= this.props
      const formItemLayout = {
        labelCol: { span: 12 },
        wrapperCol: { span: 12 },
      };

      return (
        <div>
          <h2>
            <FormattedMessage id={'Dashboard.Listing.Price'} defaultMessage={'Price'} />
          </h2>
          <div className="form_item form_item_min">
            <div className="form_item_tips"><FormattedMessage id={'Dashboard.Listing.Price.p'} defaultMessage={'Please, use these price conditions as guides to calculate your trip fee and always make sure to inform your travelers about any additional expenses before the trip day.'} /></div>
              <div className="form_item_radio">
                <FormItem>
                <RadioGroup onChange={(e)=>this._changePriceSet(e)} value={priceSet} className="form_item_radio_price">
                    <Radio value={1}><FormattedMessage id={'Dashboard.Listing.All inclusive'} defaultMessage={'All inclusive'} /></Radio>
                    {priceSet===1 && (
                      <div className="price_des">
                        {/*<div>icon</div>*/}
                        <p><FormattedMessage id={'Dashboard.Listing.All inclusive.p1'} defaultMessage={'Expenses, occur during a trip, are mainly included'} /></p>
                        <p><FormattedMessage id={'Dashboard.Listing.All inclusive.p2'} defaultMessage={'- Public or private transportation fares : taxi, bts, mrt, etc.(Please estimate the cost of gasoline or vehicle rental fee, in case of using a private car)'} /></p>
                        <p><FormattedMessage id={'Dashboard.Listing.All inclusive.p3'} defaultMessage={'- Foods; Meal(s) during the trip. (Please note that alcohol is always excluded)'} /></p>
                        <p><FormattedMessage id={'Dashboard.Listing.All inclusive.p4'} defaultMessage={'- Admission fee: Amusement park, gallery, shows, and etc.'} /></p>
                      </div>
                    )}
                  <Radio value={2}><FormattedMessage id={'Dashboard.Listing.Food excluded'} defaultMessage={'Food excluded'} /></Radio>
                    {priceSet===2 && (
                      <div className="price_des">
                        {/*<div>icon</div>*/}
                        <p><FormattedMessage id={'Dashboard.Listing.Food excluded.p1'} defaultMessage={'Travelers pay for their meal(s) during a trip. Only the following expenses are included.'} /></p>
                        <p>  Reminder; Local Experts should calculate your trip’s price including these two expenses</p>
                        <p><FormattedMessage id={'Dashboard.Listing.Food excluded.p3'} defaultMessage={'- Public/ private transportation fares: taxi, bts, mrt, etc. (please estimate the cost of gasoline or vehicle rental fee, in case of using a private car)'} /></p>
                        <p><FormattedMessage id={'Dashboard.Listing.Food excluded.p4'} defaultMessage={'Admission fee: Amusement park, gallery, shows, and etc.'} /></p>
                      </div>
                    )}
                  <Radio value={3}><FormattedMessage id={'Dashboard.Listing.Food, Transportation, Admission fee excluded'} defaultMessage={'Food, Transportation, Admission fee excluded'} /></Radio>
                    {priceSet===3 && (
                      <div className="price_des">
                        {/*<div>icon</div>*/}
                        <p><FormattedMessage id={'Dashboard.Listing.Food.p1'} defaultMessage={'The price you set is only for your guiding fee. All other expenses, occur during a trip, will be paid by travelers, themselves. Please roughly approximate travelers’ expenses and always inform them before the trip.'} /></p>
                      </div>
                    )}
                </RadioGroup>
              </FormItem>
            </div>
          </div>
          <div className="form_item">
            <div className="form_item_label"><FormattedMessage id={'Dashboard.Listing.Extra'} defaultMessage={'Extra expense travelers should prepare'} /></div>
            <div className="form_item_tips"><FormattedMessage id={'Dashboard.Listing.Extra.p'} defaultMessage={'Are there any extra expenses that travelers have to pay during the trip?'} /></div>
            <div className="form_item_input">
              <FormItem>
                {getFieldDecorator('extraPayInfo',{
                  rules: [{
                  //  required: true
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
                label={<FormattedMessage id={'Dashboard.Listing.Stock'} defaultMessage={'Stock'} />}
                {...formItemLayout}
                >
                {getFieldDecorator('inventory',{
                  initialValue: 1,
                  rules: [{
                    required: true
                  } ]})(
                    <InputNumber min={1} disabled={parseInt(priceType)===2} className="_ant-input-number-input" style={{ width: 140 }}/>
                 )}
              </FormItem>

              </Col>
              <Col span={12}>

              <FormItem
                label={<FormattedMessage id={'Dashboard.Listing.Maximum travelers'} defaultMessage={'Maximum travelers'} />}
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
                            <Option value={item} key={item}>{item}</Option>
                          )
                        })
                      }
                    </Select>
                 )}
              </FormItem>
              </Col>
            </Row>
          </div>

          <div className="form_item form_item_currencies">
            <Row className="required_unit">
              <Col span={12}>
              <FormItem
                label={<FormattedMessage id="Footer.Currency" defaultMessage="Currency" />}
                {...formItemLayout}
                >

                    <Select
                      className="item_select"
                      defaultValue={currencyTrip}
                      dropdownClassName="item_select_dropdown"
                      onChange={(value)=>{
                        dispatch({
                            type: 'SET_CURRENCYTRIP',
                            data: value
                        })
                      }}
                       style={{ width: 140 }}>
                      {
                        currencies.map((item,index) => {
                          return (
                            <Option value={item.value} key={index}>  <FormattedMessage id={'Common.Currencies.'+item.label} defaultMessage={item.label} /></Option>
                          )
                        })
                      }
                    </Select>

              </FormItem>

              </Col>
              <Col span={12}>


              </Col>
            </Row>
          </div>

          <div className="form_item ">

            <RadioGroup onChange={(e)=>this._changePriceType(e)} value={priceType} className="pricing_box flex">
                <Radio value={1} className="pricing_item">
                  <div className="pricing_item_main">
                    <div className="title"><FormattedMessage id={'Dashboard.Listing.Basic pricing'} defaultMessage={'Basic pricing'} /><Icon type="check-circle-o" /></div>
                    <Row className="pricing_item_box pricing_item_box2 flex hedaer">
                      <Col span={12} className="pricing_item_col"><FormattedMessage id={'Dashboard.Listing.Price (per person)'} defaultMessage={'Price (per person)'} /></Col>
                      <Col span={12} className="pricing_item_col"><FormattedMessage id={'Dashboard.Listing.Total (per trip)'} defaultMessage={'Total (per trip)'} /></Col>
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
                      <Col span={12} className="pricing_item_col">{getFieldValue('basePrice') && getFieldValue('basePrice') || 0}～{getFieldValue('basePrice') && getFieldValue('basePrice')* parseInt(getFieldValue('maximumNumber')) || 0}{currencyTrip}</Col>
                    </Row>
                  </div>
                </Radio>
                <Radio value={2} className="pricing_item">
                  <div className="pricing_item_main">
                    <div className="title"><FormattedMessage id={'Dashboard.Listing.Advance pricing'} defaultMessage={'Advance pricing'} /><Icon type="check-circle-o" /></div>
                    <Row className="pricing_item_box flex hedaer">
                      <Col span={6} className="pricing_item_col"><FormattedMessage id={'Dashboard.Listing.Travelers'} defaultMessage={'Travelers'} /></Col>
                      <Col span={9} className="pricing_item_col"><FormattedMessage id={'Dashboard.Listing.Price (per person)'} defaultMessage={'Price (per person)'} /></Col>
                      <Col span={9} className="pricing_item_col"><FormattedMessage id={'Dashboard.Listing.Total (per trip)'} defaultMessage={'Total (per trip)'} /></Col>
                    </Row>


                    {getFieldDecorator('priceInfo',{
                      rules: [{
                        required: parseInt(priceType)===2,
                        type: 'array',
                        validator: this._checkpriceInfo
                      } ]})(
                        <AdvancePrice
                          groupTourId={this.state.tripId}
                          disabled={parseInt(priceType)===1}
                          maximum={getFieldValue('maximumNumber')}
                          currency={currencyTrip}
                          />
                      )
                    }
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
            <FormattedMessage id={'Dashboard.Listing.Operating Day'} defaultMessage={'Operating Day'} />
          </h2>
          <div className="form_item">
            <div className="form_item_tips">Please select days</div>
          </div>
          <div className="form_item form_item2">
            <Row className="form_item_switch">
              <Col span={11}>
                <FormItem
                  {...formItemLayout}
                  label={<FormattedMessage id={'Common.Day.Monday'} defaultMessage={'Monday'} />}
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
                  label={<FormattedMessage id={'Common.Day.Tuesday'} defaultMessage={'Tuesday'} />}
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
                  label={<FormattedMessage id={'Common.Day.Wednesday'} defaultMessage={'Wednesday'} />}
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
                  label={<FormattedMessage id={'Common.Day.Thursday'} defaultMessage={'Thursday'} />}
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
                  label={<FormattedMessage id={'Common.Day.Friday'} defaultMessage={'Friday'} />}
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
                  label={<FormattedMessage id={'Common.Day.Saturday'} defaultMessage={'Saturday'} />}
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
                  label={<FormattedMessage id={'Common.Day.Sunday'} defaultMessage={'Sunday'} />}
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
          <div className="book_setting">
            <h2 >
              <span>Instant Book Setting</span>
            </h2>
            <div className="form_item">
              <div className="form_item_tips">Guests can book without waiting for your approval.</div>
            </div>
            <div className="form_item form_item2">
              <Row className="form_item_switch form_item_switch_last">
                <Col span={11}>
                  <FormItem
                    {...formItemLayout}
                    label="Need approval"
                    >

                  </FormItem>
                </Col>
                <Col span={2}></Col>
                <Col span={11}>
                  <FormItem
                    {...formItemLayout}
                    label=" "
                    className="no_label"
                    >
                    {getFieldDecorator('week-8', { valuePropName: 'checked' })(
                       <Switch  />
                     )}
                  </FormItem>
                </Col>
              </Row>

            </div>
          </div>
        </div>
      )
    }
    //To complete your trip listing
    if (step===6) {
      return (
        <div>
          <h2>
            <FormattedMessage id={'Dashboard.Listing.complete'} defaultMessage={'To complete your trip listing'} />
          </h2>
          <div className="form_item ">
            <div className="form_item_tips">
            <FormattedMessage id={'Dashboard.Listing.complete.p'} defaultMessage={'  When you’ve completed your trip listing, click ‘Submit for approval’. Your trip will be under our review process. Please allow 3-7 business days for your trip to be approved and published on our website.'} />
          </div>
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
    const { step,tripId,errorSign,isLoading } = this.state
    return (
      <Spin tip="Loading..." spinning={isLoading}>
      <div className="max_width flex trip_wrap">
        <LeftBar activeStep={step} tripId={tripId} type={'step'} errorSign={errorSign}></LeftBar>
        <div className="dashboard_right trip_form">
          <Form>
            {this._renderStep()}
            {this._renderButton()}
          </Form>
        </div>
      </div>
      </Spin>
    )
  }
}
function select(store){
  return {
    currency: store.Common.currency,
    currencyTrip: store.Common.currencyTrip,
    userData: store.User.userData
  }
}
Trip = Form.create()(Trip);
Trip = connect(select)(Trip)
module.exports = Trip;
