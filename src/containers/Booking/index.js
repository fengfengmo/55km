import React from 'react';
import { Link ,browserHistory} from 'react-router'
import { Button,Dropdown,Menu,Icon,Rate,Steps,Select,Col,Row,Form,Radio,Input,Modal,notification,Tag} from 'antd';
import { connect } from 'react-redux'
import Header from 'components/Header'
import InformationItem from 'components/InformationItem'
import Calendar from 'components/Calendar'
import {openLogin} from 'actions/User'
import {_getGrouptour,_getUser,_postTripOrder,_getWechatQr,_checkWechatQr,_postNotification,_getDiscountcoupon,_postDiscountcoupon} from 'api/'
import {maximumNumber,replaceCon,getDisplayPrice,getCurrencyPrice,getFormat,commaize,commaizeInt,exchangeRates} from 'utils/'
import {getLS,saveLS,removeLS,trackPageview,trackEvent} from 'actions/common'
import { FormattedMessage,injectIntl,intlShape,FormattedDate } from 'react-intl'
import moment from 'moment'
import styles from './index.scss'
const Option = Select.Option;
const FormItem = Form.Item;
const Step = Steps.Step;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const confirm = Modal.confirm;
/**
 * 人民币转泰铢
 */
const exchange = 1/exchangeRates['CNY']
const steps = [{
  title: 'General'
}, {
  title: 'Information'
}, {
  title: 'Payment'
}, {
  title: 'Summary '
}]
const paymentMethod = [
  {
    Method:'Wechat',
    disabled: false,
  },
  {
    Method:'Paypal',
    disabled: true,
  },
  {
    Method:'Alipay',
    disabled: true,
  }
];
// {
//   "subject" : "testOrder",
//   "emergencyTel" : "13800000000",
//   "periodOfDay" : 10,
//   "totalAmount" : 3300,
//   "members" : [
//     {
//       "gender" : "男",
//       "firstnamePinyin" : "Jian",
//       "certificateType" : "身份证",
//       "certificateNo" : "4232320232233AB",
//       "frequentContacts" : true,
//       "birthday" : "2000-01-01",
//       "name" : "江山",
//       "lastnamePinyin" : "Shan"
//     },
//     {
//       "gender" : "男",
//       "firstnamePinyin" : "Jian",
//       "certificateType" : "护照",
//       "certificateNo" : "4232320232233ABab",
//       "birthday" : "2000-11-01",
//       "name" : "江山2",
//       "lastnamePinyin" : "Shan2"
//     }
//   ],
//   "insurance" : "中国人寿",
//   "contactName" : "江先生",
//   "otherRequire" : "我想一个人睡",
//   "userId" : 4,
//   "groupTourId" : 4,
//   "contactTel" : "13800138000",
//   "emergencyName" : "老同学",
//   "startDate" : "2016-03-06",
//   "contactEmail" : "abc@abc.com"
// }

// let bookNew = getLS('bookNew') && JSON.parse(getLS('bookNew'))

