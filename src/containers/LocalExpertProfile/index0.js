/**
 * 个人主页
 */

import React from 'react'
import {Rate} from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import Lightbox from 'react-image-lightbox'
import { FormattedMessage,FormattedDate } from 'react-intl'
import TripItem from 'components/TripItem'
import {getGrouptourAuthor} from 'actions/Trip'
import {_getGrouptour,_getUser} from 'api/'
import {getReviewsNum,getReviewsData} from 'utils/reviews'
import styles from './index.scss'
class LocalExpertProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      isLoading: false,
      hostedData: {},
      isOpenLightbox: false, //打开图片浏览
      sendMessageM:true,
      slug: 0,
    }
  }
  componentWillMount (){
    const {dispatch,params,userData} = this.props
    this.setState({
      isLoading: true,
      hostedData: {},
      slug:parseInt(params.slug),
    },()=>{
      this.getUser(params.slug)
    })

    dispatch(getGrouptourAuthor(params.slug)).then(()=>{
      this.setState({
        isLoading:false
      })
    })
  }
  /**
   * 获取个人信息
   */
  getUser(authorId) {
    _getUser(authorId).then((res)=>{
      // console.log(res)
      this.setState({
        hostedData: res,
        isLoading:false,
        sendMessageM: false,
      })
		})
  }
  /**
   * 灯箱
   */
  renderLightbox () {
    const {hostedData,photoIndex,isOpenLightbox} =this.state
    const images =hostedData.photos && Array.from(hostedData.photos, (item,index) => {
      return item.photoUrl+'?imageMogr2/auto-orient'
    })
    const imageCaption =hostedData.photos && Array.from(hostedData.photos, (item,index) => {
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
   * 渲染图片
   */
  _renderPhono (){
    const {hostedData} =this.state
    return (  <div className="trip_detail_picbox clearafter">
        {
          hostedData.photos && hostedData.photos.sort((a,b)=>{ return a.sort - b.sort}).slice(0,5).map((item,index) => {
            return (
              <div className={"trip_detail_pic_item trip_detail_pic_item_"+index} key={index}>
                <div className="trip_detail_pic_js" onClick={()=>{
                    this.setState({
                      isOpenLightbox: true,
                      photoIndex: index,
                    })
                  }}>
                  <img src={item.photoUrl+'?imageView2/3/w/640'} />
                  <div className="trip_detail_pic_see">
                   <FormattedMessage id={'TripDetail.Main.Seeallphotos'} defaultMessage={'See all '+`{num}` +' photos'} values={{num:hostedData.photos.length}} />
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>)
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
  /**
   * 渲染评论
   */
  _renderReviews () {
    const {slug} =this.state
    const ReviewsNum = getReviewsNum(slug,true)
    const ReviewsData = getReviewsData(slug,true)
    return (<div>
      <div className="reviews_bar">
        <div className="reviews_bar_main max_width">
          <FormattedMessage id={'TripDetail.Main.Reviews'} defaultMessage='Reviews' />
          {ReviewsNum>0 && (<span className="trip_rate_reviews">（{ReviewsNum} Reviews）</span>)}
        </div>
      </div>
      <div className="max_width reviews_wrap">
        {
          slug===570 && (
            <div>
            <div className="reviews_item">
              <div className="reviews_item_avatar">
                <div><img src="http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1487252665_77gcy_4uzea?imageView2/1/w/240/h/240" /></div>
                <span>Sunsah</span>
              </div>
              <div className="reviews_item_con">
                <Link to={'/trip/436'}>曼谷轻松一日游【朱拉隆功大学、大皇宫、玉佛寺、卧佛寺、考山路】</Link>
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
                <Link to={'/trip/436'}>曼谷轻松一日游【朱拉隆功大学、大皇宫、玉佛寺、卧佛寺、考山路】</Link>
                <p>和小西一起逛了朱拉隆功大学和农业大学，我们修改了去大皇宫的计划，去了农业大学，体验到了当地大学的原汁原味，感受了曼谷的热情。非常开心参加这次55km的体验官活动，5星好评，小西人非常好，不遗余力，我们在一起玩的很开心。</p>
                <div className="reviews_item_con_bottom">
                  <Rate allowHalf defaultValue={5} disabled/>
                  <FormattedDate value={1488174126000} year='numeric' month='short'day='2-digit'/>
                </div>
              </div>
            </div>
            </div>
          )
        }
        {
          slug===876 && (
            <div className="reviews_item">
              <div className="reviews_item_avatar">
                <div><img src="http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1487508714_mceko_0lz2o?imageView2/1/w/240/h/240" /></div>
                <span>Jannie</span>
              </div>
              <div className="reviews_item_con">
                <Link to={'/trip/443'}>Real Thai Home Cooking with AK</Link>
                <p>非常独特的体验！从酒店前台接我们开始，AK这个新朋友就带我们迅速融入当地生活体验，去不同的市场购买最新鲜的食材，交流沟通最有名的泰式冬阴功汤做法……来到他家时，我们都被美妙的环境所吸引了，简直就是练习瑜伽的绝佳场地呢！他家两只猫咪一前一后追逐你，腻着你，丝毫不会觉得你是陌生人，门口的摇床和大片的草地，让我只想留在这里晒晒太阳，看看书，逗逗猫，喝个咖啡，让一切变得缓慢，让心变得平静……AK耐心的讲解菜的做法，有几道菜还让我自己操作，让我这个平时不做菜的人相当有成就感，最主要的还锻炼到了我的英语口语！离开他家后还带我们去了游客不知道但是保留了原始风情的庙，那个景色也真是让人赞叹！很有趣的一天！感谢55km提供的机会，感恩!</p>
                <div className="reviews_item_con_bottom">
                  <Rate allowHalf defaultValue={5} disabled/>
                  <FormattedDate value={1487575679000} year='numeric' month='short'day='2-digit'/>
                </div>
              </div>
            </div>
          )
        }
        {
          slug===809 && (
            <div className="reviews_item">
              <div className="reviews_item_avatar">
                <div><img src="http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1487163168_8u1a9_4v7to?imageView2/1/w/240/h/240" /></div>
                <span>Chef AK</span>
              </div>
              <div className="reviews_item_con">
                <Link to={'/trip/443'}>Real Thai Home Cooking with AK</Link>
                <p>I really had a good experience with Jannie and her friend. Above all was how we had a real interactions, we shared our stories, opinions, and experiences. I believe that the core value of tourism is to see and learn the culture of the country you travel and I love the way 55km created a platform that allow the tourist and the local to meet and learn from each other.</p>
                <div className="reviews_item_con_bottom">
                  <Rate allowHalf defaultValue={5} disabled/>
                  <FormattedDate value={1487575679000} year='numeric' month='short'day='2-digit'/>
                </div>
              </div>
            </div>
          )
        }
        {
          slug===563 && (
            <div className="reviews_item">
              <div className="reviews_item_avatar">
                <div><img src="http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1487579571_araul_rj0cn?imageView2/1/w/240/h/240" /></div>
                <span>limitless</span>
              </div>
              <div className="reviews_item_con">
                <Link to={'/trip/210'}>萌游清迈【宁曼路、清迈大学、古寺、玛雅商场、网吧开黑（泰服）】</Link>
                <p>袁同学安排得很周到，带我领略了清迈大学的风采，参观了大操场，体育馆，学校夜市，之后还在泰服开黑嘻嘻</p>
                <div className="reviews_item_con_bottom">
                  <Rate allowHalf defaultValue={5} disabled/>
                  <FormattedDate value={1487575679000} year='numeric' month='short'day='2-digit'/>
                </div>
              </div>
            </div>
          )
        }
        {
          slug===582 && (
            <div className="reviews_item">
              <div className="reviews_item_avatar">
                <div><img src="http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1487678445_o8zhc_eei03?imageView2/1/w/240/h/240" /></div>
                <span>limitless</span>
              </div>
              <div className="reviews_item_con">
                <Link to={'/trip/296'}>脸红心跳的夜场项目---人妖秀 【罗马金宫人妖秀 VVIP专座</Link>
                <p>抱着尝试的心态报了名，结果出人意料，人妖秀很好看，演员很专业，舞台效果很不错，而且接送的师傅很准时，是自由行中蛮不错的一个经历！</p>
                <div className="reviews_item_con_bottom">
                  <Rate allowHalf defaultValue={5} disabled/>
                  <FormattedDate value={1487575679000} year='numeric' month='short'day='2-digit'/>
                </div>
              </div>
            </div>
          )
        }
        {
          slug===595 && (
            <div className="reviews_item">
              <div className="reviews_item_avatar">
                <div><img src="http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1487946425_clp1e_3s2dc?imageView2/1/w/240/h/240" /></div>
                <span>史黛拉233</span>
              </div>
              <div className="reviews_item_con">
                <Link to={'/trip/354'}>Maeklong Railway Market & Amphawa Floating Market 一城二市，美功铁道市场，安帕瓦水上市场一日游</Link>
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
          )
        }
        {/*
          slug===790 && (
            <div className="reviews_item">
              <div className="reviews_item_avatar">
                <div><img src="http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1487066489_r7jal_2grbl?imageView2/1/w/240/h/240" /></div>
                <span>萌1号</span>
              </div>
              <div className="reviews_item_con">
                <Link to={'/trip/210'}>萌游清迈【宁曼路、清迈大学、古寺、玛雅商场、网吧开黑（泰服）】</Link>
                <p>I really had a good experience with Jannie and her friend. Above all was how we had a real interactions, we shared our stories, opinions, and experiences. I believe that the core value of tourism is to see and learn the culture of the country you travel and I love the way 55km created a platform that allow the tourist and the local to meet and learn from each other.</p>
                <div className="reviews_item_con_bottom">
                  <Rate allowHalf defaultValue={5} disabled/>
                  <FormattedDate value={1487575679000} year='numeric' month='short'day='2-digit'/>
                </div>
              </div>
            </div>
          )
        */}
      </div>
      </div>)
  }
  render() {
    const {authorIdGroupTour} = this.props
    const {hostedData,slug} =this.state
    //const fristPhoto = hostedData.photos && hostedData.photos.filter(item => parseInt(item.default) === 1) || []
    const avatarUrl = hostedData.avatarUrl || '/static/images/usericon_120.png'
    // const itemlist = authorIdGroupTour && authorIdGroupTour.data && authorIdGroupTour.data.slice(0,3) || []
    const itemlist = authorIdGroupTour && authorIdGroupTour.data || []
    const fristPhoto = this._getFristPhoto(hostedData.photos)
    return (
      <div className="local_expert_profile">
        <div className="profile_top" onClick={()=>{
            this.setState({
              isOpenLightbox: true,
              photoIndex: this._getFristPhotoId(hostedData.photos)
            })
          }}>
          {
            fristPhoto && <img src={fristPhoto+'?imageMogr2/auto-orient'} />
          }
          <div className="profile_avatar">
            <img src={avatarUrl+'?imageView2/1/w/240/h/240'} />
          </div>
        </div>

        <div className="profile_main">
          <div className="max_width">
            <div className="profile_information">
              <h1>{hostedData.nickname}</h1>
              <p>{hostedData.city},{hostedData.country}</p>
            </div>
          </div>
        </div>
        <div className="max_width">
          <div className="profile_trip">
              <h2><FormattedMessage id={'Local.More information'} defaultMessage={'More information'} /></h2>
              <p>{hostedData.aboutYourself}</p>
          </div>
        </div>
        <div className="max_width">
          <div className="profile_trip">
              <h2><FormattedMessage id={'Local.Album by'} defaultMessage={'Album by '+`{name}`} values={{name:hostedData.nickname}}/></h2>
              {this._renderPhono()}
          </div>
        </div>
        <div className="max_width">
          <div className="profile_trip">
              <h2><FormattedMessage id={'Local.Trips created'} defaultMessage={'Trips created by '+`{name}`} values={{name:hostedData.nickname}}/></h2>
             <TripItem itemlist={itemlist} type="local"/>
          </div>
        </div>
        {this.renderLightbox()}
        {slug===570 && this._renderReviews()}
        {slug===876 && this._renderReviews()}
        {slug===809 && this._renderReviews()}
        {slug===563 && this._renderReviews()}
        {slug===790 && this._renderReviews()}
        {slug===582 && this._renderReviews()}
        {slug===595 && this._renderReviews()}

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
LocalExpertProfile = connect(select)(LocalExpertProfile)
module.exports = LocalExpertProfile;
