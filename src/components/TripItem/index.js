import React from 'react';
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { Button,Icon,Rate,Spin,Popconfirm,Tooltip} from 'antd';
import styles from './index.scss'
import {getDisplayPrice,getCurrencyPrice} from 'utils/'
import {_deleteTrip} from 'api'
import { FormattedMessage,injectIntl,intlShape } from 'react-intl'
import Infinite from 'react-infinite'
import {getReviewsNum} from 'utils/reviews'
class TripItem extends React.Component {
  constructor(...args) {
    super(...args);
    this.state={
      type: this.props.type || '',
      onInfiniteLoad: false
    }
  }
  _getFristPhoto (items) {
    if (!items || (items && !items[0]) ) {
      return false
    }
    const fristPhoto = items.filter(item => item.default === 1)
    return (fristPhoto[0] && fristPhoto[0].photoUrl || items[0].photoUrl )|| (fristPhoto[0] && fristPhoto[0].url || items[0].url )
  }
  _calPrice (item) {
    /**
     * 处理进阶价格
     */
    let price = 0
    let priceArr = []
    if (item.priceInfo && item.priceInfo.length>0) {
      item.priceInfo.map((itemx,index)=>{
        const x = parseFloat(itemx.description)  / parseInt(itemx.title)
        priceArr.push(x)
      })
      price = Math.min.apply(null,priceArr)
    }else{
      /**
       * 没有阶梯价格显示基础价格
       * @type {[type]}
       */
      price = item.basePrice
    }
    if (!price && item.basePrice) {
      price = item.basePrice
    }
    return (price)
  }
  _renderStatus (item) {
    //tourStatus
    //0:草稿，1:已发布，2:上架，3:下架
    let _class ='item_status status_draft'
    let _txt = 'Draft'
    if (item.tourStatus === 2) {
      _class ='item_status status_sale'
      _txt = 'On Sale'
    }
    return (
      <div className={_class}>
        <div className='item_status_txt'>
          {_txt}
        </div>
      </div>

    )
  }
  _InfiniteLoad () {
    const {onInfiniteLoad} = this.props

    if (!this.state.onInfiniteLoad) {
      this.setState({
        onInfiniteLoad: true
      })
      setTimeout(()=>{
        onInfiniteLoad && onInfiniteLoad()
        this.setState({
          onInfiniteLoad: false
        })
      },12)
    }
  }
  /**
   * 滚动高度
   */
  _getElementHeight (){
    if (window.document.body.offsetWidth<768) {
      return 440
    }
    return 250
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
       newLanguage.push(<span>,</span>)
      }
    })
    return newLanguage
  }
  /**
   * 渲染Label 有多个的情况
   */
  _Label (value){
    if (!value) {
      return null
    }
    let label = value.split(",")
    let newLabel = []
    label.map((item,index)=>{
      newLabel.push(<FormattedMessage id={'Label.'+item} defaultMessage={item} />)
      if (index!==label.length-1) {
       newLabel.push(<span>,</span>)
      }
    })
    return newLabel
  }
  _intlPrice (item){
    const {type} =this.state
    const {currency,intl}  = this.props
    let data = null

    if (type==='search') {
      data = getCurrencyPrice(item.extraGroupTour.floorPrice,currency)
    }else{
      data = getCurrencyPrice(this._calPrice(item),currency)
    }
    // if (type==='local') {
    //   data = getCurrencyPrice(this._calPrice(item),currency)
    // }
    if ((item.groupTour && item.groupTour.price>0) || (item.basePrice && item.basePrice>0)) {
      return (<span className="price">{data}<FormattedMessage id={'Common.CurrenciesPersonBasePrice.'+currency} defaultMessage={currency+' PP'}/></span>)
    }
    return (<span className="price">{data}<FormattedMessage id={'Common.CurrenciesPersonPriceInfo.'+currency} defaultMessage={currency+' SP'}/></span>)
  }
  render() {
    const {type} =this.state
    const {currency,isInfiniteLoading,itemlist,infiniteLoadBeginEdgeOffset,intl} = this.props
    const first_review = intl.formatMessage({id:'Common.First_review', defaultMessage: 'The first review of 55KM！'})
    const first_review2 = intl.formatMessage({id:'Common.First_review2', defaultMessage: 'The second review of 55KM！'})
    const first_review3 = intl.formatMessage({id:'Common.First_review3', defaultMessage: 'The third review of 55KM！'})
    /**
     * 个人主页
     * @type {[type]}
     */
    if (type==='local') {
      return (
        <div className="trip_item_search">
        {
          itemlist.map((item,index)=>{
            /**
             * 暂时屏蔽
             */
            if (item.tourStatus!==2) {
              return
            }
            return(
              <Link to={'/trip/'+item.id} className="trip_item" key={index} target="_blank">
                <div className="listtrip_item flex">
                  <div className="listtrip_item_l">
                    <div className="item_image">
                    {
                      this._getFristPhoto(item.photo) && (<img src={this._getFristPhoto(item.photo)+'?imageView2/3/w/640/format/jpg'} />)
                    }
                      <div className="item_image_bar flex">
                        <div className='item_rate'>
                          <div className="item_address">
                            <Icon type="location" />
                            {
                              this._Destination(item.destination)
                            }
                          </div>
                          <Rate allowHalf defaultValue={5} disabled/>
                            {getReviewsNum(item.id)> 0 && (<span>（{getReviewsNum(item.id)} Reviews）</span>)}
                        </div>
                        <div className={item.basePrice && item.basePrice>0 && 'item_person_price item_person_price_base' || 'item_person_price'}>
                          {/*<FormattedMessage
                            id={'Common.Currencies.'+currency}
                            defaultMessage={`{num} `+ currency}
                            values={{num: getCurrencyPrice(this._calPrice(item),currency)}}
                            />
                          <br/>*/}
                          <div className="price_person">{this._intlPrice(item)}</div>
                          {/*<span>per person</span>*/}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="listtrip_item_r">
                    <h3>{item.tourTitle}</h3>
                      <div className="trip_item_four">
                        <ul className="clearafter">
                          {item.tourSpan && (<li><Icon type="time" /><span className="b"><FormattedMessage id="TripDetail.Item.Duration" defaultMessage="Duration" />:</span><FormattedMessage id={'TripDetail.Main.Hours'} defaultMessage={`{num}` +'Hours'} values={{num:item.tourSpan}} /></li>)}
                          {item.transportation && (<li><Icon type="Trans" /><span className="b"><FormattedMessage id="TripDetail.Item.Transportation" defaultMessage="Transportation" />:</span><FormattedMessage id={'Transportation.'+item.transportation} defaultMessage={item.transportation} /></li>)}
                          {item.language && (<li><Icon type="Language" /><span className="b"><FormattedMessage id="TripDetail.Item.Language" defaultMessage="Language" />:</span>{this._Language(item.language)}</li>)}
                          {item.labels && (<li><Icon type="smile-o" /><span className="b"><FormattedMessage id="TripDetail.Item.Activities" defaultMessage="Activities" />:</span>{this._Label(item.labels)}</li>)}
                        </ul>
                      </div>
                      <div className="item_footer">
                        <div className="trip_detail_item">
                          <p className="price_included_item">
                            <Icon type="trans" className={item.priceType !='不含交通餐饮门票费用' && 'price_included_active'}/>
                          </p>
                          <p className="price_included_item">
                            <Icon type="ticket" className={item.priceType !='不含交通餐饮门票费用' && 'price_included_active'}/>
                          </p>
                          <p className="price_included_item">
                            <Icon type="food" className={item.priceType ==='费用全包' && 'price_included_active'}/>
                          </p>
                          {/*<p className="price_included_item">
                            <Icon type="fees" className={item.priceType ==='费用全包' && 'price_included_active'}/>
                          </p>*/}
                        </div>
                        <div className="item_price">
                          {/*<span className="item_price1">$2000</span>
                          <span className="item_price2">50%OFF </span>*/}
                        </div>
                      </div>
                  </div>
                </div>
              </Link>
            )
          })
        }
        </div>
      )
    }
    /**
     * 列表页面
     * @type {[type]}
     */
    if (type==='search') {
      return(
        <Infinite
          className="trip_item_search"
          elementHeight={this._getElementHeight()}
          useWindowAsScrollContainer
          infiniteLoadBeginEdgeOffset={infiniteLoadBeginEdgeOffset}
          isInfiniteLoading={isInfiniteLoading}
          onInfiniteLoad={()=>this._InfiniteLoad()}
          >
        {
          this.props.itemlist.map((item,index)=>{
            /**
             * 暂时屏蔽
             */
            if (item.extraGroupTour.tourStatus!==2) {
              return
            }
            return(
              <Link to={'/trip/'+item.extraGroupTour.groupTourId} className="trip_item" key={index} target="_blank">
                <div className="listtrip_item flex">
                  <div className="listtrip_item_l">
                    <div className="item_image">
                    {
                      this._getFristPhoto(item.photo) && (<img src={this._getFristPhoto(item.photo)+'?imageView2/3/w/640/format/jpg'} />)
                    }
                      <div className="item_image_bar flex">
                        <div className='item_rate'>
                          <div className="item_address">
                            <Icon type="location" />
                            {
                              this._Destination(item.extraGroupTour.destination)
                            }
                          </div>
                          <div className="item_reviews">
                            <Rate allowHalf defaultValue={5} disabled/>
                            {getReviewsNum(item.extraGroupTour.groupTourId,null,item.reviews)> 0 && (<span>（{getReviewsNum(item.extraGroupTour.groupTourId,null,item.reviews)} Reviews）</span>)}
                          </div>

                        </div>
                        <div className={item.groupTour.price && item.groupTour.price>0 && 'item_person_price item_person_price_base' || 'item_person_price'}>
                        {/*  <FormattedMessage
                            id={'Common.Currencies.'+currency}
                            defaultMessage={`{num} `+ currency}
                            values={{num: getCurrencyPrice(item.extraGroupTour.floorPrice,currency)}}
                            />
                          <br/>*/}
                          <div className="price_person">{this._intlPrice(item)}</div>
                          {/*<span>per person</span>*/}
                        </div>
                      </div>
                    </div>

                  </div>
                  <div className="listtrip_item_r">
                    <h3>{item.groupTour.title}</h3>
                      <div className="trip_item_four">
                        <ul className="clearafter">
                          {item.groupTour.duration && (<li><Icon type="time" /><span className="b"><FormattedMessage id="TripDetail.Item.Duration" defaultMessage="Duration" />:</span><FormattedMessage id={'TripDetail.Main.Hours'} defaultMessage={`{num}` +'Hours'} values={{num:item.groupTour.duration}} /></li>)}
                          {item.groupTour.transportation && (<li><Icon type="Trans" /><span className="b"><FormattedMessage id="TripDetail.Item.Transportation" defaultMessage="Transportation" />:</span><FormattedMessage id={'Transportation.'+item.groupTour.transportation} defaultMessage={item.groupTour.transportation} /></li>)}
                          {item.groupTour.language && (<li><Icon type="Language" /><span className="b"><FormattedMessage id="TripDetail.Item.Language" defaultMessage="Language" />:</span>{this._Language(item.groupTour.language)}</li>)}
                          {item.groupTour.labels && (<li><Icon type="smile-o" /><span className="b"><FormattedMessage id="TripDetail.Item.Activities" defaultMessage="Activities" />:</span>{this._Label(item.groupTour.labels)}</li>)}
                        </ul>
                      </div>
                      <div className="item_footer">
                        <div className="trip_detail_item">
                          <p className="price_included_item">
                            <Icon type="trans" className={item.extraGroupTour.priceType !='不含交通餐饮门票费用' && 'price_included_active'}/>
                          </p>
                          <p className="price_included_item">
                            <Icon type="ticket" className={item.extraGroupTour.priceType !='不含交通餐饮门票费用' && 'price_included_active'}/>
                          </p>
                          <p className="price_included_item">
                            <Icon type="food" className={item.extraGroupTour.priceType ==='费用全包' && 'price_included_active'}/>
                          </p>
                          {item.extraGroupTour.groupTourId===436 && (<Tooltip placement="topLeft" title={first_review}><p className="price_included_item"><div className='first_icon review1'> </div></p></Tooltip>)}
                          {item.extraGroupTour.groupTourId===443 && (<Tooltip placement="topLeft" title={first_review2}><p className="price_included_item"><div className='first_icon review2'> </div></p></Tooltip>)}
                          {item.extraGroupTour.groupTourId===210 && (<Tooltip placement="topLeft" title={first_review3}><p className="price_included_item"><div className='first_icon review3'> </div></p></Tooltip>)}
                          {/*<p className="price_included_item">
                            <Icon type="fees" className={item.priceType ==='费用全包' && 'price_included_active'}/>
                          </p>*/}
                        </div>
                        <div className="item_price">
                          {/*<span className="item_price1">$2000</span>
                          <span className="item_price2">50%OFF </span>*/}
                        </div>
                      </div>


                  </div>
                </div>
              </Link>
            )
          })
        }
        </Infinite>
      )
    }
    const {deleteTrip} = this.props
    return (
      <div>
      {
        this.props.itemlist && this.props.itemlist.map((item,index)=>{
          return(
            <div  className="trip_item" key={index}>
              <div className="listtrip_item flex">
                <div className="listtrip_item_l">
                  <div className="item_image ">
                    {
                      this._getFristPhoto(item.photo) && (<img src={this._getFristPhoto(item.photo)+'?imageView2/3/w/640/format/jpg'} />)
                    }
                    <div className="item_image_bar flex">
                      <div className='item_rate'>
                        <div className="item_address">
                          <Icon type="location" />
                          {
                            this._Destination(item.destination)
                          }
                        </div>
                        <Rate allowHalf defaultValue={5} disabled/>
                      </div>
                      <div className={item.basePrice && item.basePrice>0 && 'item_person_price item_person_price_base' || 'item_person_price'}>
                        {this._intlPrice(item)} <br/>
                        <span>per person</span>
                      </div>
                    </div>
                    {this._renderStatus(item)}
                  </div>
                  <div className="item_title">
                    <h3>{item.tourTitle}</h3>
                    <div className="item_price">
                      {/*<span className="item_price1">$2000</span>
                      <span className="item_price2">50%OFF </span>*/}
                    </div>
                  </div>
                </div>
                <div className="listtrip_item_r">
                  <div className="item_tips_list">
                  {item.tourStatus === 2 && (<p className="item_tips item_tips1">Your trip has been approved</p>)}

                  {/*  <p className="item_tips item_tips2">Last updated on May 19, 2016</p>*/}
                  </div>
                  <div className="item_bnt_list" style={{
                      justifyContent: item.tourStatus !== 2 && 'flex-end'
                    }}>
                  {
                    item.tourStatus === 2 && (
                      <Button type="ghost" className="bnt" >
                          <Link to={'/trip/'+item.id} >

                            <FormattedMessage id="Trips.List.Preview" defaultMessage="Preview" />
                          </Link>
                      </Button>
                    )
                  }
                    <Button type="primary" className="bnt" >
                      <Link to={'/dashboard/listing/'+item.id+'?step=1'} >
                        <FormattedMessage id="Trips.List.Edit" defaultMessage="Edit" />
                      </Link>
                    </Button>
                  </div>
                  <div className="item_delete">
                    <Popconfirm title="Are you sure delete this trip?" onConfirm={()=>{
                      _deleteTrip(item.authorId,item.id).then((res)=>{
                          console.log(res)
                          if (res.code===200) {
                            deleteTrip && deleteTrip(item.id)
                          }
                      })
                    }} onCancel={()=>{
                      return
                    }} okText="Yes" cancelText="No">
                      <Icon type="delete" />
                    </Popconfirm>

                  </div>
                </div>
              </div>
            </div>
          )
        })
      }
      </div>
    )
  }
}
function select(store){
  return {
    currency: store.Common.currency
  }
}
TripItem.propTypes = {
  intl: intlShape.isRequired
}
TripItem = injectIntl(TripItem)
TripItem = connect(select)(TripItem)
module.exports = TripItem;