class Booking extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nothing: false,
      current: 1,
      bookType: 1,
      sendMessageData: '', // 咨询信息
      imgBlob: null,
      weixinPayQr: false, // 微信二维码
      payment: paymentMethod[0].Method, //支付方式
      PromoCode: '', // 优惠码
      startDate: null,
      guestNum: 1,
      data: {},
      hostedData: {},  // 发布人
      informationValue:[],
      bntDisabled:false, // 支付按钮关闭
      checkWechatQrNun: 0, //轮询查询次数
      DiscountcouponData: [], // 优惠券数量
      //DiscountcouponSel:null, // 选择的优惠券
    };
    /**
     * [{
       index:0,
       countryCode: this.props.userStatView.info1 && this.props.userStatView.info1.countryCode,
       email: this.props.userStatView.info1 && this.props.userStatView.info1.email,
       mobileNum: this.props.userStatView.info2 && this.props.userStatView.info1.mobileNum,
       familyName: this.props.userStatView.info2 && this.props.userStatView.info2.familyName,
       givenName: this.props.userStatView.info2 && this.props.userStatView.info2.givenName,
     }]
     */
  }
  componentWillMount () {
    const {location,params,userData,bookNew,userStatView} = this.props
    const step = parseInt(location.query && location.query.step || '1', 10);
    const bookNewJson = getLS('bookNew') && JSON.parse(getLS('bookNew'))
    let bookNewData = {}
    console.log(bookNew.data)
    if (bookNew && bookNew.data && bookNew.data.id) {
      /**
       * 走sotre取值
       */
      bookNewData = bookNew
    }else if (bookNewJson){
      /**
       * 走localStorage
       */
       notification.info({
         message: '提示',
         description: '预定行程超时，请重新预定。'
       })
      trackEvent('用户行为','booking','step0')
      removeLS('bookNew')
      browserHistory.push('/trip/'+bookNewJson.data.id)
      return
    }else{
      /**
       * 没有任何信息 返回去
       */
       trackEvent('用户行为','booking','step0')
      browserHistory.push('/')
      return
    }
    const informationValue = bookNewData.informationValue && bookNewData.informationValue.length>1 && bookNewData.informationValue || [
      {
        "mobileNum" : userStatView.info1 && userStatView.info1.mobileNum && userStatView.info1.mobileNum,
        "countryCode" : userStatView.info1 && userStatView.info1.countryCode && parseInt(userStatView.info1.countryCode),
        "email" : userStatView.info1 && userStatView.info1.email && userStatView.info1.email,
        "familyName" : userStatView.info2 && userStatView.info2.familyName && userStatView.info2.familyName,
        "givenName" : userStatView.info2 && userStatView.info2.givenName && userStatView.info2.givenName,
        "passport" : "",
        "index" : 0
      }
    ]
    trackEvent('用户行为','booking','step'+step)
    this.setState({
      current:step,
      startDate: bookNewData.startDate,
      guestNum: bookNewData.guestNum,
      data: bookNewData.data,
      hostedData: bookNewData.hostedData,
      informationValue:informationValue,
    },()=>{
      this.getDiscountcoupon()
    })

  }
  /**
   * 获取所有折扣券
   */
  getDiscountcoupon (code){
    const {userData,currency} = this.props
    const {data,guestNum}=this.state
    _getDiscountcoupon(userData.userId).then((res)=>{
      // console.log(res)
      this.setState({
        DiscountcouponData:res
      })
      /**
       * 激活后选定
       */
      if (code) {
        const DiscountcouponAmount = res.filter(item => code === item.code)
        const item = DiscountcouponAmount && DiscountcouponAmount[0]
        const total = getDisplayPrice(data.priceInfo,data.basePrice,guestNum) // 总价
        //const total = 1999
        const disabled =   (total > item.boundary*exchange || total === item.boundary*exchange)
        if (disabled) {
          this.setState({
            DiscountcouponSel: code
          })
        }else{
          // 展示屏蔽
          // notification.warn({
          //   message: '',
          //   description: '旅程总价不满' + getCurrencyPrice(item.boundary*exchange,currency)+ currency +'无法使用'
          // })
        }
      }
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
      trackEvent('用户行为','booking','step'+step)
      this.setState({
        current: step
      })
    }
  }
  /**
   * 激活优惠券
   */
  postDiscountcoupon(){
    const {userData} = this.props
    const {PromoCode} = this.state
    console.log(userData)
    const data = {
        "userId":userData.userId,
        "code":PromoCode,
        "keys":[//用来确认用户 如mac地址 [手机号 邮箱 省份证](后台自己能获取),不要用区分度不大的字符串作为指标
            userData.token
        ]
    }
    _postDiscountcoupon(data).then((res)=>{
      console.log(res)
      if (res) {
        trackEvent('用户行为','couponActivate','success')
        notification.success({
          message: '成功',
          description: '优惠券激活成功。'
        })
        this.getDiscountcoupon(PromoCode)
      }else{
        trackEvent('用户行为','couponActivate','fail')
        notification.error({
          message: '失败',
          description: '优惠券激活失败。'
        })
      }
    })
  }
  /**
   * 提交订单
   */
  postTripOrder (){
    const {data,informationValue,startDate,payment,guestNum} = this.state
    const {userData} = this.props
    if (!payment) {
      return false
    }
    const members = informationValue && Array.from(informationValue, (item,index) => {
      return Object.assign({},item,{
        gender:item.countryCode.toString(), // 手机归属地
        firstnamePinyin: item.familyName,//姓
        lastnamePinyin: item.givenName, //名
        certificateType: item.passport, //护照
        certificateNo: item.email,// 邮箱
        frequentContacts: false,
        birthday: moment().unix(),
        name: item.familyName +item.givenName,
      })
    })
    const postTripOrder ={
      "subject" : data.tourTitle,
      "emergencyTel" : members[0].gender + members[0].mobileNum,
      "periodOfDay" : guestNum,
      "totalAmount" : getCurrencyPrice(this._getTotalPrice(),'CNY'), // 总价 泰铢计算 getCurrencyPrice(this._getTotalPrice(),'CNY')
      "members" : members,
      "insurance" : '',
      "contactName" : members[0].name,
      "otherRequire" : members[0].certificateType,
      "userId" : userData.userId,
      "groupTourId" : data.id,
      "contactTel" : members[0].gender + members[0].mobileNum,
      "emergencyName" : '',
      "startDate" : moment(startDate).format(getFormat(false)),
      "contactEmail" : members[0].email,
      "status":'Agreed',
    }
    _postTripOrder(postTripOrder).then((res)=>{
      if (res && res.orderId) {
        const orderId = res.orderId
        this.setState({
          bntDisabled:true
        })
        trackEvent('用户行为','submitOrder','success')
        /**
         * 支付
         */
         if (payment==='Wechat') {
           _getWechatQr(orderId).then((res)=>{
             const URL = window.URL || window.webkitURL;
             const blobURL = URL.createObjectURL(res.data);
             this.setState({
               imgBlob: blobURL,
               outTradeNo: res.outTradeNo,
               orderId:orderId,
               weixinPayQr: true
             },()=>{
               console.log(res.outTradeNo)
              //  notification.success({
              //    message: '成功',
              //    description: '订单已生成'
              //  })
               this.checkWechatQr(orderId,res.outTradeNo)
             })
           })
         }

      }else{
        trackEvent('用户行为','submitOrder','fail')
      }
    })
  }
  /**
   * 微信支付订单查询
   */
  checkWechatQr(orderId,outTradeNo){
    const {checkWechatQrNun,data} = this.state
    _checkWechatQr(orderId,outTradeNo).then((res)=>{
      console.log(res)
      // 未支付 5秒查询一次
      if (res.payCode==='unpaid') {
        if (checkWechatQrNun<24) {
          window.setTimeout(()=>{
            this.setState({
              checkWechatQrNun: checkWechatQrNun+1
            },()=>{
              console.log('尝试第'+checkWechatQrNun)
              this.checkWechatQr(orderId,outTradeNo)
            })
          },5000)
        }else{
          console.log('支付失败')
          notification.error({
            message: '失败',
            description: '支付失败，返回旅程详情重新预定。'
          })
          trackEvent('用户行为','payment','fail')
          //清空book 返回去
          removeLS('bookNew')
          browserHistory.push('/trip/'+data.id)
        }
      }else{
        notification.success({
          message: '成功',
          description: '成功预定'
        })
        trackEvent('用户行为','payment','success')
        browserHistory.push('/booking/new/?step=4')
      }
    })
  }
  /**
   * 下一步
   */
  _nextStep () {
    let { current,tripid,informationValue } = this.state
    const {bookNew,dispatch} = this.props
    // let bookNew = getLS('bookNew') && JSON.parse(getLS('bookNew'))
    /**
     * 表单校验
     * @type {[type]}
     */
    if (current===1) {
      bookNew.startDate = this.state.startDate
      bookNew.guestNum = this.state.guestNum
      saveLS('bookNew',bookNew)
      dispatch({
          type: 'SET_BOOK_DATA',
          data: bookNew
      })
    }
    if (current===2) {
      this.props.form.validateFields((err, values) => {
        if (err) {
          console.log(err)
          return false
        }
        if (!err) {
          bookNew.informationValue = informationValue
          saveLS('bookNew',bookNew)
          dispatch({
              type: 'SET_BOOK_DATA',
              data: bookNew
          })
          browserHistory.push('/booking/new/?step=' + parseInt(current + 1))
          //console.log('Received values of form: ', values);
        }
      })
    }
    if (current===3) {
      this.postTripOrder()
      return false
    }
    if (current<4 && current!==2 && current!==3) {
      browserHistory.push('/booking/new/?step=' + parseInt(current + 1))
    }
  }
  _renderBnt(){
    let { current,startDate,informationValue,payment,bntDisabled} = this.state
    const {intl} = this.props
    let disabled = true
    let title = intl.formatMessage({id:"Booking.Common.Continue", defaultMessage: "Continue"})
    /**
     * 第一个按钮状态
     * @type {[type]}
     */
    if (current===1 ) {
      if (startDate) {
        disabled = false
      }
    }
    /**
     * 第二个按钮状态
     * @type {[type]}
     */
     if (current===2) {
       disabled = false
     }
     /**
      * 第二个按钮状态
      * @type {[type]}
      */
    if (current===3) {
      title = intl.formatMessage({id:"Booking.Common.Confirm Payment", defaultMessage: "Confirm Payment"})
      if (payment) {
        disabled = false
      }
      if (bntDisabled) {
        disabled = true
      }
    }
    if (current===4) {
      return(  <div className="step_footer_bnt">
          <Button type="next" style={{ width: 160,marginRight:12 }}>
            <Link to={'/dashboard/booking'}>
              <FormattedMessage id={'Booking.Step4.ok'} defaultMessage={'ok'} />
            </Link>
          </Button>
          <Button type="next" style={{ width: 160 }}>
            <Link to={'/search/Any'}>
            <FormattedMessage id={'Booking.Step4.Upcoming Trips'} defaultMessage={'Upcoming Trips'} />
            </Link>
          </Button>
        </div>)
    }
    return(  <div className="step_footer_bnt">
        <Button type="next" style={{ width: 160 }} onClick={()=>{this._nextStep()}} disabled={disabled}>
          {title}
        </Button>
      </div>)
  }

  _renderStep1 () {
    const {data,startDate,bookType,hostedData,guestNum,sendMessageData} = this.state
    const {currency,userData,intl}= this.props
    const newstartDate = startDate && moment(startDate).format("MMMM Do YYYY") || moment().format("MMMM Do YYYY")
  //  const placeholder= 'Hi '+hostedData.nickname+' , I’m interested in your trip on '+newstartDate+' with '+guestNum+' guest(s).'
    const placeholder = intl.formatMessage({id:"Booking.placeholder", defaultMessage: 'Hi {nickname}, I’m interested in your trip on {newstartDate} with {guestNum} guest(s).'},{nickname:hostedData.nickname,newstartDate:newstartDate,guestNum:guestNum})

    const postDate=  startDate && moment(startDate).unix()*1000 ||  moment().unix()*1000
    // const json = {
    //   tripid: data.id,
    //   destination: data.destination,
    //   avatarUrl: hostedData.avatarUrl,
    //   authorId: data.authorId,
    //   nickname: hostedData.nickname,
    //   startDate: startDate && moment(startDate).unix()*1000 ||  moment().unix()*1000,
    //   guestNum:guestNum,
    // }
    const json = {
      tripid: data.id,// 行程id
      destination: data.destination,// 行程目的地
      avatarUrl: hostedData.avatarUrl,// 收件人头像
      senderAvatarUrl: userData.avatarUrl, //发件人头像
      authorId: data.authorId,// 行程发布者 收件人
      nickname: hostedData.nickname,//收件人昵称
      senderNickname: userData.nickname,//发件人昵称
      startDate: startDate && moment(startDate).unix()*1000 ||  moment().unix()*1000, // 行程时间
      guestNum:guestNum, // 预定人数
    }
    const postMessage={
        //  "title": "title2"+'|json|' +data.id+'|s|'+postDate +'|s|' +guestNum,
          "title": data.tourTitle+'|json|' + JSON.stringify(json),
          "receiveId": data.authorId,
          "content": sendMessageData || placeholder
      }
    return (
      <RadioGroup onChange={(e)=>{
        if (e.target.value===1) {
          trackPageview('/inquiry')
          trackEvent('用户行为','inquiry','click')
        }
        this.setState({
          bookType : e.target.value
        })
      }} value={bookType} className="book_item_box flex">
        <Radio value={1} className="book_item">
          <div className="book_item_header">
            <div className="book_item_header_i">
              <span className="ant-radio-inner" ></span>
              <FormattedMessage id={'Booking.Step1.Inquiry'} defaultMessage={'Inquiry'} />
            </div>
            {bookType===1 && (
            <div className="inquiry_wrap booking_step">
              <div className="step_name"><FormattedMessage id={'Booking.Step1.Inquiry'} defaultMessage={'Inquiry'} /></div>
              <div className="step_header">
                <FormattedMessage id={'Booking.Step1.tips1'} defaultMessage={'It is recommended that booking this tour after confirming with Local Expert.'} />
              </div>
              <div className="inquiry_body">
                <div className="inquiry_choose clearafter">
                <div className="payment_body flex">
                  {this._renderCurrencies()}
                </div>
                  <div className="book_box_item flex">
                    <div className="book_coins_label">
                      <Icon type="calendar" />
                    </div>
                    <div className="book_people_select">
                      <Calendar type={'input'} value={startDate} operationWeek={data.operationWeek && data.operationWeek} onSelect={(date)=>{
                          this.setState({
                            startDate:date
                          })
                        }}/>
                    </div>
                  </div>
                  <div className="book_box_item flex">
                    <div className="book_coins_label">
                      <Icon type="no_people" />
                    </div>
                    <div className="book_people_select">
                      <Select
                        className="item_select"
                        dropdownClassName="item_select_dropdown"
                        value={guestNum}
                        size={'large'}
                        onChange={(e)=>{
                          this.setState({
                            guestNum: e
                          })
                        }}
                        style={{ width: '100%' }}>
                        {
                          maximumNumber.slice(0,data.maximumNumber).map((item,index) => {
                            return (
                              <Option value={item}>{item}</Option>
                            )
                          })
                        }
                      </Select>
                    </div>
                  </div>
                </div>
                <p><Input placeholder={placeholder} type="textarea" rows={5} value={sendMessageData} onChange={(e)=>{
                  this.setState({
                    sendMessageData: e.target.value
                  })
                }}/></p>
              </div>
              <div className="inquiry_footer step_footer_bnt">
                <Button key="submit" type="primary" size="large" style={{ width: 160 }} onClick={()=>{
                  _postNotification(postMessage).then((res)=>{
                    if (res) {
                      notification.success({
                        message: '成功',
                        description: '发送成功，里手将在24小时内给您回复，请耐心等待。绑定邮箱可以收到离线消息提示噢〜'
                      })
                    }
                  })
                }}>
                  Send
                </Button>
              </div>
            </div>

            )}
          </div>
        </Radio>
        <Radio value={2} className="book_item">
          <div className="book_item_header">
            <div className="book_item_header_i">
              <span className="ant-radio-inner" ></span>
              <FormattedMessage id={'Booking.Step1.Book now'} defaultMessage={'Book now'} />
            </div>
          </div>
          {
            // 为了刷新？？？
            bookType===2 && (<div className="booking_step">
            <div className="step_name"><FormattedMessage id={'Booking.Step1.STEP 1'} defaultMessage={'STEP 1'} /></div>
            <div className="step_header">
              <FormattedMessage id={'Booking.Step1.tips2'} defaultMessage={'Book now to secure your date & price. It won’t be held without completing the form.'} />
            </div>
            <div className="step_main flex">
              <div className="step_main_l">
              <div className="payment_body flex">
                {this._renderCurrencies()}
              </div>
                <Calendar
                    operationWeek={data.operationWeek && data.operationWeek}
                    value={startDate}
                    onSelect= {(date)=>{
                      this.setState({
                        startDate: date
                      })
                    }}
                    />
              </div>
              <div className="step_main_r">
              {!startDate && (<div><Icon type="exclamation-circle-o" /><FormattedMessage id={'Booking.Step1.Please select your trip date'} defaultMessage={'Please select your trip date'} /></div>)}
              </div>
            </div>
            <div className="step_footer">
              <div className="book_box_item">
                <Row>
                  <Col span={14}>
                    <div className="flex">
                      <div className="book_coins_label">
                        <FormattedMessage
                          id={'Booking.Common.Guest(s)'}
                          defaultMessage={`Guest(s)`}
                          />
                        <Icon type="no_people" />
                      </div>
                      <div className="book_people_select">
                        <Select
                          className="item_select"
                          dropdownClassName="item_select_dropdown"
                          defaultValue={this.state.guestNum}
                          value={this.state.guestNum}
                          onChange={(e)=>{
                            this.setState({
                              guestNum: e
                            })
                          }}
                          >
                          {
                            maximumNumber.slice(0,data.maximumNumber).map((item,index) => {
                              return (
                                <Option value={item}>{item}</Option>
                              )
                            })
                          }
                        </Select>
                      </div>
                    </div>
                  </Col>
                  <Col span={10}></Col>
                </Row>
              </div>
            </div>
            {this._renderBnt()}
            </div>)
          }
        </Radio>
      </RadioGroup>
    )
  }
  _renderStep2 () {
    const {informationValue} =this.state
    return(<div className="booking_step">
    <div className="step_name"><FormattedMessage id={'Booking.Step2.STEP 2'} defaultMessage={'STEP 2'} /></div>
    <div className="step_header">
      <FormattedMessage id={'Booking.Step2.tips1'} defaultMessage={'Tell us who’s coming & detail.We need this information so your travel companion can confirm their spot via email.Make sure host can contact you or you friends'} />
    </div>
    <div className="step_main flex">
      <InformationItem
        {...this.props}
        informationValue={informationValue}
        onChange={(value)=>{
          this.setState({
            informationValue: value
          })
        }}/>
    </div>
    {this._renderBnt()}
    </div>)
  }
  _renderStep3 () {
    const { currency,intl} =this.props
    const {data,guestNum,weixinPayQr,PromoCode,payment,DiscountcouponData,orderId,outTradeNo} =this.state
    const placeholder = intl.formatMessage({id:"Booking.Step3.CODE", defaultMessage: "CODE"})
    return(<div className="booking_step">
    <div className="step_name"><FormattedMessage id={'Booking.Step3.STEP 3'} defaultMessage={'STEP 3'} /></div>
    <div className="step_header">
      <FormattedMessage id={'Booking.Step3.tips1'} defaultMessage={'Once you’ve made the booking payment,the trip fee will be held and transferred to you local expert after the trip day.With the world-class secure platform,all you need to do is book the tour and enjoy!'} />
    </div>
    <div className="step_main">
      <div className="payment_title"><FormattedMessage id={'Booking.Step3.Choose payment type'} defaultMessage={'Choose payment type:'} /></div>
      <div className="payment_wrap">
        <RadioGroup value={payment} onChange={(e)=>{
          this.setState({
            payment:e.target.value
          })
        }}>
        {
          paymentMethod.map((item,index)=>{
            return (<RadioButton disabled={item.disabled} value={item.Method} key={index}><div className={'icon_Method icon_'+item.Method}></div></RadioButton>)
          })
        }
        </RadioGroup>
      </div>
      <div className="payment_discount_wrap flex">
        <div className="payment_discount_title flex_item"><FormattedMessage id={'Booking.Step3.Promo Discount'} defaultMessage={'Promo Discount'} />:</div>
        <div className="payment_discount_input flex_item">
          <Input placeholder={placeholder} size={'large'} value={PromoCode} onChange={(e)=>{
            this.setState({
              PromoCode: e.target.value
            })
          }}/>
        </div>
        <Button className="payment_discount_bnt flex_item" onClick={()=>{
          this.postDiscountcoupon()
        }}><FormattedMessage id={'Booking.Step3.Apply'} defaultMessage={'Apply'} /></Button>
      </div>
      {this._renderDiscountcoupon()}
      <div className="payment_body payment_body2 flex">
        {this._renderCurrencies()}
      </div>
    </div>
    {this._renderBnt()}
    <Modal title={(<div className="icon_Wechat"></div>)}
        visible={weixinPayQr}
        className="weixinPayQr_modal"
        maskClosable={false}
        onCancel={()=>{
          confirm({
            title: '关闭二维码将退出付款流程，您确定要退出吗?',
            onOk:()=>{
              this.setState({
                weixinPayQr: false,
                checkWechatQrNun: 24, // 最后一次刷新
              },()=>{
                this.checkWechatQr(orderId,outTradeNo)
              })
            },
            onCancel:()=>{},
          })
        }}
        footer={[]}
      >
      <div className="qrcode_header">扫一扫付款（元）<span>{commaize(getCurrencyPrice(this._getTotalPrice(),'CNY'))}</span></div>
      <div className="qrcode_img_wrapper">
          <img className="qrcode_img" src={this.state.imgBlob}/>
        <div className="qrcode_explain clearafter">
            <img className="fn_left" src="http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1486045584_dwl4j_bo0iw" alt="扫一扫标识"  />
            <div className="fn_left">打开微信<br/>扫一扫继续付款</div>
        </div>
      </div>
      <Tag color="#06BEBD">如您成功激活优惠券，在扫描微信支付二维码后即可看到优惠后的实际支付金额</Tag>
    </Modal>
    </div>)
  }
  _renderStep4 () {
    return(<div className="booking_step">
    <div className="step_name"></div>
    <div className="step_main flex step_main_success">
      <Icon type="check-circle" />
      <h3><FormattedMessage id={'Booking.Step4.tips1'} defaultMessage={'Your booking has been succesfully processed'} /></h3>
      <p><FormattedMessage id={'Booking.Step4.tips2'} defaultMessage={'Thank you so much for choosing to travel with 55km. Your recept will be sent to your email along with the booking voucher.'} /></p>
    </div>
    {this._renderBnt()}
    </div>)
  }
  /**
   * 渲染折扣区
   */
  _renderDiscountcoupon (){
    const {DiscountcouponData,DiscountcouponSel,data,guestNum} =this.state
    const total = getDisplayPrice(data.priceInfo,data.basePrice,guestNum) // 总价
    //const total = 1999
    // 总价太低不可用
    const DiscountData = Array.from(DiscountcouponData,(item)=>{
      return {
        ...item,
        disabled: !(total > item.boundary*exchange || total === item.boundary*exchange)
      }
    })
    return (<Tag color="#06BEBD">请先完成邮箱或手机认证，再使用优惠码。如您成功激活优惠券，在扫描微信支付二维码后即可看到优惠后的实际支付金额</Tag>)
    return(
      <div className="payment_discount_wrap_s flex">
        <div className="flex_item"></div>
        <div className="payment_discount_select flex_item">
            <Select
              className="item_select"
              value={DiscountcouponSel}
              dropdownClassName="item_select_dropdown payment_discount_dropdown"
              placeholder="选择优惠券"
              size={'large'}
              allowClear
              onChange={(value)=>{
                this.setState({
                  DiscountcouponSel:value
                })
              }}
              >
              {
                DiscountData.map((item,index) => {
                  return (
                    <Option value={item.code} disabled={item.disabled}>{item.code}{item.disabled && (<span>(不适用于该旅程)</span>)}</Option>
                  )
                })
              }
            </Select>
        </div>
      </div>
    )
  }
  /**
   * 总价计算 泰铢 //优惠额度
   */
  _getTotalPrice (type){
    const {data,guestNum,DiscountcouponData,DiscountcouponSel} =this.state
    const DiscountcouponAmount = DiscountcouponData.filter(item => DiscountcouponSel === item.code)
    let total = getDisplayPrice(data.priceInfo,data.basePrice,guestNum) // 总价
    let discount = 0 // 优惠价格
    // 换成泰铢
    const DiscountData = DiscountcouponAmount && Array.from(DiscountcouponAmount,(item)=>{
      return {
        ...item,
        amount: item.amount*exchange,
        boundary:item.boundary*exchange,
        deductionPrice:item.deductionPrice*exchange,
        minLimit:item.minLimit*exchange,
      }
    })
    const Discountdis = false
    /**
     * 关闭
     */
    if (DiscountData && DiscountData[0] && Discountdis) {
      /**
       * 满足额度 后减去抵扣价
       */
      if (total>DiscountData[0].amount || total ===DiscountData[0].amount) {
        total = total - DiscountData[0].boundary
        discount = DiscountData[0].boundary
      }else if(total < DiscountData[0].amount && (total > DiscountData[0].boundary ||  total===DiscountData[0].boundary)){
        /**
         * 不满足额度 满足边界 折扣力度
         */
        discount = total * (1-DiscountData[0].discount)
        total = total * DiscountData[0].discount
      }
    }
    // 返回折扣额度
    if (type) {
      return  discount
    }
    return total
  }
  _renderCurrencies () {
    const {currency} = this.props
    const { current,startDate,guestNum,data,DiscountcouponSel,DiscountcouponData} = this.state;
    const DiscountcouponAmount = DiscountcouponData.filter(item => DiscountcouponSel === item.code)
    const zj = 405
    // 优惠券为人民币 转泰铢计算
    const amount = DiscountcouponAmount && DiscountcouponAmount[0] && DiscountcouponAmount[0].amount*exchange || 0
    return (<div><div className="booking_r_item booking_r_item_small">
      <div className="item_label"><FormattedMessage id={'Booking.Common.Trip Price'} defaultMessage={'Trip Price'} /></div>
      <div className="item_txt">
        <FormattedMessage
          id={'Common.Currencies.'+currency}
          defaultMessage={`{num} `+ currency}
          values={{num: commaize(getCurrencyPrice(getDisplayPrice(data.priceInfo,data.basePrice,guestNum),currency))}}
          />
      </div>
    </div>
    <div className="booking_r_item booking_r_item_small">
      <div className="item_label"><FormattedMessage id={'Booking.Common.Booking Fee'} defaultMessage={'Booking Fee'} /></div>
      <div className="item_txt">
        <FormattedMessage
          id={'Common.Currencies.'+currency}
          defaultMessage={`{num} `+ currency}
          values={{num: commaize(0)}}
          />
      </div>
    </div>
    <div className="booking_r_item booking_r_item_small">
      <div className="item_label"><FormattedMessage id={'Booking.Common.Tax'} defaultMessage={'Tax'} /></div>
      <div className="item_txt">
        <FormattedMessage
          id={'Common.Currencies.'+currency}
          defaultMessage={`{num} `+ currency}
          values={{num: commaize(0)}}
          />
      </div>
    </div>
    {/*<div className="booking_r_item booking_r_item_small">
      <div className="item_label"><FormattedMessage id={'Booking.Common.Promo Discount'} defaultMessage={'Promo Discount'} /></div>
      <div className="item_txt">-
        <FormattedMessage
          id={'Common.Currencies.'+currency}
          defaultMessage={`{num} `+ currency}
          values={{num: commaize(getCurrencyPrice(this._getTotalPrice(true),currency))}}
          />
      </div>
    </div>*/}

    <div className="booking_r_item">
      <div className="item_label"><FormattedMessage id={'Booking.Common.Total Price'} defaultMessage={'Total Price'} /></div>
      <div className="item_txt">
      <FormattedMessage
        id={'Common.Currencies.'+currency}
        defaultMessage={`{num} `+ currency}
        values={{num: commaize(getCurrencyPrice(this._getTotalPrice(),currency))}}
        />
      </div>
    </div></div>)
  }
  /**
   * 费用说没
   */
  _renderCondition (){
    const { data} = this.state;
    return (<div className="booking_r_footer">
      <h4><FormattedMessage id={'Booking.Common.Price Condition'} defaultMessage={'Price Condition'} /></h4>
      {
        data.priceType ==='费用全包' && (<div>
          <div className="inclusive"><FormattedMessage id={'Booking.Common.All inclusive'} defaultMessage={'All inclusive'} /></div>
          <p><FormattedMessage id={'Booking.Common.p1'} defaultMessage={'Transportation fares, meals, and admission fees are included. (Note that alcohol is excluded)'} /></p>
          </div>)
      }
      {
        data.priceType ==='不含餐饮费用' && (<div>
          <div className="inclusive"><FormattedMessage id={'Booking.Common.Food excluded'} defaultMessage={'Food excluded'} /></div>
          <p><FormattedMessage id={'Booking.Common.p2'} defaultMessage={'Transportation fares and admission fees are included. (Note that  meals, alcohol is excluded)'} /></p>
          </div>)
      }
      {
        data.priceType ==='不含交通餐饮门票费用' && (<div>
          <div className="inclusive"><FormattedMessage id={'Booking.Common.All excluded'} defaultMessage={'Food, Transportation, Admission fee excluded'} /></div>
          <p><FormattedMessage id={'Booking.Common.p3'} defaultMessage={'The price you set is only for your guiding fee. All other expenses, occur during a trip, will be paid by travelers, themselves.'} /></p>
          </div>)
      }

    </div>)
  }
  render() {
    const {isLogin,currency,userStatView} = this.props
    const { current,startDate,guestNum,data} = this.state;
    const fristPhoto = data.photo && data.photo.filter(item => item.default === 1) || []
    return (
      <div className="booking_wrap">

        <div className="max_width booking_header">
          <Steps current={current-1}>
            {steps.map(item => <Step key={item.title} title={item.title} />)}
          </Steps>
        </div>
        <div className="max_width booking_main flex">
          <div className="booking_main_l">
            <Form>
              {current===1 && this._renderStep1()}
              {current===2 && this._renderStep2()}
              {current===3 && this._renderStep3()}
              {current===4 && this._renderStep4()}
            </Form>
          </div>
          <div className="booking_main_r">
            <div className="booking_main_r_wrap">
            <div className="booking_r_header">
              <div className="item_image ">
              {
                fristPhoto[0] && fristPhoto[0].url && <img src={fristPhoto[0].url+'?imageView2/3/w/640'} />
              }
                  <div className="item_image_bar flex">
                  <div className='item_rate'>
                    <div className="item_address">
                        <Icon type="location" />{data.destination}
                    </div>
                    <Rate allowHalf defaultValue={5} disabled/>
                  </div>
                  <div  className={data.basePrice && data.basePrice>0 && 'item_person_price item_person_price_base' || 'item_person_price'}>
                    <FormattedMessage
                      id={'Common.Currencies.'+currency}
                      defaultMessage={`{num} `+ currency}
                      values={{num: commaizeInt(getCurrencyPrice(getDisplayPrice(data.priceInfo,data.basePrice,guestNum),currency))}}
                      />
                      <br/>
                    <span>per person </span>
                  </div>
                </div>
              </div>
              <div className="item_title">
                <h3>{data.tourTitle} </h3>
                <div className="item_price">
                  {/*<span className="item_price1">$2000</span>
                  <span className="item_price2">50%OFF </span>*/}
                </div>
              </div>
            </div>
            <div className="booking_r_body">
              <div className="booking_r_item">
                <div className="item_label"><FormattedMessage id={'Booking.Common.Trip Date'} defaultMessage={'Trip Date'} /></div>
                <div className="item_txt">
                  {/*moment(startDate).format("MMMM Do YYYY")*/}
                  {startDate && <FormattedDate value={startDate} year='numeric'month='long'day='2-digit'/>}
                </div>
              </div>
              <div className="booking_r_item">
                <div className="item_label"><FormattedMessage id={'Booking.Common.Guest Amount'} defaultMessage={'Guest Amount'} /></div>
                <div className="item_txt">{guestNum} <FormattedMessage id={'Booking.Common.People'} defaultMessage={'People'} /></div>
              </div>
              {this._renderCurrencies()}
            </div>
            {this._renderCondition()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
function select(store){
  return {
    currency: store.Common.currency,
    isLogin: store.User.isLogin,
    userData: store.User.userData,
    userStatView: store.User.userStatView,
    bookNew: store.Booking,
  }
}
Booking = Form.create()(Booking);
Booking.propTypes = {
  intl: intlShape.isRequired
}
Booking = injectIntl(Booking)
Booking = connect(select)(Booking)
module.exports = Booking
