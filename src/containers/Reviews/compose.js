import React from 'react'
import { FormattedMessage, FormattedDate} from 'react-intl'
import { Button,Icon,Form,Tabs,Input,Radio,Rate,notification } from 'antd'
import DashboardHeader from 'components/Header/DashboardHeader'
import LeftBar from 'components/LeftBar'
import { connect } from 'react-redux'
import moment from 'moment'
import {getCurrencyPrice,getDisplayPrice,commaizeInt,getMinimumPrice} from 'utils/'
import styles from './index.scss'
import {_getOrder,_getUser,_getGrouptour,_postReview} from 'api'
const FormItem = Form.Item
const RadioGroup = Radio.Group
class ReviewsCompose extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      orderData: {}, // 订单信息
      tripData: {}, // 行程信息
      hostedData: {}, // 发布人信息
      guestNum: 1,
      isHosted: false,
      disabled: false,
    }
  }
  componentWillMount () {
    const {location,params } = this.props
    // 获取订单信息
    _getOrder(params.slug).then(res=>{
      if (res) {
        this.setState({
          orderData: res,
          isLoading: true,
        },()=>{
          this.getGrouptour(res.groupTourId)
        })
      }else{
        notification.error({
         message: '出错',
         description: '订单信息不存在噢',
       })
      }
    })
  }
  /**
   * 根据grouptourId返回旅程详情
   * @param  {[type]} grouptourId [description]
   * @return {[type]}          [description]
   */
  getGrouptour(grouptourId){
    const {userData} = this.props
		_getGrouptour(grouptourId).then((res)=>{
      this.setState({
        tripData: res
      },()=>{
        /**
         * 最低价格的人数 最合算的算法
         * @type {[type]}
         */
        this.setState({
          guestNum:getMinimumPrice(res.priceInfo,res.basePrice,true),
          isHosted: res.authorId === userData.userId
        })
        this.getUser(res.authorId)
      })
		})
  }
  getUser(authorId) {
    _getUser(authorId).then((res)=>{
      this.setState({
        hostedData: res,
        isLoading:false,
      })
		})
  }
  _postReviews (){
    const {dispatch,userData,form} = this.props
    const {orderData,tripData} = this.state
    form.validateFields((error, value) => {
      if (!error) {
        this.setState({
          disabled: true
        })
        value.groupTourId = orderData.groupTourId
        value.evaluatorId = userData.userId
        value.orderer = orderData.userId
        value.expertId = tripData.authorId
        value.orderId = orderData.orderId
        //value.contactOptional = value.contactOptional.toString()
        value.contactOptional = '1'
        value.createAt = moment().unix()*1000
        // console.log(value)
        _postReview(value).then((res)=>{
            this.setState({
              disabled: false
            })
            notification.success({
             message: '成功',
             description: '您已成功提交评价',
           })
        })
      }
    })
  }
  render() {
    const {getFieldDecorator} = this.props.form
    const {currency} = this.props
    const {tripData,guestNum,orderData,isHosted,disabled} = this.state
    const fristPhoto = tripData.photo && tripData.photo.filter(item => item.default === 1) || []
    // const guestNum = 1
    // const startDate = 1489911710000
    return (
      <div>
        <DashboardHeader />
        <div className="max_width flex reviews_compose_wrap">
          <div className="dashboard_left">
            <div className="booking_main_r_wrap">
            <div className="booking_r_header">
              <div className="item_image ">
              {
                fristPhoto[0] && fristPhoto[0].url && <img src={fristPhoto[0].url+'?imageView2/3/w/640'} />
              }
                  <div className="item_image_bar flex">
                  <div className='item_rate'>
                    <div className="item_address">
                      <Icon type="location" />{tripData.destination}
                    </div>
                    <Rate allowHalf defaultValue={5} disabled/>
                  </div>
                  <div  className={tripData.basePrice && tripData.basePrice>0 && 'item_person_price item_person_price_base' || 'item_person_price'}>
                    <FormattedMessage
                      id={'Common.Currencies.'+currency}
                      defaultMessage={`{num} `+ currency}
                      values={{num: commaizeInt(getCurrencyPrice(getDisplayPrice(tripData.priceInfo,tripData.basePrice,guestNum),currency))}}
                      />
                      <br/>
                    <span>per person </span>
                  </div>
                </div>
              </div>
              <div className="item_title">
                <h3>{tripData.tourTitle} </h3>
              </div>
            </div>
            <div className="booking_r_body">
              <div className="booking_r_item">
                <div className="item_label"><FormattedMessage id={'Booking.Common.Trip Date'} defaultMessage={'Trip Date'} /></div>
                <div className="item_txt">
                  {orderData.startDate && <FormattedDate value={orderData.startDate} year='numeric'month='long'day='2-digit'/>}
                </div>
              </div>
              <div className="booking_r_item">
                <div className="item_label"><FormattedMessage id={'Booking.Common.Guest Amount'} defaultMessage={'Guest Amount'} /></div>
                <div className="item_txt">{guestNum} <FormattedMessage id={'Booking.Common.People'} defaultMessage={'People'} /></div>
              </div>
            </div>
            </div>
          </div>
          <div className="dashboard_right dashboard_right2">
          <div className="compose_wrap">
            <div className="compose_wrap_header">
            <div className="inbox_chat_header">
              <h3>Review</h3>
              <p>Please share your experience with us. Your trip rating & review will be shown on the website.</p>
            </div>
            </div>
            <div className="compose_wrap_body">
          <Form>


          {
            !isHosted && (<div className="form_item">
              <div className="form_item_label"><FormattedMessage id={'Reviews.ratingOfTrip'} defaultMessage={'Rating for your trip'} /></div>
              <div className="form_item_input">
              <FormItem>
                {getFieldDecorator('ratingOfTrip',{
                  rules: [{
                    required: true
                  } ]})(
                   <Rate  allowHalf/>
                 )}
               </FormItem>
              </div>
            </div>)
          }
          <div className="form_item">
          {isHosted && (<div className="form_item_label"><FormattedMessage id={'Reviews.ratingForPeople1'} defaultMessage={'Rating for your guest'} /></div>) || (
            <div className="form_item_label"><FormattedMessage id={'Reviews.ratingForPeople'} defaultMessage={'Rating for Local Expert'} /></div>
          )}

            <div className="form_item_input">
            <FormItem>
              {getFieldDecorator('ratingForPeople',{
                rules: [{
                  required: true
                } ]})(
                 <Rate  allowHalf/>
               )}
             </FormItem>
            </div>
          </div>

          <div className="form_item">
           <div className="form_item_label"><FormattedMessage id={'Reviews.experience'} defaultMessage={'Please share a few words describing your experience of this trip'} /></div>
           <div className="form_item_input">
           <FormItem>
             {getFieldDecorator('experience',{
               rules: [{
                 required: true
               } ]})(
                <Input type="textarea"  rows={4} className="textarea_lg"/>
              )}
            </FormItem>
           </div>
          </div>

           <div className="form_item">
             <div className="form_item_label"><FormattedMessage id={'Reviews.feedback'} defaultMessage={'Private feedback to 55km team for improvement'} /></div>
             <div className="form_item_tips">
               <FormattedMessage id={'Reviews.public'} defaultMessage={'This part will not be public'} />
            </div>
             <div className="form_item_input">
             <FormItem>
               {getFieldDecorator('feedback',{
                 rules: [{
                   required: true
                 } ]})(
                  <Input type="textarea"  rows={4} className="textarea_lg"/>
                )}
              </FormItem>
             </div>
           </div>

           {/*<div className="form_item">
             <div className="form_item_label"><FormattedMessage id={'Reviews.contactOptional'} defaultMessage={'I allow 55km’s staff to contact me to understand more about the review (if any)'} /></div>
             <div className="form_item_radio">
               <FormItem>
               {getFieldDecorator('contactOptional',{
                 rules: [{
                   required: true
                 } ]})(
                 <RadioGroup>
                   <Radio value={1}><FormattedMessage id={'Reviews.Email'} defaultMessage={'Yes-Email please'} /></Radio>
                   <Radio value={2}><FormattedMessage id={'Reviews.Phone'} defaultMessage={'Yes-Phone or Email'} /></Radio>
                   <Radio value={0}><FormattedMessage id={'Reviews.thanks'} defaultMessage={'No-thanks'} /></Radio>
                 </RadioGroup>
                 )}
               </FormItem>
             </div>
           </div>*/}

           <div className="save_bnt">
             <Button type="next" className="save" disabled={disabled} onClick={()=>{
                 this._postReviews()
               }}><FormattedMessage id={'Reviews.Submit'} defaultMessage={'Submit'} /></Button>
            </div>

          </Form>
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
    currency: store.Common.currency,
    userData: store.User.userData
  }
}
ReviewsCompose = Form.create()(ReviewsCompose)
ReviewsCompose = connect(select)(ReviewsCompose)
module.exports = ReviewsCompose
