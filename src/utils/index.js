/**
 * by minh8023 2017/01/06
 * 公共函数
 */

const utils = {
  isMobile(){
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    return true
    }
    return false
  },
 	/**
 	 *浏览器语言
 	 */
  navigatorLanguage (){
    let lang = navigator.language
    if(!lang)
      lang = navigator.browserLanguage;
    return lang && lang.substr(0,2) || 'zh'
  },
  /**
   * es7 兼容问题 includes 换成 indexOf
   */
  _includes(array,data) {
    return (array.indexOf(data)>=0)
  },
 	maximumNumber: [1,2,3,4,5,6,7,8],
  hours:['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '00', '01', '02', '03', '04', '05', '06', '07'],
  minutes: ['00', '15', '30', '45'],
  tourSpanData: [{
    title:'2-3hrs',
    lowerTourSpan:2,
    upperTourSpan:3,
  },{
    title:'4-6hrs',
    lowerTourSpan:4,
    upperTourSpan:6,
  },
  {
    title:'7-9hrs',
    lowerTourSpan:7,
    upperTourSpan:9,
  },
  {
    title:'10hrs',
    lowerTourSpan:10,
    upperTourSpan:100,
  }],
  getFormat(time) {
    return time ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
  },
  searchQueryToFilter (query={}){
    if (query.startTime) {
      query.startTime = parseInt(query.startTime)
    }
    if(query.maximumNumber){
      query.maximumNumber = parseInt(query.maximumNumber)
    }
    if (query.lowerPrice) {
      query.lowerPrice = parseInt(query.lowerPrice)
    }
    if (query.upperPrice) {
      query.upperPrice = parseInt(query.upperPrice)
    }
    if (query.startHour) {
      query.startHour = parseInt(query.startHour)
    }
    if (query.endHour) {
      query.endHour = parseInt(query.endHour)
    }
    if (query.tourSpan) {
      let tourSpan = []
      Array.from(query.tourSpan.split(","),(item,index)=>{
        let x = utils.tourSpanData.filter((item2)=>{
            return item === item2.title
        })
        if (x && x[0]) {
          tourSpan.push(x[0])
        }
      })
      query.tourSpan = tourSpan
    }
    let filter = {
      // "title":"",
      // "label": "",
      // "startTime":'',
      // "lowerPrice":'',
      // "upperPrice":'',
      // "language":"en",
      // "transportation":'',
      // "maximumNumber":'',
      // "startHour":'',
      // "endHour":'',
      ...query,
      tourSpan: query.tourSpan || []
    }
    // console.log(filter)
    return filter
  },
  searchFilterToQuery (filter){
    let uri ='/search/'
    let query = [];
    if (filter.title) {
      query.push('title=' + encodeURIComponent(filter.title))
    }
    if (filter.label) {
      query.push('label=' + encodeURIComponent(filter.label))
    }
    if (filter.startTime) {
      query.push('startTime=' + filter.startTime)
    }
    if (filter.maximumNumber) {
      query.push('maximumNumber=' + filter.maximumNumber)
    }
    if (filter.lowerPrice) {
      query.push('lowerPrice=' + filter.lowerPrice)
    }
    if (filter.upperPrice) {
      query.push('upperPrice=' + filter.upperPrice)
    }
    if (filter.language) {
      query.push('language=' + filter.language)
    }
    if (filter.startHour) {
      query.push('startHour=' + filter.startHour)
    }
    if (filter.endHour) {
      query.push('endHour=' + filter.endHour)
    }
    if (filter.transportation) {
      query.push('transportation=' + filter.transportation)
    }
    if (filter.tourSpan) {
      let tourSpan = Array.from(filter.tourSpan,(item,index)=>{
        return item.title
      }).join(",")
      //console.log(x)
      query.push('tourSpan=' + tourSpan)
    }
    uri += filter.destination || 'Any';
    if (query.length > 0) {
      uri += '?' + query.join('&');
    }
    return uri
  },
  /**
   * 手机号 +验证规则 参考淘宝注册
   */
  mobile_area:[
    {
      code:86, //大陆
      desp:"CN",
      pattern:"^(86){0,1}1\d{10}$"
    },
    {
      code:66, // 泰国
      desp:"TH",
      pattern:"^(00){0,1}(66){1}[13456789]\d{7,8}$"
    },
    {
      code:84, // 越南
      desp:"VN",
      pattern:"^(00){0,1}(84){1}[1-9]\d{6,9}$"
    },
    {
      code:65, // 新加坡
      desp:"SG",
      pattern:"^(00){0,1}(65){1}[13689]\d{6,7}$"
    },
    {
      code:60, // 马来西亚
      desp:"MY",
      pattern:"^(00){0,1}(60){1}1\d{8,9}$"
    },
    {
      code:62, // 印度尼西亚
      desp:"ID",
      pattern:"^(00){0,1}(62){1}[2-9]\d{7,11}$"
    },
    {
      code:81, // 日本
      desp:"JP",
      pattern:"^(00){0,1}(81){1}0{0,1}[7,8,9](?:\d{8}|\d{9})$"
    }
  ],
  /**
   * 汇率
   * @type {Object}
   */
  exchangeRates: {
    "EUR": 0.02665,
    "ZAR": 0.38431,
    "USD": 0.02892,
    "TRY": 0.10675,
    "SGD": 0.040358,
    "SEK": 0.25272,
    "RUB": 1.6834,
    "RON": 0.11998,
    "PLN": 0.11654,
    "PHP": 1.4105,
    "NZD": 0.039751,
    "NOK": 0.24133,
    "MYR": 0.12609,
    "MXN": 0.60969,
    "KRW": 33.408,
    "JPY": 3.2222,
    "INR": 1.9232,
    "ILS": 0.10806,
    "IDR": 377.36,
    "HUF": 8.1916,
    "HRK": 0.20072,
    "HKD": 0.21895,
    "GBP": 0.0234,
    "DKK": 0.19817,
    "CZK": 0.7201,
    "CNY": 0.200,
    "VND": 656.7466,
    "CHF": 0.028539,
    "CAD": 0.037115,
    "BRL": 0.090955,
    "BGN": 0.052121,
    "AUD": 0.037768
  },
  /**
   * 货币
   * @type {Array}
   */
  currencies:[
    // {
    //   value: 'USD',
    //   label: 'US Dollar'
    // }, {
    //   value: 'EUR',
    //   label: 'EU Euro'
    // }, {
    //   value: 'GBP',
    //   label: 'British Pound'
    // },
    {
      value: 'USD',
      label: 'US Dollar'
    },
    {
      value: 'CNY',
      label: 'Chinese Yuan'
    },
     {
      value: 'JPY',
      label: 'Japanese Yen'
    },
    {
      value: 'SGD',
      label: 'Singapore Dollar'
    },
    //{
    //   value: 'AUD',
    //   label: 'Australian Dollar'
    // }, {
    //   value: 'HKD',
    //   label: 'Hongkong Dollar'
    // }, {
    //   value: 'SEK',
    //   label: 'Swedish Krona'
    // }, {
    //   value: 'NOK',
    //   label: 'Norwegian Krone'
    // }, {
    //   value: 'CHF',
    //   label: 'Swiss Franc'
    // }, {
    //   value: 'RUB',
    //   label: 'Russian Ruble'
    // },
    {
      value: 'MYR',
      label: 'Malaysian Ringgit'
    },
    {
      value: 'THB',
      label: 'Thai Baht'
    },
    {
      value: 'VND',
      label: 'Vietnam Dong'
    }
  ],
  /**
   * 导航
   * @type {Array}
   */
  dashboard_item: [
    {
      id: 0,
      title: 'Dashboard',
      subtitle: 'Dashboard',
      icon: 'message_sys',
      uri:'/dashboard',
    },
    {
      id: 1,
      title: 'Inbox',
      subtitle: 'Messages',
      icon: 'message_sys',
      uri:'/dashboard/inbox'
    },
    {
      id: 2,
      title: 'Wallet',
      subtitle: 'Total',
      icon: 'wallet',
      uri:'/dashboard/wallet/general'
    },{
      id: 3,
      title: 'Your Trips',
      subtitle: 'Orders',
      icon: 'order',
      uri:'/dashboard/booking'
    },
    {
      id: 4,
      title: 'Verifications',
      subtitle: 'Verified',
      icon: 'verification',
      uri:'/dashboard/verifications'
    },
    {
      id: 5,
      title: 'Your Listing',
      subtitle: 'Trips',
      icon: 'list_trip',
      uri:'/dashboard/listing'
    },{
      id: 6,
      title: 'Calendar',
      subtitle: 'Manage Availability',
      icon: 'calendar',
      uri:'/dashboard/calendar'
    },
    {
      id: 7,
      title: 'Setting',
      subtitle: 'Change setting',
      icon: 'sys',
      uri:'/dashboard/setting'
    },
    {
      id: 8,
      title: 'Help',
      subtitle: 'Use guide',
      icon: 'help_cen',
      uri:'/help'
    },
    {
      id: 9,
      title: 'Log Out',
      subtitle: 'Log Out',
      icon: 'logout',
      uri:'/'
    }
  ],
  /**
   * 目的地
   * @type {Array}
   */
   destinations: [
     {
        "city": "Hanoi",
        "region": "Vietnam",
        "country": "Vietnam",
        "popular": true,
        sort: 6
      },
      {
        "city": "Halong Bay",
        "region": "Vietnam"
      },
      {
        "city": "Singapore",
        "region": "Singapore",
        "popular": true,
        sort: 8
      },
      {
        "city": "Kuala Lumpur",
        "region": "Malaysia",
        "country": "Malaysia",
        "popular": true,
        sort: 10
      },
      {
        "city": "Melaka",
        "region": "Malaysia",
        "country": "Malaysia",
        "popular": true,
        sort: 11
      },
      {
        "city": "Sabah",
        "region": "Malaysia",
        "country": "Malaysia",
        "popular": true,
        sort: 12
      },
      {
        "city": "Kota Kinabalu",
        "region": "Malaysia"
      },
      {
        "city": "Penang",
        "region": "Malaysia"
      },
      {
        "city": "Pulau Langkawi",
        "region": "Malaysia"
      },
      {
        "city": "Semporna",
        "region": "Malaysia"
      },
      {
        "city": "Kota Bharu",
        "region": "Malaysia"
      },
      {
        "city": "Tawau",
        "region": "Malaysia"
      },
      {
        "city": "Johor Bahru",
        "region": "Malaysia"
      },
      {
        "city": "Pulau Redang",
        "region": "Malaysia"
      },
      {
        "city": "Tioman Island",
        "region": "Malaysia"
      },
      {
        "city": "Pangkor",
        "region": "Malaysia"
      },
      {
        "city": "Jakarta",
        "region": "Indonesia",
        "country": "Indonesia",
        "popular": true,
        sort: 9
      },
      {
        "city": "Bali",
        "region": "Indonesia",
        "country": "Indonesia",
        "popular": true,
        sort: 8
      },
      {
        "city": "Ubud",
        "region": "Indonesia"
      },
      {
        "city": "Kuta",
        "region": "Indonesia"
      },
      {
        "city": "Denpasar",
        "region": "Indonesia"
      },
      {
        "city": "Jimbaran",
        "region": "Indonesia"
      },
      {
        "city": "Lembongan",
        "region": "Indonesia"
      },
      {
        "city": "Yogyakarta",
        "region": "Indonesia"
      },
      {
        "city": "Bintan Island",
        "region": "Indonesia"
      },
      {
        "city": "Uluwatu",
        "region": "Indonesia"
      },
      {
        "city": "Bandung",
        "region": "Indonesia"
      },
      {
        "city": "Da Nang",
        "region": "Vietnam"
      },
      {
        "city": "Hue",
        "region": "Vietnam"
      },
      {
        "city": "Hoi An",
        "region": "Vietnam"
      },
      {
        "city": "Nha Trang",
        "region": "Vietnam",
        "country": "Vietnam",
        "popular": true,
        sort: 5
      },
      {
        "city": "Da Lat",
        "region": "Vietnam"
      },
      {
        "city": "Miny",
        "region": "Vietnam"
      },
      {
        "city": "Ho Chi Minh City",
        "region": "Vietnam",
        "country": "Vietnam",
        "popular": true,
        sort: 7
      },
        // {
        //     "city": "Tokyo",
        //     "region": "Japan"
        // },
        // {
        //     "city": "Kyoto",
        //     "region": "Japan"
        // },
        // {
        //     "city": "Hokkaido",
        //     "region": "Japan"
        // },
        {
           "city": "Bangkok",
           "region": "Thailand",
           "country": "Thailand",
           "popular": true,
           sort: 2
       },
       {
           "city": "Chiang Mai",
           "region": "Thailand",
           "country": "Thailand",
           "popular": true,
           sort: 3
       },
       {
           "city": "Pattaya",
           "region": "Thailand",
           "country": "Thailand",
           "popular": true,
           sort: 4
       },
       {
           "city": "Phuket Island",
           "region": "Thailand",
           "country": "Thailand",
           "popular": true,
           sort: 1
       },
       {
           "city": "Ayutthaya",
           "region": "Thailand"
       },
       {
           "city": "Chiang Rai",
           "region": "Thailand"
       },
       {
           "city": "Krabi",
           "region": "Thailand"
       },
       {
           "city": "Hua Hin",
           "region": "Thailand"
       },
       {
         "city": "Kanchanaburi",
           "region": "Thailand"
       },
       {
           "city": "LamPang",
           "region": "Thailand"
       },
       {
           "city": "Pai",
           "region": "Thailand"
       },
             {
           "city": "Chiang Dao",
           "region": "Thailand"
       },
       {
           "city": "Ko Samui",
           "region": "Thailand"
       },
         {
           "city": "Songkhram",
           "region": "Thailand"
       },
 ],
  /**
   * 目的地分组
   */
  groupDestinations (key='region'){
    /**
     * 热门目的地
     * @type {[type]}
     */
    const popular = utils.destinations.filter(function (item) {
      return item.popular;
    })
    popular.sort(utils.sortByCities1);
    /**
     * 普通目的地
     * @type {[type]}
     */
    // const destinations = utils.destinations.filter(function (item) {
    //   return !item.popular
    // }).reduce(function (prev, cur) {
    //   if (!prev[cur[key]]) {
    //     prev[cur[key]] = []
    //   }
    //   prev[cur[key]].push(cur)
    //   return prev;
    // }, {})

    const destinations = utils.destinations.reduce(function (prev, cur) {
      if (!prev[cur[key]]) {
        prev[cur[key]] = []
      }
      prev[cur[key]].push(cur)
      return prev;
    }, {})

    Object.keys(destinations).map((item)=>{
      destinations[item].sort(utils.sortByCities)
    })

    // const newpopular = popular.length > 0 ? Object.defineProperty({}, 'Popular Cities', {value:popular}) : {};
    const data = {
      'The Most Popular Cities': popular.length > 0 && popular || [],
      // ...destinations,
      Thailand: destinations['Thailand'],
      Vietnam: destinations['Vietnam'],
      Singapore: destinations['Singapore'],
      Malaysia: destinations['Malaysia'],
      Indonesia: destinations['Indonesia'],
    //  'Japan': destinations['Japan']
    }
    //console.log(data)
    return data
  },
  sortByBestinations (a,b){
    // if (a === 'Japan' || a === 'Vietnam') return 1
    return 0
  },
  /**
   * 城市排序
   * @type {[type]}
   */
  sortByCities(a, b) {
    if (a.city === 'Bangkok') return -1;
    if (a.city < b.city) return -1;
    if (a.city > b.city) return 1;
    return 0;
  },
  sortByCities1(a, b) {
    if (a.sort < b.sort) return -1;
    if (a.sort > b.sort) return 1;

    return 0;
  },
  /**
   * 价格显示
   */
   commaize(num) {
     return (num ? num : 0).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
   },
   commaizeInt(num) {
     return (num ? num : 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
   },
  /**
   * 显示价格
   */
  getDisplayPrice (priceInfo,basePrice,guestNum,type) {
    let price
    // 走阶梯价格
    if (priceInfo && priceInfo.length>0) {
      // 总价
      price = priceInfo.filter(item => parseInt(item.title) === guestNum)[0].description
      if (type) {
        // 单价
        price =  parseInt(price)/guestNum
      }
    }else{
      // 总价
      price = basePrice * guestNum //基础价格 *人数
      if (type) {
        // 单价
        price =  basePrice
      }
    }
    if (!price && basePrice) {
      price = basePrice
    }

    return price
  },
  /**
   * 最低价格 返回价格或者人数
   * type true 返回人数
   */
  getMinimumPrice (priceInfo,basePrice,type) {
    let price = 0
    let guestNum = 1
    let priceArr = []
    let guestNumArr = []
    if (priceInfo && priceInfo.length>0) {
      priceInfo.map((itemx,index)=>{
        const x = parseFloat(itemx.description)  / parseInt(itemx.title)
        priceArr.push(x)
        guestNumArr.push({
          guestNum: parseInt(itemx.title),
          description: x
        })
      })
      price = Math.min.apply(null,priceArr)
      if (price) {
        guestNum = guestNumArr.filter(item => parseInt(item.description) === parseInt(price))[0].guestNum
      }
    }else{
      /**
       * 没有阶梯价格显示基础价格
       * @type {[type]}
       */
      price = basePrice
    }

    if (!price && basePrice) {
      price = basePrice
    }
    if (type) {
      return guestNum
    }
    return (price)
  },
  /**
   * 汇率计算
   */
  getCurrencyPrice (price,cur) {
    const curs = utils.exchangeRates
    if (cur in curs) {
      // if (['JPY', 'RUB', 'THB'].indexOf(cur) >= 0) {
      //   return Math.ceil(price * curs[cur] / 10) * 10;
      // }
      // Math.ceil
      return Math.ceil(price * curs[cur]);
    }
    return Math.ceil(price);
  },
  getCurrencyPrice2 (price,cur) {
    const curs = utils.exchangeRates
    if (cur in curs) {
      // if (['JPY', 'RUB', 'THB'].indexOf(cur) >= 0) {
      //   return Math.ceil(price * curs[cur] / 10) * 10;
      // }
      // Math.ceil
      return Math.ceil(price / curs[cur]);
    }
    return Math.ceil(price);
  },
  replaceCon (data) {
    if (!data) {
      return
    }
    return data.replace(/\n/g, "<br/>")
  },
  unshiftArray (array) {
    if (!array) {
      return
    }

    const last = array[array.length-1]
    array.unshift(last)
    array.pop()
    // array
    return array
  },
}
module.exports = utils
