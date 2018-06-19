import React from 'react';
import { Link,browserHistory} from 'react-router'
import { Button,Icon,Input,Select,Rate,Carousel} from 'antd';
import { connect } from 'react-redux'
import Header from 'components/Header'
import {openLogin} from 'actions/User'
const Search = Input.Search;
import styles from './index.scss'
import {groupDestinations,sortByBestinations} from 'utils/'
import { FormattedMessage,injectIntl,intlShape } from 'react-intl'
import Helmet from "react-helmet"
import {config} from 'utils/config'
import {trackEvent} from 'actions/common'
import ReactSwipe from 'components/ReactSwipe'
const Option = Select.Option
const OptGroup = Select.OptGroup

class Home extends React.Component {
  constructor(props) {
    super(props);
  }
  /**
   * 搜索
   */
  onSearch(keyword){
    if (keyword) {
      browserHistory.push('/search/Any?title='+keyword)
    }
  }
  onSelectSearch (keyword) {
    if (keyword) {
      trackEvent('用户行为','index/search',keyword)
      browserHistory.push('/search/'+keyword)
    }
  }
  getDestinations (){
    const destinations = groupDestinations()
    const destinationsD = Object.keys(destinations).sort(sortByBestinations)
    return destinationsD.map((item,index)=>{
      return (<OptGroup label={<FormattedMessage id={'Destination.'+item} defaultMessage={item} />} key={index}>{
        destinations[item].map((item2,index2)=>{
          return item ==='The Most Popular Cities' && item2.country  && (<Option value={item2.city} key={index2}><FormattedMessage id={'Destination.'+item2.country} defaultMessage={item2.country} />-<FormattedMessage id={'Destination.'+item2.city} defaultMessage={item2.city} /></Option>) || (<Option value={item2.city} key={index2}><FormattedMessage id={'Destination.'+item2.city} defaultMessage={item2.city} /></Option>)
        })
      }</OptGroup>)
    })
  }
  _renderPopularCity (){
    if (window.document.body.offsetWidth<768) {
      const opt = {
        distance: 168, // 每次移动的距离，卡片的真实宽度
      }
      return (
        <div>
        <div className="popular_city_title"><FormattedMessage id={'Dashboard.Profile.Country.Thailand'} defaultMessage='Thailand' /></div>
        <div className="popular_city_body">

          <ReactSwipe className="label_slide clearafter" options={opt}>
              <Link to='/search/Bangkok'>
                <img src='http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1495352087_ajkwu_w799j' />
                <FormattedMessage id={'Destination.Bangkok'} defaultMessage='Bangkok' />
              </Link>

              <Link to='/search/Chiang Mai'>
                <img src='http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1495352123_vvpz3_rn21a' />
                <FormattedMessage id={'Destination.Chiang Mai'} defaultMessage='Chiang Mai' />
              </Link>

              <Link to='/search/Phuket Island'>
                <img src='http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1495352109_lrdap_fkhui' />
                <FormattedMessage id={'Destination.Phuket Island'} defaultMessage='Phuket Island' />
              </Link>
          </ReactSwipe>
        </div>

        <div className="popular_city_title"><FormattedMessage id={'Destination.Vietnam'} defaultMessage='Vietnam' /></div>
        <div className="popular_city_body">
          <ReactSwipe className="label_slide clearafter" options={opt}>
              <Link to='/search/Ho Chi Minh City'>
                <img src='http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1495352045_txn8j_f2xcg' />
                <FormattedMessage id={'Destination.Ho Chi Minh City'} defaultMessage='Ho Chi Minh City' />
              </Link>

              <Link to='/search/Hanoi'>
                <img src='http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1495352019_8qf4u_0cie2' />
                <FormattedMessage id={'Destination.Hanoi'} defaultMessage='Hanoi' />
              </Link>

              <Link to='/search/Nha Trang'>
                <img src='http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1495352139_sfgjl_ozlq5' />
                <FormattedMessage id={'Destination.Nha Trang'} defaultMessage='Nha Trang' />
              </Link>
          </ReactSwipe>
        </div>
        </div>
      )
    }else{
      return (
        <div>
        <div className="popular_city_title"><FormattedMessage id={'Dashboard.Profile.Country.Thailand'} defaultMessage='Thailand' /></div>
        <div className="popular_city_body">
          <ul className="clearafter">
            <li>
              <Link to='/search/Bangkok'>
                <img src='http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1486903895_v3hnw_8ay4i' />
                <FormattedMessage id={'Destination.Bangkok'} defaultMessage='Bangkok' />
              </Link>
            </li>
            <li>
              <Link to='/search/Chiang Mai'>
                <img src='http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1486904063_95tw0_96n65' />
                <FormattedMessage id={'Destination.Chiang Mai'} defaultMessage='Chiang Mai' />
              </Link>
            </li>
            <li>
              <Link to='/search/Phuket Island'>
                <img src='http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1486904083_um7ir_mtmtp' />
                <FormattedMessage id={'Destination.Phuket Island'} defaultMessage='Phuket Island' />
              </Link>
            </li>
          </ul>
        </div>

        <div className="popular_city_title"><FormattedMessage id={'Destination.Vietnam'} defaultMessage='Vietnam' /></div>
        <div className="popular_city_body">
          <ul className="clearafter">
            <li>
              <Link to='/search/Ho Chi Minh City'>
                <img src='http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1495352205_a2g6f_xuopu' />
                <FormattedMessage id={'Destination.Ho Chi Minh City'} defaultMessage='Ho Chi Minh City' />
              </Link>
            </li>
            <li>
              <Link to='/search/Hanoi'>
                <img src='http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1496393365_nhi6z_lf1f5' />
                <FormattedMessage id={'Destination.Hanoi'} defaultMessage='Hanoi' />
              </Link>
            </li>
            <li>
              <Link to='/search/Nha Trang'>
                <img src='http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1495352192_epgm1_hqnfd' />
                <FormattedMessage id={'Destination.Nha Trang'} defaultMessage='Nha Trang' />
              </Link>
            </li>
          </ul>
        </div>
        </div>
      )
    }

  }
  render() {
    const {isLogin,intl,locale} = this.props
    const tips1 = intl.formatMessage({id:"Index.Step1tips", defaultMessage: "Do a simple preparation, <br/>to know what place or activity you prefer"})
    const tips2 = intl.formatMessage({id:"Index.Step2tips", defaultMessage: "Browse 55km.com, <br/>find your favorite local tours here"})
    const tips3 = intl.formatMessage({id:"Index.Step3tips", defaultMessage: "Booking after communication, <br/>enjoy authentic experience in Thailand"})
    const banner2H3 = intl.formatMessage({id:"Index.Banner2.H3", defaultMessage: "Call 100 Travelers <br/>This Spring!"})
    const _placeholder = intl.formatMessage({id:"Index.Search.placeholder", defaultMessage: "Choose the destination"})
    const settings = {
      dots: false,
      infinite: true,
      arrows:true,
      nextArrow: (<div><Icon type="right" /></div>),
      prevArrow: (<div><Icon type="left" /></div>),
      speed: 500,
      slidesToShow: (window.document.body.offsetWidth<768) && 1 || 2,
      slidesToScroll: (window.document.body.offsetWidth<768) && 1 || 2,

    };
    return (
      <div className="index_wrap">
        <Helmet
          htmlAttributes={{lang: locale}}
          title={config.title[locale]}
        />
        <div className="index_bg">
          <Header type={'index'} />
          <div className="index_header_main max_width960">
              <h1><FormattedMessage id={'Index.Local’s'} defaultMessage="Local Expert's" /></h1>
              <h2>MINITOUR</h2>
              <h3><FormattedMessage id={'Index.explore Thailand by following local one-day tour'} defaultMessage="Explore better by taking local expert's 1 day tour" /></h3>
              <div className="index_search">
              {/*<Search placeholder="选择您想去的目的地" size={'large'} onSearch={(keyword)=>{
                  this.onSearch(keyword)
                }}/>*/}

                  <Select  size="large" placeholder={_placeholder} onChange={(value)=>{
                    //this._newFilter('destination',value)
                    this.onSelectSearch(value)
                  }}>
                  {this.getDestinations()}
                </Select>
              </div>
          </div>
        </div>

        <div className="index_main index_main_popular">
          <div className="popular_city_wrap max_width960">
            <div className="popular_city_heard">
              <h2><FormattedMessage id={'Index.Popular Cities'} defaultMessage='Popular Cities' /></h2>
            {/*  <span>Explore  around the Tailand</span>*/}
            </div>
            {this._renderPopularCity()}


          </div>
          </div>


          <div className="max_width960 index_main">
          <div className="experience_wrap">
            <div className="experience_heard">
              <h2><FormattedMessage id={'Index.How to Experience'} defaultMessage='How to Experience' /></h2>
            </div>
            <div className="experience_body">
              <ul className="clearafter">
                <li>
                  <img src='static/images/step1.png' />
                  <div>
                    <h3><FormattedMessage id={'Index.Step1'} defaultMessage='Step1' /></h3>
                    <p dangerouslySetInnerHTML={{__html: tips1}}></p>
                  </div>
                </li>
                <li>
                  <img src='static/images/step2.png' />
                  <div>
                  <h3><FormattedMessage id={'Index.Step2'} defaultMessage='Step2' /></h3>
                  <p dangerouslySetInnerHTML={{__html: tips2}}></p>
                  </div>
                </li>
                <li>
                  <img src='static/images/step3.png' />
                  <div>
                  <h3><FormattedMessage id={'Index.Step3'} defaultMessage='Step3' /></h3>
                  <p dangerouslySetInnerHTML={{__html: tips3}}></p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
          {/* <div  className="index_main_banner">
          <div className="max_width960 index_main index_main2">
            <Link to={'/news/20170303'}>
            <div className="index_banner index_banner1">
              <img src='http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1488521648_rqox9_htk5w' />
           <h3 dangerouslySetInnerHTML={{__html: banner2H3}}></h3>
              <p><FormattedMessage id={'Index.Banner2.p'} defaultMessage='We want to sponsor your trip in Thailand!' /></p>
              <Button type="ghost">
              <FormattedMessage id="Index.Banner2.Know More" defaultMessage="Know More" /></Button>
            </div>
            </Link>
          </div>
        </div>
        <div className="max_width960 index_main index_main2">
          <a target="_blank" href="https://mp.weixin.qq.com/s?__biz=MzI3MTE5NzA1Mg==&mid=2651586368&idx=1&sn=26ca690346668bd93885588d60010106">
            <div className="index_banner index_banner2 index_banner2016060101">
              <img src='http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1497777607_4pdy8_2poj3' />
            </div>
          </a>
        </div>
        <div className="max_width960 index_main index_main2">
          <a target="_blank" href="https://mp.weixin.qq.com/s?__biz=MzI3MTE5NzA1Mg==&mid=2651586302&idx=1&sn=da707bfee0b6cce31fcc095d0f355f40">
            <div className="index_banner index_banner2 index_banner2016060102">
              <img src='http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1496386649_53j9w_ocdmx' />
            </div>
          </a>
        </div>*/}
        <div className="max_width960 index_main index_main2">
          <Link to={'/dashboard/listing'}>
          <div className="index_banner index_banner2">
            <img src='http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1486904152_fh029_7yty7' />
            <h3><FormattedMessage id={'Index.Banner1.H3'} defaultMessage='Local Expert' /></h3>
            <p><FormattedMessage id={'Index.Banner1.p'} defaultMessage='To be a Local Expert of 55km，meet more friends as well as making extra money!' /></p>
            <Button type="next">
              <FormattedMessage id="Footer.Become a HOST" defaultMessage="Become a Local Expert" />
            </Button>
          </div>
          </Link>
          <div className="wechat_wrap">
            <h3 className="wechat_wrap_header">关注我们的微信公众号</h3>
            <div className="wechat_wrap_body">
              <img src='http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485860534_vjuz1_k8u27' />
            </div>
          </div>
        </div>
        <div  className="index_main_reviews">
          <div className="max_width960 index_main">
            <div className="reviews_logo"><Icon type={"logo_"+locale} /></div>
            <div className="reviews_title">
              <h3>LET YOUR LIFE BE AN</h3>
              <h1>ADVENTURE！</h1>
            </div>
            <div className="reviews_wrap" >
              <Carousel {...settings}>
              <div className="reviews_item">
                <h3>只想让您不虚此行</h3>
                <p>我们跑遍大街小巷，翻出不少生活在当地又懂旅行的伙伴，邀请他们成为55公里“当地里手”，为您设计出一条又一条独具特色的一日行程。既包括了必去热门，还有不少小众特色。我们想让您一次就能在目的地有多重的体验，让您真正感觉不虚此行。</p>
                <div className="reviews_item_con_bottom">
                  <Rate allowHalf defaultValue={5} disabled/>
                </div>
              </div>
              <div className="reviews_item">
                <h3>You won’t be disappointed </h3>
                <p>All the Local Experts here are living or working  in the place which you are planning to go travel. They can show you a beautiful traveling place, at the same time, they will also bring you a wonderful culture experience. Join them, you won’t be disappointed!</p>
                <div className="reviews_item_con_bottom">
                  <Rate allowHalf defaultValue={5} disabled/>
                </div>
              </div>
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
function select(store){
  return {
    isLogin: store.User.isLogin,
    userData: store.User.userData,
    locale: store.Common.locale
  }
}
Home.propTypes = {
  intl: intlShape.isRequired
}
Home = injectIntl(Home)
Home = connect(select)(Home)
module.exports = Home
