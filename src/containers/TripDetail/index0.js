import React , {PropTypes }from 'react';
import { connect } from 'react-redux'
import { Icon,Rate,Button,Select,Spin,Modal,Input,Tabs,notification,Breadcrumb } from 'antd';
import { Link,browserHistory } from 'react-router'
import Lightbox from 'react-image-lightbox'
import Helmet from "react-helmet"
import Affix from 'components/Affix'
//import testdata from './testdata' // 测试数据
import {getLS,saveLS,trackPageview,trackEvent} from 'actions/common'
import {_getGrouptour,_getUser,_postNotification} from 'api/'
import Calendar from 'components/Calendar'
import Share from 'components/Share'
import { FormattedMessage,FormattedDate } from 'react-intl'
import moment from 'moment'
import {openLogin,forceLogin} from 'actions/User'
import {maximumNumber,replaceCon,getDisplayPrice,getCurrencyPrice,getMinimumPrice} from 'utils/'
import {config} from 'utils/config'
import {getReviewsNum,getReviewsData} from 'utils/reviews'
const Option = Select.Option
const TabPane = Tabs.TabPane
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
    }
  }
  componentWillMount () {
    const {location,params } = this.props

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
    const {userData,dispatch} = this.props
    if (!userData || !userData.token) {
      clearTimeout(this.setState.setTimeout)
      this.setState({
        setTimeout: setTimeout(()=>{
            dispatch(openLogin(true))
          //  dispatch(forceLogin(true))
          },10000)
      })
    }
  }
  componentWillUnmount (){
    const {userData,dispatch} = this.props
    if (!userData || !userData.token) {
      clearTimeout(this.setState.setTimeout)
      dispatch(openLogin(false))
      // dispatch(forceLogin(false))
    }
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
    const {userData} = this.props
    const newstartDate = startDate && moment(startDate).format("MMMM Do YYYY") || moment().format("MMMM Do YYYY")
    const placeholder= 'Hi '+hostedData.nickname+' , I’m interested in your trip on '+newstartDate+' with '+guestNum+' guest(s).'
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
                    <Icon type="mail" />
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
    const {data,hostedData,guestNum} =this.state
    const avatarUrl = hostedData.avatarUrl || '/static/images/usericon_120.png'
    const divStyle = {
      backgroundImage: 'url(' + avatarUrl + '?imageView2/1/w/240/h/240)'
    };
    const fristPhoto = data.photo && data.photo.filter(item => item.default === 1) || []
    return (
      <div>
      <h1>{data.tourTitle}</h1>
      <div className="flex trip_rate_box">
          <div className="trip_rate">
              <Rate allowHalf defaultValue={5} disabled/>
              {getReviewsNum(data.id)}

              {data.id===436 && (<span className="trip_rate_reviews">（2 Reviews）</span>) || ((data.id===354 ||data.id===443|| data.id===210|| data.id===296) && (<span className="trip_rate_reviews">（1 Reviews）</span>) || (<span className="trip_rate_reviews"></span>))}

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
    const {data} =this.state
    return (<div>
      <div className="reviews_bar">
        <div className="reviews_bar_main max_width">
          <FormattedMessage id={'TripDetail.Main.Reviews'} defaultMessage='Reviews' />
          {data.id===436 && (<span className="trip_rate_reviews">（2 Reviews）</span>) || ((data.id===354||data.id===443|| data.id===210|| data.id===296) && (<span className="trip_rate_reviews">（1 Reviews）</span>) || (<span className="trip_rate_reviews"></span>))}

        </div>
      </div>
      <div className="max_width reviews_wrap">

        {
          data.id===436 && (
            <div>
            <div className="reviews_item">
              <div className="reviews_item_avatar">
                <div><img src="http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1487252665_77gcy_4uzea?imageView2/1/w/240/h/240" /></div>
                <span>Sunsah</span>
              </div>
              <div className="reviews_item_con">
                {/*<h3>You won’t disappointed</h3>*/}
                <p>感谢小西里手十分用心的陪伴，虽然现在人已经不在泰国境内了，可满脑子还是朱拉隆功大学校园的美丽和浓厚的学术氛围、大皇宫的金碧辉煌与雄伟壮阔，考山路的人声鼎沸与舒适。谢谢小西，谢谢55km，谢谢你们给我带来的体验。</p>
                <div className="reviews_item_con_bottom">
                  <Rate allowHalf defaultValue={5} disabled/>
                  <FormattedDate value={1487253201000} year='numeric' month='short'day='2-digit'/>
                </div>
              </div>
            </div>
            <div className="reviews_item">
              <div className="reviews_item_avatar">
                <div><img src="http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1486959763_kobr5_au1jv?imageView2/1/w/240/h/240" /></div>
                <span>Kasy</span>
              </div>
              <div className="reviews_item_con">
                {/*<h3>You won’t disappointed</h3>*/}
                <p>和小西一起逛了朱拉隆功大学和农业大学，我们修改了去大皇宫的计划，去了农业大学，体验到了当地大学的原汁原味，感受了曼谷的热情。非常开心参加这次55km的体验官活动，5星好评，小西人非常好，不遗余力，我们在一起玩的很开心。</p>
                <div className="reviews_item_con_bottom">
                  <Rate allowHalf defaultValue={5} disabled/>
                  <FormattedDate value={1488174126000} year='numeric' month='short'day='2-digit'/>
                </div>
              </div>
            </div>
            </div>
          ) || data.id===443 && (
            <div className="reviews_item">
              <div className="reviews_item_avatar">
                <div><img src="http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1487508714_mceko_0lz2o?imageView2/1/w/240/h/240" /></div>
                <span>Jannie</span>
              </div>
              <div className="reviews_item_con">
                {/*<h3>You won’t disappointed</h3>*/}
                <p>非常独特的体验！从酒店前台接我们开始，AK这个新朋友就带我们迅速融入当地生活体验，去不同的市场购买最新鲜的食材，交流沟通最有名的泰式冬阴功汤做法……来到他家时，我们都被美妙的环境所吸引了，简直就是练习瑜伽的绝佳场地呢！他家两只猫咪一前一后追逐你，腻着你，丝毫不会觉得你是陌生人，门口的摇床和大片的草地，让我只想留在这里晒晒太阳，看看书，逗逗猫，喝个咖啡，让一切变得缓慢，让心变得平静……AK耐心的讲解菜的做法，有几道菜还让我自己操作，让我这个平时不做菜的人相当有成就感，最主要的还锻炼到了我的英语口语！离开他家后还带我们去了游客不知道但是保留了原始风情的庙，那个景色也真是让人赞叹！很有趣的一天！感谢55km提供的机会，感恩!</p>
                <div className="reviews_item_con_bottom">
                  <Rate allowHalf defaultValue={5} disabled/>
                  <FormattedDate value={1487575679000} year='numeric' month='short'day='2-digit'/>
                </div>
              </div>
            </div>
          )  || data.id===210 && (
            <div className="reviews_item">
              <div className="reviews_item_avatar">
                <div><img src="http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1487579571_araul_rj0cn?imageView2/1/w/240/h/240" /></div>
                <span>limitless</span>
              </div>
              <div className="reviews_item_con">
                <p>袁同学安排得很周到，带我领略了清迈大学的风采，参观了大操场，体育馆，学校夜市，之后还在泰服开黑嘻嘻</p>
                <div className="reviews_item_con_bottom">
                  <Rate allowHalf defaultValue={5} disabled/>
                  <FormattedDate value={1487575679000} year='numeric' month='short'day='2-digit'/>
                </div>
              </div>
            </div>
          ) || data.id===296 && (
            <div className="reviews_item">
              <div className="reviews_item_avatar">
                <div><img src="http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1487678445_o8zhc_eei03?imageView2/1/w/240/h/240" /></div>
                <span>啊昌</span>
              </div>
              <div className="reviews_item_con">
                <p>抱着尝试的心态报了名，结果出人意料，人妖秀很好看，演员很专业，舞台效果很不错，而且接送的师傅很准时，是自由行中蛮不错的一个经历！</p>
                <div className="reviews_item_con_bottom">
                  <Rate allowHalf defaultValue={5} disabled/>
                  <FormattedDate value={1487678484000} year='numeric' month='short'day='2-digit'/>
                </div>
              </div>
            </div>
          )|| data.id===354 && (
            <div className="reviews_item">
              <div className="reviews_item_avatar">
                <div><img src="http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1487946425_clp1e_3s2dc?imageView2/1/w/240/h/240" /></div>
                <span>史黛拉233</span>
              </div>
              <div className="reviews_item_con">
                <p>我对这次行程感觉非常满意，我是26号和男票两个人想去安帕瓦水上市场和美工铁道市场玩，这也是我们五日泰国自由行的最后一日，我们很有幸的通过55公里平台的体验官项目获得了体验券，在平台上看项目的时候有很多选择，所以结合了自己想去的地点和时间安排选择了Nooi的安帕瓦水上市场和美工铁道市场一日游。</p>

<p>首先是前期工作，Nooi是泰国本地人，但英文很好，所以在平台向她发送消息后她很快的回了我，我们也互相加了微信，Nooi人非常nice，想问的都可以直接问她，回复基本都是秒回。这里也想感谢55公里平台的工作人员，态度都特别好，而且基本有问题很快就能得到解决，当然平台现在只有网页版，如果能有App就更好了。</p>

<p>时间安排：我们因为25号晚上很晚才从芭提雅赶回曼谷，然后入住酒店，第二天早上起床也比较晚，其实正常去美工铁道市场应该早点去，看火车的话只在每天11:00am，3:00pm和5:40pm时候有，这个还是我们后来听Nooi的丈夫Ton告诉我们的。所以正常的话应该是8点多就和Nooi和Ton早起一起去看了，但因为我们起晚了，所以错过了比较好的时机，但是Nooi还是很贴心的给我们安排了她的出租车司机，Nooi和Ton自己也有车，所以也可以开车带我们一起去，但是当时的情况还是出租车司机比较合适，从曼谷往安帕瓦水上市场开需要1.5h，不需要我们自己出出租车费，这一切都囊括在了费用里面，而且接下来去水上市场和美工铁道市场时间都很Flexible，我们想去哪个小店逛可以直接告诉Nooi或者是Ton，然后他们会很nice的在门口等我们，个人感觉这种私人订制比旅游团真的舒服太多，不用赶着赶着催你往下一个地方跑，也不会不停地把你往购物店里面带。</p>

<p>价格：价格我想说真的很良心，性价比很高，我看了一下马蜂窝以及淘宝上这种类型一日游的价格每个人基本上都要250+跟团，但在55公里平台上Nooi和Ton的这个一日游项目我和男票两个人只需要600元，相当于每个人300元，关键是来回的出租车车费和在水上市场玩的来回船费都不需要我们出，而且贴心的Nooi和Ton尤其是Ton还会主动自掏腰包给我们买他觉得一定要尝试的泰国本土美食，在美工铁道市场的时候得知我们还没有吃过芒果糯米饭主动帮我们买了一份，真心觉得他和Nooi实在太nice了。</p>

<p>服务：Nooi和Ton的服务真的很赞，幽默风趣，并且很善良，从来不催我们，买东西等位的时候都陪在我们身边，或者在外面等我们，会主动用泰语帮我们问价格，而且会很热情的帮我们拍照，我和男票在喂鱼的时候忘记拍照都是Nooi和Ton帮忙拍的给我们留作纪念，PS 喂鱼的鱼食and我们去一个寺庙的动物园喂小鹿骆驼兔子马小绵羊的空心菜也是他们给买的，真的不要太好：）而且我们在路上很多关于佛的问题，他们都会很nice的给我们解释，之前我就问过寺庙内佛祖身上为什么有七条龙，Ton解释过后才知道那个是佛祖重生的时候来保护佛祖的。回去的路上和Ton闲聊，包括泰国教育医疗政治诸多话题，蛮开心的，虽然我后来困的睡着了23333</p>

<p>Anyway，我觉得这次行程真的特别棒，时间完全合适，而且行程也很充实，服务特别好，会舒服。给Nooi和Ton以及55公里平台点个赞！</p>
                <div className="reviews_item_con_bottom">
                  <Rate allowHalf defaultValue={5} disabled/>
                  <FormattedDate value={1488174126000} year='numeric' month='short'day='2-digit'/>
                </div>
              </div>
            </div>
          )|| (
            <div className="reviews_empty">
              <div className="reviews_empty_icon"></div>
              <p><FormattedMessage id={'TripDetail.Main.ReviewsEmpty'} defaultMessage='Be the first one who give Thammaporn' /></p>
            </div>
          )
        }
        {/*
          [1,2,3].map(()=>{
            return(
              <div className="reviews_item">
                <div className="reviews_item_avatar">
                  <img src="http://www.jq22.com/demo/jquery-xunlei20161219/img/bg_shoulei.jpg" />
                </div>
                <div className="reviews_item_con">
                  <h3>You won’t disappointed</h3>
                  <p>Jk is a very friendly person, she let us choose the dishes we like to learn, then we go to a local market for the ingredients. It’s fun to chat and cook at the same time. You will definitely enjoy the activity.</p>
                  <div className="reviews_item_con_bottom">
                    <Rate allowHalf defaultValue={5} disabled/>
                    <span>September 20, 2016 at 02:36 pm</span>
                  </div>
                </div>
              </div>
            )
          })
        */}
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
  render() {
    const {currency,isLogin,dispatch,locale} = this.props
    const {data,hostedData,guestNum,startDate,affixDisabled} =this.state
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
                  availableDay={''}
                  busyDay={''}
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
                <Button type={data.basePrice && data.basePrice>0 && "primary" || "next"} disabled={data.tourStatus!==2} onClick={()=>{
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
  }
}
TripDetail = connect(select)(TripDetail)
module.exports = TripDetail;
