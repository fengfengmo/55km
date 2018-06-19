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
import {_getGrouptour,_getUser,_getReviewExpert} from 'api/'
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
      reviewData: [],
      reviewDataNum: 0,
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
    _getReviewExpert(authorId).then((res)=>{
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
    const {slug,reviewData,reviewDataNum} =this.state
    const ReviewsNum = parseInt(getReviewsNum(slug,true)) + parseInt(reviewDataNum)
    const ReviewsData = getReviewsData(slug,true)
    if (ReviewsNum<1) {
      return null
    }
    return (<div>
      <div className="reviews_bar">
        <div className="reviews_bar_main max_width">
          <FormattedMessage id={'TripDetail.Main.Reviews'} defaultMessage='Reviews' />
          {ReviewsNum>0 && (<span className="trip_rate_reviews">（{ReviewsNum} Reviews）</span>)}
        </div>
      </div>
      <div className="max_width reviews_wrap">
      {
        ReviewsData.map((item,index)=>{
          return(
            <div className="reviews_item" key={index}>
              <div className="reviews_item_avatar">
                <div><img src={`http://7xq8kr.com1.z0.glb.clouddn.com/`+ item.avatar_url+`?imageView2/1/w/240/h/240`} /></div>
                <span>{item.name}</span>
              </div>
              <div className="reviews_item_con">
                  <Link to={'/trip/'+item.trip_id}>{item.trip_title}</Link>
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
        {this._renderReviews()}
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
