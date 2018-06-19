import React , {PropTypes }from 'react';
import { connect } from 'react-redux'
import { Icon,Rate,Button,Select,Spin,Modal,Input,Tabs,notification,Breadcrumb,message} from 'antd';
import { Link,browserHistory } from 'react-router'
import Lightbox from 'react-image-lightbox'
import Helmet from "react-helmet"
import Affix from 'components/Affix'
//import testdata from './testdata' // 测试数据
import {getLS,saveLS,trackPageview,trackEvent} from 'actions/common'
import {_getGrouptour,_getUser,_postNotification,_getReviewTour,_postFavorite,_deleteFavorite,_postAliapy} from 'api/'
import Calendar from 'components/Calendar'
import Share from 'components/Share'
import { FormattedMessage,FormattedDate,injectIntl,intlShape } from 'react-intl'
import moment from 'moment'
import {openLogin,forceLogin} from 'actions/User'
import {maximumNumber,replaceCon,getDisplayPrice,getCurrencyPrice,getMinimumPrice,isMobile} from 'utils/'
import {config} from 'utils/config'
import {getReviewsNum,getReviewsData} from 'utils/reviews'
const Option = Select.Option
const TabPane = Tabs.TabPane
let _setTimeout = null
import './index.scss'
class TripDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      isLoading: true,
      data: {},
      hostedData: {},  // 发布人
      affixDisabled:window.document.body.offsetHeight<680 || window.document.body.offsetWidth<768,
      guestNum: 1,
      photoIndex: 0,
      startDate:null,
      isOpenLightbox: false, //打开图片浏览
      sendMessageM: false,
      sendMessageData: '',
      setTimeout:null,
      reviewData:[], //评论
      reviewDataNum: 0,
      favorite: false,
    }
  }
  componentWillMount () {
    const {location,params } = this.props
    // console.log(isMobile())
    this.setState({
      isLoading: true,
      data: {},
      hostedData: {},
    },()=>{
      this.getGrouptour(params.slug)
    })
  }
  componentDidMount () {
    /**
     * 未登录需要登录
     */
    const {userData} = this.props
    if (!userData || !userData.token) {
      if (isMobile()) {
        this._forceLogin(false,15000)
      }else{
        this._forceLogin(true,30000)
      }
      //this._forceLogin(false,3000)
    }

    // _postAliapy(1720,804).then((res)=>{
    //   console.log('12323')
    //   console.log(res)
    // })

  }
  componentWillUnmount (){
    const {userData,dispatch} = this.props
    if (!userData || !userData.token) {
      clearTimeout(_setTimeout)
      dispatch(openLogin(false))
      dispatch(forceLogin(false))
    }
  }
  /**
   * 强制登录
   */
  _forceLogin (type=false,time) {
    const {userData,dispatch,openLoginD,openSignupD} = this.props
    clearTimeout(_setTimeout)
    if (userData && userData.token) {
      return false
    }
    // if (openLoginD || openLoginD) {
    //   return false
    // }
    _setTimeout = setTimeout(()=>{
      // dispatch(openLogin(true))
      // dispatch(forceLogin(type))
      console.log('ccc',!openLoginD ,!openSignupD)
      if (!openLoginD && !openSignupD) {
        dispatch(openLogin(true))
        dispatch(forceLogin(type))
      }

      !type && this._forceLogin(false,time)
    }, time)
  }
  /**
   * 根据grouptourId返回旅程详情
   * @param  {[type]} grouptourId [description]
   * @return {[type]}          [description]
   */
  getGrouptour(grouptourId){
		_getGrouptour(grouptourId).then((res)=>{
      this.setState({
        data: res
      },()=>{
        /**
         * 最低价格的人数 最合算的算法
         * @type {[type]}
         */
        this.setState({
          guestNum:getMinimumPrice(res.priceInfo,res.basePrice,true)
        })
        this.getUser(res.authorId)
      })
		})
    _getReviewTour(grouptourId).then((res)=>{
      // console.log(res)
      this.setState({
        reviewData: Array.from(res.data, (item)=>{
          return {
            ...item,
            evaluatorAvatar: item.evaluatorAvatar || 'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1488555813_9gd4y_1w7r3'
          }
        }),
        reviewDataNum: res.headers['x-page-total']
      })
    })
  }
  getUser(authorId) {
    _getUser(authorId).then((res)=>{
      this.setState({
        hostedData: res,
        isLoading:false,
        sendMessageM: false,
      })
		})
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
  /**
   * 渲染语言 有多个的情况
   */
  _Language (value){
    if (!value) {
      return null
    }
    let language = value.split(",")
    let newLanguage = []
    language.map((item,index)=>{
      newLanguage.push(<FormattedMessage id={'Common.Language.'+item} defaultMessage={item} />)
      if (index!==language.length-1) {
       newLanguage.push(<em>,</em>)
      }
    })
    return newLanguage
  }
  /**
   * Send a message
   */
  renderMessage () {
    const {sendMessageM,hostedData,data,startDate,guestNum,sendMessageData} = this.state
    const {userData,intl} = this.props
    const newstartDate = startDate && moment(startDate).format("MMMM Do YYYY") || moment().format("MMMM Do YYYY")
    //const placeholder= 'Hi '+hostedData.nickname+' , I’m interested in your trip on '+newstartDate+' with '+guestNum+' guest(s).'

    const placeholder = intl.formatMessage({id:"Booking.placeholder", defaultMessage: 'Hi {nickname}, I’m interested in your trip on {newstartDate} with {guestNum} guest(s).'},{nickname:hostedData.nickname,newstartDate:newstartDate,guestNum:guestNum})

    const postDate=  startDate && moment(startDate).unix()*1000 ||  moment().unix()*1000
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
      <Modal title={'To' + hostedData.nickname}
          visible={sendMessageM}
          className="inquiry_wrap_modal"
          onCancel={()=>{
            this.setState({
              sendMessageM: false
            })
          }}
          footer={[
            <Button key="submit" type="primary" size="large" onClick={()=>{
              _postNotification(postMessage).then((res)=>{
                console.log(res)
                this.setState({
                  sendMessageM: false
                },()=>{
                  trackEvent('用户行为','inquiry','success')
                  notification.success({
                   message: '成功',
                   description: '发送成功，里手将在24小时内给您回复，请耐心等待。绑定邮箱可以收到离线消息提示噢〜',
                 })
                })
              })
            }}>
              Send
            </Button>,
          ]}
        >
          <div className="inquiry_wrap">
            <div className="inquiry_heard">
            <FormattedMessage id={'TripDetail.Main.ModalTips'} defaultMessage={'It is recommended that booking this tour after confirming with Local Expert.'} />

            </div>
            <div className="inquiry_body">
              <div className="inquiry_choose clearafter">
                <div className="book_box_item flex">
                  <div className="book_coins_label">
                    <Icon type="calendar" />
                  </div>
                  <div className="book_people_select">
                    <Calendar type={'input'}
                      value={startDate}
                      operationWeek={data.operationWeek}
                      onSelect={(date)=>{
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
                      value={this.state.guestNum}
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
                            <Option value={item} key={index}>{item}</Option>
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
          </div>
        </Modal>
    )
  }
  /**
   * 灯箱
   */
  renderLightbox () {
    const {data,photoIndex,isOpenLightbox} =this.state
    const images =data.photo && Array.from(data.photo, (item,index) => {
      return item.url+'?imageView2/3/format/jpg'
    })
    const imageCaption =data.photo && Array.from(data.photo, (item,index) => {
      return item.description
    })
    if (isOpenLightbox) {
      return (
        <Lightbox
            mainSrc={images[photoIndex]}
            imageCaption={imageCaption[photoIndex]}
            nextSrc={images[(photoIndex + 1) % images.length]}
            prevSrc={images[(photoIndex + images.length - 1) % images.length]}
            onCloseRequest={() => this.setState({ isOpenLightbox: false })}
            onMovePrevRequest={() => this.setState({
                photoIndex: (photoIndex + images.length - 1) % images.length,
            })}
            onMoveNextRequest={() => this.setState({
                photoIndex: (photoIndex + 1) % images.length,
            })}
        />
      )
    }
  }
  /**
   * book new下单
   */
  async _bookNew () {
    const { dispatch} =this.props
    var bookNew = {
      startDate: this.state.startDate,
      guestNum: this.state.guestNum,
      data: this.state.data,
      hostedData: this.state.hostedData
    }
    saveLS('bookNew',bookNew)
    await dispatch({
        type: 'SET_BOOK_DATA',
        data: bookNew
    })
    browserHistory.push('/booking/new/?step=1')
  }
  /**
   * 渲染图片
   */
  _renderPhono (){
    const {data} =this.state
    return (  <div className="trip_detail_picbox clearafter">
        {
          data.photo && data.photo.sort((a,b)=>{ return a.sort - b.sort}).slice(0,5).map((item,index) => {
            return (
              <div className={"trip_detail_pic_item trip_detail_pic_item_"+index} key={index}>
                <div className="trip_detail_pic_js" onClick={()=>{
                    this.setState({
                      isOpenLightbox: true,
                      photoIndex: index,
                    })
                    trackEvent('用户行为','tripDetail/photo','click')
                  }}>
                  <img src={item.url+'?imageView2/3/w/640/format/jpg'} />
                  <div className="trip_detail_pic_see">
                   <FormattedMessage id={'TripDetail.Main.Seeallphotos'} defaultMessage={'See all '+`{num}` +' photos'} values={{num:data.photo.length}} />
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>)
  }
  /**
   * Overview 渲染
   */
  _renderOverview () {
    const {currency} = this.props
    const {data,hostedData,guestNum,reviewDataNum} =this.state
    const avatarUrl = hostedData.avatarUrl || '/static/images/usericon_120.png'
    const divStyle = {
      backgroundImage: 'url(' + avatarUrl + '?imageView2/1/w/240/h/240)'
    };
    const fristPhoto = data.photo && data.photo.filter(item => item.default === 1) || []
    //const ReviewsNum = getReviewsNum(data.id)
    const ReviewsNum = parseInt(getReviewsNum(data.id)) + parseInt(reviewDataNum)
    return (
      <div>
      <h1>{data.tourTitle}</h1>
      <div className="flex trip_rate_box">
          <div className="trip_rate">
              <Rate allowHalf defaultValue={5} disabled/>
              {ReviewsNum>0 && (<span className="trip_rate_reviews">（{ReviewsNum} Reviews）</span>)}
          </div>
          <div className="trip_address">
              <Icon type="location" />
              {this._Destination(data.destination)}
          </div>
      </div>
      <div className="trip_detail_item trip_detail_item_four">
        <ul className="clearafter">
          <li>
            <Icon type="time" />
            <FormattedMessage id={'TripDetail.Main.Hours'} defaultMessage={`{num}` +'Hours'} values={{num:data.tourSpan}} />
          </li>
          <li>
            <Icon type="people" />
            {
              data.maximumNumber ===1 && (<FormattedMessage id={'TripDetail.Main.Person'} defaultMessage={`{num}` +'Persons'} values={{num:1}} />) || (<FormattedMessage id={'TripDetail.Main.Persons'} defaultMessage={`{num1}`+'-'+`{num2}` +'Persons'} values={{num1:1,num2:data.maximumNumber}} />)
            }
          </li>
          <li className="Language">
            <Icon type="Language" />
          {this._Language(data.language)}
          </li>
          <li>
            <Icon type="Trans" />
            {
              data.transportation &&  <FormattedMessage id={'Transportation.'+data.transportation} defaultMessage={data.transportation} />
            }
          </li>
          {/*<li className="none_border">
            <Icon type="environment" />
            Nature Scenery
          </li>*/}
        </ul>
      </div>
      <div className="trip_detail_item">
        <p className="title"><FormattedMessage id={'TripDetail.Main.Why this trip?'} defaultMessage='Why this trip?' /></p>
        <p className="con" dangerouslySetInnerHTML={{__html:replaceCon(data.willPlayReason)}}></p>
      </div>
      {
        hostedData.nickname && (
          <div className="trip_detail_item">
            <p className="title"><FormattedMessage id={'TripDetail.Main.Hosted by'} defaultMessage='Hosted by' /></p>
            <p className="hosted_avatar">
              <Link className="avatar_big_a" to={'/local-expert/'+data.authorId}><div className="avatar_big" style={divStyle} ></div></Link>
              <h1 className="avatar_name"><Link to={'/local-expert/'+data.authorId}>{hostedData.nickname}</Link></h1>
            </p>
            <p className="con" dangerouslySetInnerHTML={{__html:replaceCon(hostedData.aboutYourself)}}></p>
          </div>
        )
      }
      </div>
    )
  }
  /**
   * 渲染 itinerary
   * 按照title 时间排序
   */
  _renderItinerary () {
    const {data} =this.state
    return(<div className="trip_detail_item trip_detail_item_nb">
      <p className="title">{<FormattedMessage id="TripDetail.Main.Itinerary" defaultMessage="Itinerary" />}</p>
      {
        data.itinerary && data.itinerary.sort((a,b)=>{ return moment(a.title, "hh-mm").unix() - moment(b.title, "hh-mm").unix()}).map((item,index) => {
            return (
              <div className="itinerary_item flex" key={index}>
                <div className="itinerary_item_title">
                  {item.title}
                </div>
                    {
                      index===0 && (<div className="itinerary_item_description">{item.description}<br />-{data.meetingPlace}</div>)
                    }

                    {
                      index!==0 && (<div className="itinerary_item_description" dangerouslySetInnerHTML={{__html:replaceCon(item.description)}}></div>)
                    }
              </div>
            )
        })
      }
    </div>)
  }
  /**
   * 渲染评论
   */
  _renderReviews () {
    const {data,reviewData,reviewDataNum} =this.state
    const ReviewsData = getReviewsData(data.id)
    const ReviewsNum = parseInt(getReviewsNum(data.id)) + parseInt(reviewDataNum)
    return (<div>
      <div className="reviews_bar">
        <div className="reviews_bar_main max_width">
          <FormattedMessage id={'TripDetail.Main.Reviews'} defaultMessage='Reviews' />
          {ReviewsNum>0 && (<span className="trip_rate_reviews">（{ReviewsNum} Reviews）</span>)}
        </div>
      </div>
      <div className="max_width reviews_wrap">
      {
        ReviewsData.length ===0 && reviewData.length === 0 && (
        <div className="reviews_empty">
          <div className="reviews_empty_icon"></div>
          <p><FormattedMessage id={'TripDetail.Main.ReviewsEmpty'} defaultMessage='Be the first one who give Thammaporn' /></p>
        </div>)
      }
        {
          ReviewsData.map((item,index)=>{
            return(
              <div className="reviews_item" key={index}>
                <div className="reviews_item_avatar">
                  <div><img src={`http://7xq8kr.com1.z0.glb.clouddn.com/`+ item.avatar_url+`?imageView2/1/w/240/h/240`} /></div>
                  <span>{item.name}</span>
                </div>
                <div className="reviews_item_con">
                  <p dangerouslySetInnerHTML={{ __html: item.content }} />
                  <div className="reviews_item_con_bottom">
                    <Rate allowHalf defaultValue={item.rate} disabled/>
                    <FormattedDate value={item.create_at} year='numeric' month='short'day='2-digit'/>
                  </div>
                </div>
              </div>
            )
          })
        }
        {
          reviewData.map((item,index)=>{
            return(
              <div className="reviews_item" key={index}>
                <div className="reviews_item_avatar">
                  <div><img src={item.evaluatorAvatar+`?imageView2/1/w/240/h/240`} /></div>
                  <span>{item.evaluatorNick}</span>
                </div>
                <div className="reviews_item_con">
                  <p dangerouslySetInnerHTML={{ __html: item.review.experience }} />
                  <div className="reviews_item_con_bottom">
                    <Rate allowHalf defaultValue={item.review.ratingOfTrip || item.review.ratingForPeople} disabled/>
                    <FormattedDate value={item.review.createAt} year='numeric' month='short'day='2-digit'/>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
      </div>)
  }
  /**
   * Detail x
   */
  _renderDetail () {
    const {data} =this.state
    return (<div>{
      data.travelToPrepare && (
        <div className="trip_detail_item">
          <p className="title"><FormattedMessage id={'TripDetail.Main.Trip conditions'} defaultMessage='Trip conditions' /></p>
          <p className="con" dangerouslySetInnerHTML={{__html:replaceCon(data.travelToPrepare)}}></p>
        </div>
      )
    }
    <div className="trip_detail_item">
      <p className="title"><FormattedMessage id={'TripDetail.Main.Price condition'} defaultMessage='Price condition' /></p>
      <p className="price_included_item">
        <Icon type="trans" className={ data.priceType !=='不含交通餐饮门票费用' && 'price_included_active'}/>
        { data.priceType !=='不含交通餐饮门票费用' && <FormattedMessage id={'TripDetail.Main.Transportation fares are included.'} defaultMessage='Transportation fares are included.' /> || <FormattedMessage id={'TripDetail.Main.Transportation fares are excluded.'} defaultMessage='Transportation fares are excluded.' />}

      </p>
      <p className="price_included_item">
        <Icon type="ticket" className={data.priceType !=='不含交通餐饮门票费用' && 'price_included_active'}/>
        {data.priceType !=='不含交通餐饮门票费用' && <FormattedMessage id={'TripDetail.Main.Admission fees are included.'} defaultMessage='Admission fees are included.' /> || <FormattedMessage id={'TripDetail.Main.Admission fees are excluded.'} defaultMessage='Admission fees are excluded.' />}
      </p>
      <p className="price_included_item">
        <Icon type="food" className={data.priceType ==='费用全包' && 'price_included_active'}/>
        {data.priceType ==='费用全包' && <FormattedMessage id={'TripDetail.Main.Meals are included.'} defaultMessage='Meals are included.' /> || <FormattedMessage id={'TripDetail.Main.Meals are excluded.'} defaultMessage='Meals are excluded.' />}
      </p>

      {data.extraPayInfo && (<div className="price_included_item">
        <div className="extraPayInfo"><FormattedMessage id={'TripDetail.Main.Other expenses not included.'} defaultMessage='Other expenses not included:' /></div>
        <p className="con" dangerouslySetInnerHTML={{__html:replaceCon(data.extraPayInfo)}}></p>
      </div>)}
    </div>

    <div className="trip_detail_item">
      <p className="title"><FormattedMessage id={'TripDetail.Main.Meeting point'} defaultMessage='Meeting point' /></p>
      <p className="meeting_point_top">
        <Icon type="meet_up" />
        <span>Meet up at our meeting point<br />
        -{data.meetingPlace}</span>
      </p>
      <div id="Gmap" className="google_map">

      </div>
    </div>
    <div className="trip_detail_item">
      <p className="title"><FormattedMessage id={'TripDetail.Main.Cancellation policy'} defaultMessage='Cancellation policy' /></p>
      <p><FormattedMessage id={'TripDetail.Main.Cancellation policy P1'} defaultMessage='Full refund 48 hours  prior to starting time' /></p>
<p><FormattedMessage id={'TripDetail.Main.Cancellation policy P2'} defaultMessage='50% refund 24 hours prior to starting time' /></p>
<p><FormattedMessage id={'TripDetail.Main.Cancellation policy P3'} defaultMessage='no refund within 24 hours of starting time' /></p>
      {/*<Link>See cancellation policy.</Link>*/}
    </div></div>)
  }
  _renderMessageMoblie (){
    const {currency,isLogin,dispatch} = this.props
    const {data,guestNum} =this.state
    return (
      <div className="book_box_moblie">
        <div className="flex">
        <div className="book_box_txt">
        {/*<FormattedMessage
          id={'Common.Currencies.'+currency}
          defaultMessage={`{num} `+ currency}
          values={{num: getCurrencyPrice(getDisplayPrice(data.priceInfo,data.basePrice,guestNum,true),currency)}}
          />*/}
          {
            (data.priceInfo && data.priceInfo.length>0) &&
            (<span className="price">{getCurrencyPrice(getDisplayPrice(data.priceInfo,data.basePrice,guestNum,true),currency)}<FormattedMessage id={'Common.CurrenciesPersonPriceInfo.'+currency} defaultMessage={currency+'  SP'}/></span>)
            || (<span className="price">{getCurrencyPrice(getDisplayPrice(data.priceInfo,data.basePrice,guestNum,true),currency)}<FormattedMessage id={'Common.CurrenciesPersonBasePrice.'+currency} defaultMessage={currency+'  PP'}/></span>)
          }
        </div>
          <div className="book_box_bnt flex">
            <Button type="ghost" disabled={data.tourStatus!==2} onClick={()=>{
              if (!isLogin) {
                dispatch(openLogin(true))
              }else {
                trackPageview('/inquiry')
                trackEvent('用户行为','inquiry','click')
                this.setState({
                  sendMessageM: true
                })
              }
            }}>
              <FormattedMessage id="TripDetail.Main.Send a message" defaultMessage="Send a message" />
            </Button>
            <Button type="next" disabled={data.tourStatus!==2} onClick={()=>{
                trackEvent('用户行为','booking','click')
                this._bookNew()
              }}>
              <FormattedMessage id="TripDetail.Main.Book" defaultMessage="Book" />
            </Button>
          </div>
        </div>
      </div>
    )
  }
  _getFristPhoto (items) {
    if (!items || (items && !items[0]) ) {
      return false
    }
    const fristPhoto =  items.filter(item => item.default === 1)
    return (fristPhoto[0] && fristPhoto[0].photoUrl || items[0].photoUrl )|| (fristPhoto[0] && fristPhoto[0].url || items[0].url )
  }
  _getFristPhotoId (items) {
    if (!items || (items && !items[0]) ) {
      return false
    }
    const fristPhoto = items.filter(item => item.default === 1)
    return (fristPhoto[0] && fristPhoto[0].sort || items[0].sort )|| (fristPhoto[0] && fristPhoto[0].sort || items[0].sort )
  }
  _renderBreadcrumb (){
    const {data} = this.state
    if (!data.destination) {
      return
    }
    const {filterData,results} = this.props
  //  let item = <Breadcrumb.Item><Link to='/search/Any'>{this._Destination(data.destination)}</Link></Breadcrumb.Item>
    const destination = data.destination.split(",")
    let newDestination = []
    destination.map((item,index)=>{
      newDestination.push(<Link to={'/search/'+item}><FormattedMessage id={'Destination.'+item} defaultMessage={item} /></Link>)
      if (index!==destination.length-1) {
       newDestination.push(<span>,</span>)
      }
    })
    let item = <Breadcrumb.Item>{newDestination}</Breadcrumb.Item>
    if (results && results.searchUri && filterData && filterData.destination) {
      item = <Breadcrumb.Item><Link onClick={()=>browserHistory.goBack()}><FormattedMessage id={'Destination.'+filterData.destination} defaultMessage={filterData.destination} /></Link></Breadcrumb.Item>
    }
    // onClick={()=>browserHistory.goBack()}
    // to={'/search/'+filterData.destination+results.searchUri}
    return (
      <Breadcrumb>
        <Breadcrumb.Item><Link to='/'><FormattedMessage id={'Destination.Home'} defaultMessage={'Home'} /></Link></Breadcrumb.Item>
        {item}
        <Breadcrumb.Item className="text">{data.tourTitle}</Breadcrumb.Item>
      </Breadcrumb>
    )
  }
  favorite (type) {
    const {data} =this.state
    const {userData} = this.props
    if (!type) {
      _postFavorite(data.id,userData.userId).then((res)=>{
        if (res.code===200) {
          message.success('成功收藏')
        }
      })
    }else{
      _deleteFavorite(data.id,userData.userId).then((res)=>{
        if (res.code===200) {
          message.success('成功取消收藏')
        }
      })
    }
    this.setState({
      favorite: !type
    })
  }
  render() {
    const {currency,isLogin,dispatch,locale} = this.props
    const {data,hostedData,guestNum,startDate,affixDisabled,favorite} =this.state
    const avatarUrl = hostedData.avatarUrl || '/static/images/usericon_120.png'
    const divStyle = {
      backgroundImage: 'url(' + avatarUrl + ')'
    };
    // const fristPhoto = data.photo && data.photo.filter(item => item.default === 1) || []
    const fristPhoto = this._getFristPhoto(data.photo)
    return (
      <Spin tip="Loading..." spinning={false}>
      <div className="trip_detail">
        <Helmet
          title={data.tourTitle && data.tourTitle}
          titleTemplate={'%s-'+config.title[locale]}
        />
        <div className="trip_detail_top" onClick={()=>{
              this.setState({
                isOpenLightbox: true,
                photoIndex: this._getFristPhotoId(data.photo),
              })
          }}>
          {
            fristPhoto && <img src={fristPhoto+'?imageView2/3/format/jpg'} />
          }
          <div className="item_image_bar flex">
            <div className='item_rate'>
              <div className="item_address">
                  <Icon type="location" />{this._Destination(data.destination)}
              </div>
              <Rate allowHalf defaultValue={5} disabled/>
            </div>
            <div className={data.basePrice && data.basePrice>0 && 'item_person_price item_person_price_base' || 'item_person_price'}>
            {/*<FormattedMessage
              id={'Common.Currencies.'+currency}
              defaultMessage={`{num} `+ currency}
              values={{num: getCurrencyPrice(getDisplayPrice(data.priceInfo,data.basePrice,guestNum,true),currency)}}
              />*/}
              {
                (data.priceInfo && data.priceInfo.length>0) &&
                (<span className="price">{getCurrencyPrice(getDisplayPrice(data.priceInfo,data.basePrice,guestNum,true),currency)}<FormattedMessage id={'Common.CurrenciesPersonPriceInfo.'+currency} defaultMessage={currency+'  SP'}/></span>)
                || (<span className="price">{getCurrencyPrice(getDisplayPrice(data.priceInfo,data.basePrice,guestNum,true),currency)}<FormattedMessage id={'Common.CurrenciesPersonBasePrice.'+currency} defaultMessage={currency+'  PP'}/></span>)
              }
            </div>
          </div>
        </div>
        <div className="trip_detail_share">
          <div className="max_width960 flex">
          {this._renderBreadcrumb()}
          <Share
            sites = {config.share[locale]}
            favorite = {favorite}
            onFavorite={(type)=>{
              this.favorite(type)
            }}
            url = {location.href}
            title = {data.tourTitle+'－'+ config.share[locale]}
            wechatQrcodeTitle={<FormattedMessage id="Common.Share.wechatQrcodeTitle" defaultMessage="微信扫一扫：分享" />}
            wechatQrcodeHelper={<FormattedMessage id="Common.Share.wechatQrcodeHelper" defaultMessage="微信里点“发现”，扫一下,二维码便可将本文分享至朋友圈。" />}
            image= { fristPhoto && fristPhoto}
            description = {data.tourTitle}
            />
          </div>
        </div>
        <Tabs defaultActiveKey="1"  className="trip_detail_main_mobile">
          <TabPane tab={<FormattedMessage id="TripDetail.Tabs.Overview" defaultMessage="Overview" />} key="1" className="trip_detail_main_l">{this._renderOverview()}{this._renderPhono()}</TabPane>
          <TabPane tab={<FormattedMessage id="TripDetail.Tabs.Detail" defaultMessage="Detail" />} key="2" className="trip_detail_main_l">{this._renderItinerary()}  {this._renderDetail()}</TabPane>
          <TabPane tab={<FormattedMessage id="TripDetail.Tabs.Reviews" defaultMessage="Reviews" />} key="3">{this._renderReviews()}</TabPane>
        </Tabs>
        <div className="trip_detail_main flex max_width960 ">
          <div className="trip_detail_main_l" >
            <div className="trip_detail_container" >
              {this._renderOverview() }
              {this._renderItinerary()}
              {this._renderPhono() }
              {this._renderDetail()}
            </div>
          </div>
          <div className="trip_detail_main_r"  ref={(node) => { this.container = node; }}>
          <Affix
          disabled={affixDisabled}
          offsetTop={68}
          targetWrap={() => {
            if (this.container) {
              return this.container
            }
            return window
          }}
          >
              <div className="book_box">
              {
                data && data.operationWeek && (<Calendar
                  value={startDate}
                  operationWeek={data.operationWeek}
                  availableDay={hostedData.availableDay || ''}
                  busyDay={hostedData.busyDay || ''}
                  onSelect= {(date)=>{
                    this.setState({
                      startDate:date
                    })
                  }}
                  />)
              }
              <div className="book_box_item flex">
                <div className="book_coins_label">
                  <Icon type="no_people" />
                  Guest(s)
                </div>
                <div className="book_people_select">
                  <Select
                    className="item_select"
                    dropdownClassName="item_select_dropdown"
                    value={this.state.guestNum}
                    onChange={(e)=>{
                      this.setState({
                        guestNum: e
                      })
                    }}
                    style={{ width: 140 }}>
                    {
                      maximumNumber.slice(0,data.maximumNumber).map((item,index) => {
                        return (
                          <Option value={item} key={index}>{item}</Option>
                        )
                      })
                    }
                  </Select>
                </div>
              </div>
              <div className="book_box_item flex">
                <div className="book_coins_label">
                  <Icon type="Coin" />
                  <FormattedMessage id="TripDetail.Main.Price per person" defaultMessage="Price per person" />
                </div>
                <div className="book_coins">
                {
                  (data.priceInfo && data.priceInfo.length>0) &&
                  (<span className="price">{getCurrencyPrice(getDisplayPrice(data.priceInfo,data.basePrice,guestNum,true),currency)}<FormattedMessage id={'Common.CurrenciesPersonPriceInfo.'+currency} defaultMessage={currency+'  SP'}/></span>)
                  || (<span className="price">{getCurrencyPrice(getDisplayPrice(data.priceInfo,data.basePrice,guestNum,true),currency)}<FormattedMessage id={'Common.CurrenciesPersonBasePrice.'+currency} defaultMessage={currency+'  PP'}/></span>)
                }
                {/*<FormattedMessage
                  id={'Common.CurrenciesPerson.'+currency}
                  defaultMessage={`{num} `+ currency}
                  values={{num: getCurrencyPrice(getDisplayPrice(data.priceInfo,data.basePrice,guestNum,true),currency)}}
                  />*/}
                </div>
              </div>
              <div className="book_box_item flex">
                <div className="book_coins_label">
                  <Icon type="Coins" />
                  <FormattedMessage id="TripDetail.Main.Total price" defaultMessage="Total price" />
                </div>
                <div className="book_coins">
                <FormattedMessage
                  id={'Common.Currencies.'+currency}
                  defaultMessage={`{num} `+ currency}
                  values={{num: getCurrencyPrice(getDisplayPrice(data.priceInfo,data.basePrice,guestNum),currency)}}
                  />
                </div>
              </div>
              <div className="book_box_item book_bnt flex">
                <Button type={data.basePrice && data.basePrice>0 && "primary" || "next"} disabled={data.tourStatus!==2 && data.id!==607} onClick={()=>{
                    trackEvent('用户行为','booking','click')
                    this._bookNew()
                  }}>
                  <FormattedMessage id="TripDetail.Main.Book" defaultMessage="Book" />
                </Button>
                <Button type="ghost" disabled={data.tourStatus!==2} onClick={()=>{
                    if (!isLogin) {
                      dispatch(openLogin(true))
                    }else {
                      trackPageview('/inquiry')
                      trackEvent('用户行为','inquiry','click')
                      this.setState({
                        sendMessageM: true
                      })
                    }
                  }}>
                  <FormattedMessage id="TripDetail.Main.Send a message" defaultMessage="Send a message" />
                </Button>
              </div>
              </div>
              </Affix>
          </div>
        </div>
        {this._renderReviews()}
        {this.renderLightbox()}
        {this.renderMessage()}
        {this._renderMessageMoblie()}
      </div>
      </Spin>
    )
  }
}
function select(store){
  return {
    currency: store.Common.currency,
    isLogin: store.User.isLogin,
    userData: store.User.userData,
    locale: store.Common.locale,
    filterData: store.Search.filterData,
    results: store.Search.results,
    openLoginD : store.User.openLogin,
    openSignupD: store.User.openSignup,
  }
}
TripDetail.propTypes = {
  intl: intlShape.isRequired
}
TripDetail = injectIntl(TripDetail)
TripDetail = connect(select)(TripDetail)
module.exports = TripDetail;
