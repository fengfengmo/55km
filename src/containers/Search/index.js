/**
 * 列表页/搜索页
 */

import React from 'react';
import { connect } from 'react-redux'
import { Link,browserHistory } from 'react-router'
import { Tag,Icon,Button,Spin } from 'antd';
import ReactSwipe from 'components/ReactSwipe'
import SearchSide from 'components/SearchSide'
import TripItem from 'components/TripItem'
import moment from 'moment';
import { FormattedMessage } from 'react-intl'
import {getGrouptourAuthor} from 'actions/Trip'
import Helmet from "react-helmet"
import Affix from 'components/Affix'
import {_searchTrip,getActivitylabel} from 'api'
import {searchFilterToQuery,searchQueryToFilter,getFormat,getCurrencyPrice} from 'utils'
import {setResult} from 'actions/Search'
import{trackEvent} from 'actions/common'
import {config} from 'utils/config'
import styles from './index.scss'
const imgList=[
  'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485669826_c0ffp_a973c', //曼谷
  'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485669868_73e8j_68wvs', // 芭提雅
  'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485669906_h39dq_bpln3', // 普吉岛
  'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485669938_h19ci_qksap', // 清迈
  'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1496393491_pj6xi_w10ci', // 河内
]
const labelBgList ={
  'Temples':'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485755525_iqadh_ajmlp',
  'Floating Market':'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485755722_5ajeg_okb8v',
  'Shopping':'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485755756_xbmhq_vxp09',
  'Nature Scenery':'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485755788_ayf0j_6j835',
  'Night Bazaar':'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485756161_qjh32_t5doa',
  'Cooking Class':'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485756190_n0bw3_b34c8',
  'Cycling Party':'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485756223_qpvd4_m6wgj',
  'Others':'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485756260_6jj62_gy26e'
}
class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      isLoading: false,
      isInfiniteLoading:false,
      infiniteLoadBeginEdgeOffset:600, // undefined 取消无限滚动
      SwipesFun: null,
      SwipesLabelsShow: false,
      topBanner: 'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485669826_c0ffp_a973c',
      show_filter_moblie:false,
      activitylabel: [],
      filterDataX: {},
      searchCriteria: {}, //搜索条件
      resultsData: [],
      resultsHeaders:{},
      tagArray: [],
      reset: false,
      p: 1,
    }
  }
  componentWillMount (){
    // const {dispatch,userData} = this.props
    /**
     * 获取 Main activities
     * @type {[type]}
     */
    getActivitylabel().then((res)=>{
      this.setState({
        activitylabel: res
      })
    })
  }
  /**
   * 搜索
   */
   searchTrip (data,type) {
    const {dispatch} = this.props
    this.setState({
      searchCriteria: data,
      infiniteLoadBeginEdgeOffset:undefined,
    })
    if (type) {
      this.setState({
        infiniteLoadBeginEdgeOffset:600
      })
      this._onInfiniteLoad(data,type)
    }
    return false
    // 等待合并函数
    // this.setState({
    //   isLoading:true,
    //   isInfiniteLoading:true,
    // })
    // _searchTrip(data).then((res)=>{
    //   console.log(res)
    //   this.setState({
    //     isLoading: false,
    //     isInfiniteLoading: false,
    //     resultsData:res.data,
    //     p: parseInt(res.headers['x-page']), // 页
    //     resultsHeaders:res.headers,
    //     searchCriteria: data,
    //   })
    // })
  }
   /**
    * [数据加载 description]
    * @type {Boolean} 数据重置
    */
  _onInfiniteLoad (data,type) {
    const {filterData,dispatch,results} =this.props
    const {p,searchCriteria,isLoading} = this.state
    if (isLoading) {
      return
    }
    if (results.resultsData.length===parseInt(results.resultsHeaders['x-page-total']) && !type) {
      this.setState({
        infiniteLoadBeginEdgeOffset: undefined
      })
      return
    }
    this.setState({
      isLoading:true,
      infiniteLoadBeginEdgeOffset: 600,
      isInfiniteLoading:true
    })
    const searchData = data || searchCriteria
    // console.log(searchCriteria)
    // console.log(searchData)
    searchData.p = type && 1 || results.p
    if (type) {
      this.setState({
        reset:true
      })
    }
    searchData.size =results.size
    _searchTrip(searchData).then((res)=>{
      this.setState({
        reset:false,
        isLoading: false,
        isInfiniteLoading:false,
        resultsData:type && res.data || results.resultsData.concat(res.data),
        p: parseInt(res.headers['x-page']) +1, // 页
        resultsHeaders:res.headers,
        searchCriteria: searchData
      },()=>{
        if (res.data.length===0) {
          this.setState({
            infiniteLoadBeginEdgeOffset: undefined
          })
        }
        /**
         * 存入redux
         * @type {[type]}
         */
        dispatch(setResult({
          resultsData:this.state.resultsData,
          p: this.state.p, // 页
          size: results.size,
          resultsHeaders:this.state.resultsHeaders,
          searchUri:window.location.search
        }))
      })
    })
  }
   async _tagClose (index) {
    const {dispatch} = this.props
    let {tagArray,filterDataX} = this.state
    let items = null
    let {filterData} = this.props

    if (index==='all') {
      filterData['destination'] = null
      filterData['language'] = null
      filterData['title'] = null
      filterData['startTime'] = null
      filterData['lowerPrice'] = null
      filterData['upperPrice'] = null
      filterData['label'] = null
      filterData['tourSpan'] = null
      filterData['startHour'] = null
      filterData['endHour'] = null
      filterData['transportation'] = null
      filterData['maximumNumber'] = null

      await dispatch({
          type: 'SET_FILTER_DATA',
          data: filterData
      })
      this.setState({
       tagArray:[],
       filterDataX:filterData
      },()=>{
       this._browserHistory()
      })
    }else{
      const delItem = tagArray.filter(item => parseInt(item.index) === index)
      items = tagArray.filter(item => parseInt(item.index) !== index)
      for (var i = 0; i < delItem.length; i++) {
        if (delItem[i].tourSpan) {
          let newTourSpan = filterData.tourSpan.filter((item)=>{
            return delItem[i].title !==item.title
          }) || []
          filterData.tourSpan = newTourSpan
        }else{
          filterData[delItem[i].id] = null
        }
      }
      dispatch({
          type: 'SET_FILTER_DATA',
          data: filterData
      })
      this.setState({
       tagArray:[
         ...items,
       ],
       filterDataX:filterData
      },()=>{
       this._browserHistory()
      })
    }
   }
   _setTag(data){
     const {tagArray} = this.state
     const {currency} = this.props
     let newTag = []
     if (data.title) {
       newTag.push({
         id: 'title',
         index: tagArray.length+ newTag.length,
         title:data.title
       })
     }
     if (data.tourSpan) {
       Array.from(data.tourSpan,(item,index)=>{
          newTag.push({
            id: 'tourSpan'+index,
            tourSpan:true,
            formattedId:'Search.',
            formattedMessage:true,
            index: tagArray.length+ newTag.length,
            title: item.title
          })
       })
     }
      this.setState({
       SwipesLabelsShow: false
     })
     if (data.destination  && data.destination !=='Any') {
       newTag.push({
         id: 'destination',
         formattedId:'Destination.',
         formattedMessage:true,
         index: tagArray.length + newTag.length,
         title:data.destination
       })
       if (data.destination ==='Bangkok') {
         this.setState({
           topBanner: imgList[0],
           SwipesLabelsShow:true
         })
       }
       if (data.destination ==='Chiang Mai') {
         this.setState({
           topBanner: imgList[3],
           SwipesLabelsShow:true
         })
       }
       if (data.destination ==='Phuket Island') {
         this.setState({
           topBanner: imgList[2]
         })
       }
       if (data.destination ==='Pattaya') {
         this.setState({
           topBanner: imgList[1]
         })
       }
       if (data.destination ==='Hanoi') {
         this.setState({
           topBanner: imgList[4]
         })
       }
     }
     if (data.language) {
       newTag.push({
         id: 'language',
         formattedId:'Search.',
         formattedMessage:true,
         index: tagArray.length + newTag.length,
         title:data.language
       })
     }
     if (data.startHour) {
       let title = null
       if (data.startHour=== 1 && data.endHour=== 10) {
         title = 'Early bird'
       }
       if (data.startHour=== 10 && data.endHour=== 18) {
         title = 'Sleep in'
       }
       if (data.startHour=== 18 && data.endHour=== 24) {
         title = 'Night owl'
       }
       if (title) {
         newTag.push({
           id: 'startHour',
           formattedId:'Search.',
           formattedMessage:true,
           index: tagArray.length + newTag.length,
           title:title
         })
       }

     }

     if (data.transportation) {
       newTag.push({
         id: 'transportation',
         formattedId:'Transportation.',
         formattedMessage:true,
         index: tagArray.length+ newTag.length,
         title: data.transportation
       })
     }
    //  if (data.maximumNumber) {
    //    newTag.push({
    //      index: tagArray.length+ newTag.length,
    //      title:data.maximumNumber
    //    })
    //  }
     if (data.startTime) {
       newTag.push({
         id: 'startTime',
         index: tagArray.length+ newTag.length,
         title: moment(data.startTime).format(getFormat(false))
       })
     }
     if (data.lowerPrice && data.upperPrice) {
       newTag.push({
         id: 'lowerPrice',
         index: tagArray.length+ newTag.length,
         lowerPrice:data.lowerPrice,
         upperPrice:data.upperPrice,
         title: data.lowerPrice + '~' + data.upperPrice
       })
     }
     if (data.label ) {
       newTag.push({
         id: 'label',
         formattedId:'Label.',
         formattedMessage:true,
         index: tagArray.length + newTag.length,
         title: data.label
       })
     }
     this.setState({
       tagArray:[
         ...newTag,
       ]
     })
   }
   /**
    * 标签渲染
    */
  _renderTag () {
    const {tagArray} = this.state
    const {currency} = this.props
    let data = []
    data = tagArray && tagArray.map((item,index)=>{
        return (<Tag key={item.index} closable afterClose={()=>{
          this._tagClose(item.index)
          }}>
          {
            item.formattedMessage && <FormattedMessage id={item.formattedId+item.title} defaultMessage={item.title} />|| item.id==='lowerPrice' && (<FormattedMessage id={'Common.Currencies2.'+currency} defaultMessage={`{num1}`+ `~`+`{num1}`+currency} values={{num1:getCurrencyPrice(item.lowerPrice,currency),num2:getCurrencyPrice(item.upperPrice,currency)}} />) ||  (item.title)
          }
          </Tag>
        )
      })
      if (tagArray && tagArray.length>0) {
        data.push(<span className="clear_all" onClick={()=>{
          this._tagClose('all')
        }} ><FormattedMessage  id={'Search.Clear all'} defaultMessage='Clear all' /></span>)
      }
    return  data
  }
   _setlabel (value) {
     const {filterData,dispatch} =this.props
     /**
      * 快速选择 条件重置
      */
     filterData['label'] = value
     dispatch({
         type: 'SET_FILTER_DATA',
         data: filterData
     })
     this.setState({
       filterDataX:filterData
     },()=>{
       this._browserHistory()
     })
   }
   _browserHistory () {
     const uri= searchFilterToQuery(this.props.filterData)
     browserHistory.push(uri)
   }
   /**
    * 渲染横向分类按钮
    */
   _SwipesLabels(){
     const {SwipesFun,activitylabel,SwipesLabelsShow} = this.state
     if (!SwipesLabelsShow) {
       return null
     }
     const opt = {
       distance: 175, // 每次移动的距离，卡片的真实宽度
       getSwipes: (swipes)=>{
         this.setState({
           SwipesFun: swipes
         })
       }
     }
     return (
       <div className="max_width label_choose_wrapout">
         <div className="label_item_bnt label_item_prev" onClick={()=>{
           SwipesFun && SwipesFun.toPrev()
         }}></div>
         {
           activitylabel.length > 0 && (
             <div className="label_choose_wrap">
               <ReactSwipe className="label_slide clearafter" options={opt}>
                 {
                    activitylabel.map((item,index)=>{
                     return (<div className="label_item_wrap" key={index} onClick={()=>{
                       trackEvent('用户行为','label',item.name)
                       this._setlabel(item.name)
                     }}>
                     <img src={labelBgList[item.name]+'?imageView2/3/format/jpg'} />
                       <div className="label_item">
                         <Icon type={item.name} />
                         <div><FormattedMessage
                           id={'Label.'+item.name}
                           defaultMessage={item.name}
                           /></div>
                       </div>
                     </div>)
                   })
                 }
               </ReactSwipe>
             </div>
           )
         }
         <div className="label_item_bnt label_item_next" onClick={()=>{
           SwipesFun && SwipesFun.toNext()
         }}></div>
       </div>
     )
   }

  render() {
    const {currency,filterData,locale,results} = this.props
    const {tagArray,show_filter_moblie,topBanner,isLoading,isInfiniteLoading,reset,infiniteLoadBeginEdgeOffset} =this.state
    const _className = show_filter_moblie && 'search_side_wrap search_side_wrap_moblie' || 'search_side_wrap'
    const _num = results.resultsHeaders['x-page-total'] || 0
    const offsetHeight = window.innerHeight - 88
    return (
      <div className="search_wrap">
        <Helmet
          htmlAttributes={{lang: locale}}
          title={config.title[locale]}
        />
        <Spin spinning={isLoading} delay={500}/>
        <div className="search_top" >
           <img src={topBanner+'?imageView2/3/format/jpg'}/>
           {
             filterData.destination && (<FormattedMessage id={'Destination.'+filterData.destination} defaultMessage={filterData.destination} />)
           }

        </div>
        <div className="tag_wrap">
          <div className="tag_main max_width">
            <span className="tag_total">
              <FormattedMessage
                id={'Search.results'}
                defaultMessage={`{num} results`}
                values={{num: _num}}
                />
            </span>
            {
              this._renderTag()
            }

          </div>
        </div>
        {
          // 标签注视
          // this._SwipesLabels()
        }
         <div className="max_width flex" >
           <div className={_className} ref={component => this._search_side_wrap = component}>
            <Affix
            offsetTop={88}
            offsetHeight={offsetHeight}
            targetWrap={() => {
              if (this._search_side_wrap) {
                return this._search_side_wrap
              }
              //return window
            }}
            >
             <SearchSide {...this.props}
                onSearch={(data,type)=>{
                  this._setTag(data)
                  this.searchTrip(data,type)
               }}
              />
            </Affix>
            <div className="apply_filter_moblie">
              <Button type="primary" size="large" onClick={()=>{
                this.setState({
                  show_filter_moblie: false
                })
              }} >
              <FormattedMessage id={'Search.Apply Filter'} defaultMessage={'Apply Filter'}/>
              </Button>
            </div>
           </div>
           <div className="search_right">
           <TripItem
                itemlist={results.resultsData}
                infiniteLoadBeginEdgeOffset={infiniteLoadBeginEdgeOffset}
                type="search"
                isInfiniteLoading={isInfiniteLoading}
                onInfiniteLoad={()=>{
                  this._onInfiniteLoad()
                }}
                />

           </div>
         </div>
         <div className="show_filter_moblie">
           <Button type="primary" size="large" onClick={()=>{
             this.setState({
               show_filter_moblie: true
             })
           }} >
            <FormattedMessage id={'Search.Show Filter'} defaultMessage={'Show Filter'}/>
           </Button>
         </div>
      </div>
    )
  }
}

function select(store){
  return {
    userData: store.User.userData,
    currency: store.Common.currency,
    locale: store.Common.locale,
    filterData: store.Search.filterData,
    results:store.Search.results
  }
}
Search = connect(select)(Search)
module.exports = Search;
