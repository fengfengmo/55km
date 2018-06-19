import React from 'react';
import { connect } from 'react-redux'
import { Link,browserHistory } from 'react-router'
import { Input,Select,Slider,Checkbox,Radio} from 'antd'
import Affix from 'components/Affix'
import moment from 'moment';
import Calendar from 'components/Calendar'
import styles from './index.scss'
import {searchFilterToQuery,searchQueryToFilter,groupDestinations,sortByBestinations,maximumNumber,getCurrencyPrice,tourSpanData} from 'utils/'
import { FormattedMessage,injectIntl,intlShape } from 'react-intl'
const Option = Select.Option
const OptGroup = Select.OptGroup
const Search = Input.Search
const CheckboxGroup = Checkbox.Group;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class SearchSide extends React.Component {
  constructor(...args) {
    super(...args);
    this.state={
      offsetTop: 98,
      offsetBottom: false,
      container: null,
      scrollTimeout:null,
      keyword: '',
      tourSpan:[],
      filterDataX:{
        "title":"",
        "label": "",
        "startTime":'',
        "lowerPrice":'',
        "upperPrice":'',
        "language":"",
        "transportation":"",
        "maximumNumber":null,
        "startHour":'',
        "endHour":'',
        tourSpan:[]
      }
    }
  }
  componentDidMount (){
    const {location,params } = this.props
    // console.log(this.props)
    const data = searchQueryToFilter(location.query)
    data.destination  = params.destination  || ''
    if (data.destination ==='Any') {
      data.destination =''
    }
    if (data.tourSpan || data.tourSpan.length!==0) {
      const tourSpan =  Array.from(data.tourSpan,(item2)=>{
        return item2.title
      })
      this.setState({
        tourSpan
      })
    }
    if (location.action==='PUSH') {
      this._setFilter(data,true)
    }else{
      this._setFilter(data)
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const {location,params } = nextProps
    if (location.search!==this.props.location.search || location.pathname!==this.props.location.pathname) {
      // console.log(location.query)
      let data = searchQueryToFilter(location.query)
      data.destination  = params.destination  || ''
      if (data.destination ==='Any') {
        data.destination =''
      }
      if (data.tourSpan) {
        const tourSpan =  Array.from(data.tourSpan,(item2)=>{
          return item2.title
        })
        this.setState({
          tourSpan
        })
      }
      this._setFilter(data,true)
    }
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
   _setFilter (data,type) {
    const {filterData} =this.props
    const {onSearch,dispatch} = this.props
    // data.isLoading = true
    this.setState({
      filterDataX:{
        ...filterData,
        ...data,
      },
      keyword: data.title
    },()=>{
      // data.p = 1
      // data.size = 30
      dispatch({
					type: 'SET_FILTER_DATA',
					data: data
			})
      onSearch && onSearch(data,type)
    })
  }
  /**
   * _durationCheck
   */
  _durationCheck (value) {
    let tourSpan = []
    value.map((item,index)=>{
      tourSpan.push(tourSpanData.filter((item2,index)=>{
        return item2.title ===item
      })[0])
    })
    this.setState({
      tourSpan:value
    })
    this._newFilter('tourSpan',tourSpan)
  }
  /**
   * 快速选择 条件重置
   */
  _quickSortChange (value){
    this.setState({
      quickSort:value || null
    })
    switch (value) {
      case 'Early bird':
        // this._newFilter ('startHour',0,'quickSort')
        this._newFilter ('Early',0,'quickSort')
        break;
      case 'Sleep in':
        this._newFilter ('Sleep',0,'quickSort')
        break;
      case 'Chinese':
        this._newFilter ('language','Chinese','quickSort')
        break;
      case 'English':
        this._newFilter ('language','English','quickSort')
        break;
      case 'Night owl':
        this._newFilter ('Night',0,'quickSort')
        break;
      case 'Private car':
        this._newFilter ('transportation','Car','quickSort')
        break;
      default:
        this._newFilter (null,null,'quickSort')
        break;
    }
  }
  /**
   * 处理搜索条件
   */
    _newFilter (title,value,type) {
    const {filterData,dispatch,scrollTimeout} =this.props
    if (scrollTimeout) {
      clearTimeout(this.state.scrollTimeout)
    }

    /**
     * 快速选择 条件重置
     */
    let newFilterData =filterData
    if (type==='quickSort') {
      newFilterData['startHour'] = null
      newFilterData['language'] = null
      newFilterData['endHour'] = null
    }
    if (title) {
      if (title==='Early') {
        newFilterData['startHour'] = 1
        newFilterData['endHour'] = 10
      }else if (title==='Sleep') {
        newFilterData['startHour'] = 10
        newFilterData['endHour'] = 18
      }else if (title==='Night') {
        newFilterData['startHour'] = 18
        newFilterData['endHour'] = 24
      }else{
        newFilterData[title] = value
      }
    }
    //console.log('SET_FILTER_DATA2')
     dispatch({
      type: 'SET_FILTER_DATA',
      data: newFilterData
    })
    /**
     * webkit 无限滚动错位
     */
    this.setState({
      filterDataX:newFilterData
    },()=>{

      //scrollTimeout = window.setTimeout(()=>{
        this._browserHistory()
      //},120)
    })

  }

  /**
   * go
   */
  _browserHistory () {
    const uri= searchFilterToQuery(this.props.filterData)
    console.log(uri)
    browserHistory.push(uri)
  }
  /**
   * 标签价格
   */
  formatter (value){
    const {currency} = this.props
    return getCurrencyPrice(value,currency)+currency
  }
  render() {
    const offsetHeight = document.body.offsetHeight - 88
    const {offsetTop,offsetBottom,filterDataX,tourSpan,quickSort} =this.state
    const {filterData,dispatch,intl} =this.props
    const placeholder = intl.formatMessage({id:"Search.Trip date", defaultMessage: "Trip date"})
    // const label1 =
    const DurationCheck = [
      { label: (<FormattedMessage id={'Search.hrs'}  defaultMessage={`{num} hrs`}  values={{num: '2-3'}}/>), value: '2-3hrs' },
      { label: (<FormattedMessage id={'Search.hrs'}  defaultMessage={`{num} hrs`}  values={{num: '4-6'}}/>), value: '4-6hrs' },
      { label: (<FormattedMessage id={'Search.hrs'}  defaultMessage={`{num} hrs`}  values={{num: '7-9'}}/>), value: '7-9hrs' },
      { label: (<FormattedMessage id={'Search.+hrs'}  defaultMessage={`{num}+hrs`}  values={{num: '10'}}/>), value: '10hrs' },
    ];
    const QuickSortCheck = [
      { label: (<FormattedMessage id={'Search.Early bird'}  defaultMessage={`Early bird`}/>), value: 'Early bird' },
      { label: (<FormattedMessage id={'Search.Sleep in'}  defaultMessage={`Sleep in`}/>), value: 'Sleep in' },
      { label: (<FormattedMessage id={'Search.Night owl'}  defaultMessage={`Night owl`}/>), value: 'Night owl' },
      { label: (<FormattedMessage id={'Search.Private car'}  defaultMessage={`Private car`}/>), value: 'Private car' },
      { label: (<FormattedMessage id={'Search.Chinese'}  defaultMessage={`Chinese`}/>), value: 'Chinese' },
      { label: (<FormattedMessage id={'Search.English'}  defaultMessage={`English`}/>), value: 'English' }
    ];
    return (
        <div className="search_side"
          style={{
            height: offsetHeight
            }} >
          <div className="search_item_title"><FormattedMessage id={'Search.Filter'} defaultMessage='Filter' /></div>
          <div className="search_item">
            <Search placeholder="Key word"
              value={this.state.keyword}
              defaultValue={filterData.title}
              onSearch={value => {
                this._newFilter('title',value)
              }}
              onChange={e => {
                this.setState({
                  keyword: e.target.value
                })
              }}
              size="large"/>
          </div>
          <div className="search_item">
            {<Select  allowClear size="large"   value={filterData.destination} onChange={(value)=>{
                this._newFilter('destination',value)
              }}>
              {this.getDestinations()}
            </Select>}
          </div>
          <div className="search_item">
            <Calendar type={'input'}
            placeholder={placeholder}
            value={filterData.startTime} onSelect={(value)=>{
                const data = moment(value).unix()*1000
                this._newFilter('startTime',data)
              }}/>
          </div>
          <div className="search_item">
            <Select allowClear size="large" value={filterData.maximumNumber} placeholder="Maximum travelers" onChange={(value)=>{
                this._newFilter('maximumNumber',value)
              }}>
              {
                maximumNumber.map((item,index)=>{
                  return (<Option value={item} key={index}>{item}</Option>)
                })
              }
            </Select>
          </div>
          <div className="search_item">
            <div className="search_item_title"><FormattedMessage id={'Search.Price range'} defaultMessage='Price range' /></div>
            <Slider min={1} max={15000} tipFormatter={(value)=>this.formatter(value)} range step={1} value={[filterDataX.lowerPrice, filterDataX.upperPrice]}
            onChange={(value)=>{
              this.setState({
                filterDataX:{
                  ...filterData,
                  lowerPrice: value[0],
                  upperPrice: value[1]
                }
              })
            }}
            onAfterChange={(value)=>{
                //console.log(value)
                this._newFilter('lowerPrice',value[0])
                this._newFilter('upperPrice',value[1])
              }}/>
          </div>
          <div className="search_item search_item_affix">
            <div className="search_item_title"><FormattedMessage id={'Search.Duration'} defaultMessage='Duration' /></div>
            <CheckboxGroup options={DurationCheck} value={tourSpan} onChange={(value)=>{
              this._durationCheck(value)
            }}/>
          </div>
          <div className="search_item search_item_affix">
            <div className="search_item_title"><FormattedMessage id={'Search.Quick Sort'} defaultMessage='Quick Sort' /></div>
              <RadioGroup  size="large"
              value={quickSort}
              onChange={(value)=>{
                this._quickSortChange(value.target.value)
              }}>
                {
                  QuickSortCheck.map((item,index)=>{
                    return (<RadioButton value={item.value} key={index}
                              onClick={()=>{
                                if (quickSort===item.value) {
                                  this._quickSortChange()
                                }
                              }}>{item.label}</RadioButton>)
                  })
                }
              </RadioGroup>
          </div>
        </div>
    )
  }
}
function select(store){
  return {
    filterData: store.Search.filterData,
    currency: store.Common.currency
  }
}
SearchSide.propTypes = {
  intl: intlShape.isRequired
}
SearchSide = injectIntl(SearchSide)
SearchSide = connect(select)(SearchSide)
module.exports = SearchSide;
