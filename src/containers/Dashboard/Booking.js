/**
 * 已预定列表页面
 */
import React from 'react';
import { connect } from 'react-redux'
import { Link,browserHistory } from 'react-router'
import { Button,Icon,Spin,Tabs,Rate,Modal,Table } from 'antd';
import moment from 'moment';
import styles from './index.scss'
import Bookingstyles from './Booking.scss'
import DashboardHeader from 'components/Header/DashboardHeader'
import {_getOrderParticipated,_getOrderPublished} from 'api/'
import { FormattedMessage,injectIntl,intlShape } from 'react-intl'
import {exchangeRates,commaize,commaizeInt,getCurrencyPrice}  from 'utils/'
const TabPane = Tabs.TabPane;
const now = moment()

const exchange = 1/exchangeRates['CNY']
class Booking extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      isLoading :true,
      guestModal: false,
      guestData: [],//客户名单
      changeModal: false,
      OrderParticipatedData: [], // 个人订单
      OrderCompleteData: [],
      OrderPublishedData: [] //定我的
    }
  }
  componentWillMount (){
    const {dispatch,userData} = this.props
    this.getOrderParticipated()
  }
  /**
   * 区分已完成
   */
   filterData (data,type) {
     return data.filter(item => {
        const state = moment(item.order.startDate).isBefore(now, 'day')
        if (state === !type) {
          return null
        }
        return {
          ...item
        }
     })

   }
  /**
   * 获取自己订的订单
   */
  getOrderParticipated () {
    const {dispatch,userData} = this.props
    this.setState({
      isLoading: true
    })
    _getOrderParticipated(userData.userId).then((res)=>{
      console.log(this.filterData(res.data,true))
      this.setState({
        OrderParticipatedData: this.filterData(res.data),
        OrderCompleteData: this.filterData(res.data,true),
        isLoading: false
      })
    })
  }
  getOrderPublished (){
    const {dispatch,userData} = this.props
    this.setState({
      isLoading: true
    })
    _getOrderPublished(userData.userId).then((res)=>{
      //console.log(res)
      this.setState({
        OrderPublishedData: Array.from(res.data,(item,index)=>{
          return {
            ...item,
            order:{
              ...item.order,
              key:item.order.orderId
            }
          }
        }),
        isLoading: false
      })
    })
  }
  render() {
    const {intl,currency} = this.props
    const {guestModal,changeModal} = this.state
    const Upcoming = intl.formatMessage({id:"Dashboard.Booking.Upcoming Trips", defaultMessage: "Upcoming Trips"})
    const Past = intl.formatMessage({id:"Dashboard.Booking.Past Trips", defaultMessage: "Past Trips"})
    const Hosting  = intl.formatMessage({id:"Dashboard.Booking.Upcoming Hosting", defaultMessage: "Upcoming Hosting"})
    const TravelingH3 = intl.formatMessage({id:"Inbox.Item.TravelingH3", defaultMessage: "Choose Your Next <span> Adventure</span>"})
    const {OrderParticipatedData,OrderPublishedData,guestData,OrderCompleteData} =this.state

    // const HostingH3 = intl.formatMessage({id:"Inbox.Item.HostingH3", defaultMessage: "Become Local Expert Earn<span> Extra Money</span>"})
    const columns = [{
      title: 'Name',
      dataIndex: 'contactName',
      key: 'contactName',
      render: (text, record) => (
        <span>
        {record.contactName}
        </span>
      )
    }, {
      title: 'Email',
      dataIndex: 'contactEmail',
      key: 'contactEmail',
      render: (text, record) => (
        <span>
        {record.contactEmail}
        </span>
      )
    }, {
      title: 'Mobile',
      dataIndex: 'contactTel',
      key: 'contactTel',
      render: (text, record) => (
        <span>
        {record.contactTel}
        </span>
      )
    }, {
      title: 'Passport',
      dataIndex: 'otherRequire',
      key: 'otherRequire',
      render: (text, record) => (
        <span>
        {record.otherRequire}
        </span>
      ),
    }]
    return (
      <div>
        <DashboardHeader />
        <div className="max_width960 flex booking_wrap">
          <div className="main_wrap">
            <h1 className="list_title"><FormattedMessage id="Dashboard.Item.Your Trips" defaultMessage="Your Trips" /> </h1>
              <Spin tip="Loading..." spinning={this.state.isLoading}>
                <Tabs defaultActiveKey="1" onChange={(index)=>{
                  if (parseInt(index)===3) {
                    this.getOrderPublished()
                  }
                }}>
                  <TabPane tab={Upcoming} key="1">
                  {
                    OrderParticipatedData.length === 0 && (<div className="messages_empty">
                        <p><FormattedMessage id="Dashboard.Booking.Upcomingp" defaultMessage="You are currently have no booking message." /></p>
                        <h3 dangerouslySetInnerHTML={{__html: TravelingH3}}></h3>
                        <Button type="primary" size={'large'} style={{width:140}}>
                          <Link to={'/search/Any'}>
                            <FormattedMessage id={'Inbox.Item.Explore'} defaultMessage={'Explore'}/>
                          </Link>
                        </Button>
                      </div>) || (
                        <div className="trips_table">
                          <div className="trips_table_thead flex">
                            <div className="order_list_columns1">
                              <h4><FormattedMessage id="Dashboard.Booking.Order status" defaultMessage="Order status" /></h4>
                            </div>
                            <div className="order_list_columns2">
                              <h4><FormattedMessage id="Dashboard.Booking.Start Date" defaultMessage="Start Date" /></h4>
                            </div>
                            <div className="order_list_columns3">
                              <h4><FormattedMessage id="Dashboard.Booking.Meet Point" defaultMessage="Meet Point" /></h4>
                            </div>
                            <div className="order_list_columns4">
                              <h4><FormattedMessage id="Dashboard.Booking.Options" defaultMessage="Options" /></h4>
                            </div>
                          </div>
                          <div className="trips_table_body">
                            {
                              OrderParticipatedData && OrderParticipatedData.map((item)=>{
                                const itinerary = item.groupTour.itinerary.sort((a,b)=>{ return a.startTime - b.startTime}) || []
                                const fristPhoto = item.groupTour.photo && item.groupTour.photo.filter(item => item.default === 1) || []
                                return (
                                  <div className="trips_table_item" key={item.order.orderId}>
                                    <div className="trips_table_item_body flex">
                                      <div className="order_list_columns1 flex">
                                        <div className="order_banner">
                                        {
                                          fristPhoto[0] && fristPhoto[0].photoUrl && <img src={fristPhoto[0].photoUrl+'?imageView2/3/w/200'} />
                                        }
                                        </div>
                                        <div className="order_title_wrap flex">
                                          <h3 className="order_title">{item.order.subject}</h3>
                                          <div className="order_title_destination">
                                            <Icon type="location" />{item.groupTour.extra && item.groupTour.extra.destination && item.groupTour.extra.destination}
                                            <div><Rate allowHalf defaultValue={5} disabled/></div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="order_list_columns2 flex">
                                        <div className="columns2_header">{moment(item.order.startDate).utc().utcOffset(8).format("MMM YYYY") }<span>{moment(item.order.startDate).utc().utcOffset(8).format("D") }</span></div>
                                        <div className="columns2_body">
                                        {itinerary[0] && (itinerary[0].title+'-'+itinerary.pop().title)}
                                        </div>
                                      </div>
                                      <div className="order_list_columns3 flex">
                                        <div className="columns3_header">
                                        {item.groupTour.extra && item.groupTour.extra.meetingPlace && item.groupTour.extra.meetingPlace}
                                        </div>
                                        <div className="columns3_body">
                                          {/*<Link>View Map</Link>*/}
                                        </div>
                                      </div>
                                      <div className="order_list_columns4 flex">
                                        <div className="columns4_header flex">
                                          <Link to={'/trip/'+item.order.groupTourId}><FormattedMessage id="Dashboard.Booking.View Detail" defaultMessage="View Detail" /></Link>
                                          {/*<Link><FormattedMessage id="Dashboard.Booking.Contact Host" defaultMessage="Contact Host" /></Link>*/}
                                        </div>
                                        <div className="columns4_body">
                                          <Link onClick={()=>{
                                            this.setState({
                                              changeModal:true
                                            })
                                          }}><FormattedMessage id="Dashboard.Booking.Change/Cancel" defaultMessage="Change/Cancel" /></Link>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="trips_table_item_footer flex">
                                      <div className="order_list_columns1 flex">
                                        <div className="columns_label"></div>
                                        <div className="columns_num"><FormattedMessage id="Dashboard.Booking.Order No." defaultMessage="Order No.:" /><span>{item.order.orderId}</span></div>
                                      </div>
                                      <div className="order_list_columns2">

                                      </div>
                                      <div className="order_list_columns3 flex">
                                        <div className="columns_label"><FormattedMessage id="Booking.Common.Guest Amount" defaultMessage="Guest Amount" />:</div>
                                        <div className="columns_num">{item.order.numOfMember}</div>
                                      </div>
                                      <div className="order_list_columns4 flex">
                                        <div className="columns_label"><FormattedMessage id="Booking.Common.Total Price" defaultMessage="Total Price" />:</div>
                                        <div className="columns_num">
                                        <FormattedMessage
                                          id={'Common.Currencies.'+currency}
                                          defaultMessage={`{num} `+ currency}
                                          values={{num: getCurrencyPrice(item.order.totalAmount*exchange,currency)}}
                                          />
                                          </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })
                            }
                          </div>
                        </div>
                      )
                  }

                  </TabPane>
                  <TabPane tab={Past} key="2">
                      {
                        OrderCompleteData.length === 0 && (    <div className="messages_empty"><p>您目前暂无完成旅程信息。</p>  </div>) || (
                            <div className="trips_table">
                              <div className="trips_table_thead flex">
                                <div className="order_list_columns1">
                                  <h4><FormattedMessage id="Dashboard.Booking.Order status" defaultMessage="Order status" /></h4>
                                </div>
                                <div className="order_list_columns2">
                                  <h4><FormattedMessage id="Dashboard.Booking.Start Date" defaultMessage="Start Date" /></h4>
                                </div>
                                <div className="order_list_columns3">
                                  <h4><FormattedMessage id="Dashboard.Booking.Meet Point" defaultMessage="Meet Point" /></h4>
                                </div>
                                <div className="order_list_columns4">
                                  <h4><FormattedMessage id="Dashboard.Booking.Options" defaultMessage="Options" /></h4>
                                </div>
                              </div>
                              <div className="trips_table_body">
                                {
                                  OrderCompleteData && OrderCompleteData.map((item)=>{
                                    const itinerary = item.groupTour.itinerary.sort((a,b)=>{ return a.startTime - b.startTime}) || []
                                    const fristPhoto = item.groupTour.photo && item.groupTour.photo.filter(item => item.default === 1) || []
                                    return (
                                      <div className="trips_table_item" key={item.order.orderId}>
                                        <div className="trips_table_item_body flex">
                                          <div className="order_list_columns1 flex">
                                            <div className="order_banner">
                                            {
                                              fristPhoto[0] && fristPhoto[0].photoUrl && <img src={fristPhoto[0].photoUrl+'?imageView2/3/w/200'} />
                                            }
                                            </div>
                                            <div className="order_title_wrap flex">
                                              <h3 className="order_title">{item.order.subject}</h3>
                                              <div className="order_title_destination">
                                                <Icon type="location" />{item.groupTour.extra && item.groupTour.extra.destination && item.groupTour.extra.destination}
                                                <div><Rate allowHalf defaultValue={5} disabled/></div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="order_list_columns2 flex">
                                            <div className="columns2_header">{moment(item.order.startDate).utc().utcOffset(8).format("MMM YYYY") }<span>{moment(item.order.startDate).utc().utcOffset(8).format("D") }</span></div>
                                            <div className="columns2_body">
                                            {itinerary[0] && (itinerary[0].title+'-'+itinerary.pop().title)}
                                            </div>
                                          </div>
                                          <div className="order_list_columns3 flex">
                                            <div className="columns3_header">
                                            {item.groupTour.extra && item.groupTour.extra.meetingPlace && item.groupTour.extra.meetingPlace}
                                            </div>
                                            <div className="columns3_body">
                                              {/*<Link>View Map</Link>*/}
                                            </div>
                                          </div>
                                          <div className="order_list_columns4 flex">
                                            <div className="columns4_header flex">
                                              <Link to={'/reviews/'+item.order.orderId}><FormattedMessage id="Dashboard.Booking.Reviews" defaultMessage="Reviews" /></Link>
                                              {/*<Link><FormattedMessage id="Dashboard.Booking.Contact Host" defaultMessage="Contact Host" /></Link>*/}
                                            </div>

                                          </div>
                                        </div>
                                        <div className="trips_table_item_footer flex">
                                          <div className="order_list_columns1 flex">
                                            <div className="columns_label"></div>
                                            <div className="columns_num"><FormattedMessage id="Dashboard.Booking.Order No." defaultMessage="Order No.:" /><span>{item.order.orderId}</span></div>
                                          </div>
                                          <div className="order_list_columns2">

                                          </div>
                                          <div className="order_list_columns3 flex">
                                            <div className="columns_label"><FormattedMessage id="Booking.Common.Guest Amount" defaultMessage="Guest Amount" />:</div>
                                            <div className="columns_num">{item.order.numOfMember}</div>
                                          </div>
                                          <div className="order_list_columns4 flex">
                                            <div className="columns_label"><FormattedMessage id="Booking.Common.Total Price" defaultMessage="Total Price" />:</div>
                                            <div className="columns_num">
                                            <FormattedMessage
                                              id={'Common.Currencies.'+currency}
                                              defaultMessage={`{num} `+ currency}
                                              values={{num: getCurrencyPrice(item.order.totalAmount*exchange,currency)}}
                                              />
                                              </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })
                                }
                              </div>
                            </div>
                          )
                      }

                    {/*<p><FormattedMessage id={'Inbox.Item.TravelingP'} defaultMessage={'You have no reservations.When guests contact you or send you reservation requests, you’ll see their messages here.'} /></p>

                    <h3 dangerouslySetInnerHTML={{__html: HostingH3}}></h3>
                    <Button type="primary" size={'large'} style={{width:140}}>
                      <Link to={'/dashboard/listing'}>
                        <FormattedMessage id={'Inbox.Item.Add New Listings'} defaultMessage={'Add New Listings'}/>
                      </Link>
                    </Button>*/}
                  </TabPane>
                  <TabPane tab={Hosting} key="3">
                    {
                      OrderPublishedData.length === 0 && (<div className="messages_empty">
                          <p>目前暂无人预定您的旅程信息。</p></div>) || (
                          <div className="trips_table">
                            <div className="trips_table_thead flex">
                              <div className="order_list_columns1">
                                <h4><FormattedMessage id="Dashboard.Booking.Order status" defaultMessage="Order status" /></h4>
                              </div>
                              <div className="order_list_columns2">
                                <h4><FormattedMessage id="Dashboard.Booking.Start Date" defaultMessage="Start Date" /></h4>
                              </div>
                              <div className="order_list_columns3">
                                <h4><FormattedMessage id="Dashboard.Booking.Meet Point" defaultMessage="Meet Point" /></h4>
                              </div>
                              <div className="order_list_columns4">
                                <h4><FormattedMessage id="Dashboard.Booking.Options" defaultMessage="Options" /></h4>
                              </div>
                            </div>
                            <div className="trips_table_body">
                              {
                                OrderPublishedData && OrderPublishedData.map((item)=>{
                                  const itinerary = item.groupTour.itinerary.sort((a,b)=>{ return a.startTime - b.startTime}) || []
                                  const fristPhoto = item.groupTour.photo && item.groupTour.photo.filter(item => item.default === 1) || []
                                  return (
                                    <div className="trips_table_item" key={item.order.orderId}>
                                      <div className="trips_table_item_body flex">
                                        <div className="order_list_columns1 flex">
                                          <div className="order_banner">
                                          {
                                            fristPhoto[0] && fristPhoto[0].photoUrl && <img src={fristPhoto[0].photoUrl+'?imageView2/3/w/200'} />
                                          }
                                          </div>
                                          <div className="order_title_wrap flex">
                                            <h3 className="order_title">{item.order.subject}</h3>
                                            <div className="order_title_destination">
                                              <Icon type="location" />{item.groupTour.extra && item.groupTour.extra.destination && item.groupTour.extra.destination}
                                              <div><Rate allowHalf defaultValue={5} disabled/></div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="order_list_columns2 flex">
                                          <div className="columns2_header">{moment(item.order.startDate).utc().utcOffset(8).format("MMM YYYY") }<span>{moment(item.order.startDate).utc().utcOffset(8).format("D") }</span></div>
                                          <div className="columns2_body">
                                          {itinerary[0] && (itinerary[0].title+'-'+itinerary.pop().title)}
                                          </div>
                                        </div>
                                        <div className="order_list_columns3 flex">
                                          <div className="columns3_header">
                                          {item.groupTour.extra && item.groupTour.extra.meetingPlace && item.groupTour.extra.meetingPlace}
                                          </div>
                                          <div className="columns3_body">
                                            {/*<Link>View Map</Link>*/}
                                          </div>
                                        </div>
                                        <div className="order_list_columns4 flex">
                                          <div className="columns4_header flex">
                                            <Link onClick={()=>{
                                              this.setState({
                                                guestData:[
                                                  item.order
                                                ],
                                                guestModal: true,
                                              })
                                            }}><FormattedMessage id="Dashboard.Booking.View Guest" defaultMessage="View Guest" /></Link>
                                            {/*<Link><FormattedMessage id="Dashboard.Booking.Contact Host" defaultMessage="Contact Host" /></Link>*/}
                                          </div>
                                          <div className="columns4_body">
                                            <Link onClick={()=>{
                                              this.setState({
                                                changeModal:true
                                              })
                                            }}><FormattedMessage id="Dashboard.Booking.Change/Cancel" defaultMessage="Change/Cancel" /></Link>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="trips_table_item_footer flex">
                                        <div className="order_list_columns1 flex">
                                          <div className="columns_label"></div>
                                          <div className="columns_num"><FormattedMessage id="Dashboard.Booking.Order No." defaultMessage="Order No.:" /><span>{item.order.orderId}</span></div>
                                        </div>
                                        <div className="order_list_columns2">

                                        </div>
                                        <div className="order_list_columns3 flex">
                                          <div className="columns_label"><FormattedMessage id="Booking.Common.Guest Amount" defaultMessage="Guest Amount" />:</div>
                                          <div className="columns_num">{item.order.numOfMember}</div>
                                        </div>
                                        <div className="order_list_columns4 flex">
                                          <div className="columns_label"><FormattedMessage id="Booking.Common.Total Price" defaultMessage="Total Price" />:</div>
                                          <div className="columns_num">
                                          <FormattedMessage
                                            id={'Common.Currencies.'+currency}
                                            defaultMessage={`{num} `+ currency}
                                            values={{num: getCurrencyPrice(item.order.totalAmount*exchange,currency)}}
                                            />
                                            </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })
                              }
                            </div>
                          </div>
                        )
                    }
                  </TabPane>
                </Tabs>
              </Spin>
          </div>
        </div>
        <Modal title={<FormattedMessage id="Dashboard.Booking.Change/Cancel" defaultMessage="Change/Cancel" />}
            visible={changeModal}
            className="change_modal"
            maskClosable={false}
            onCancel={()=>{
              this.setState({
                changeModal: false
              })
            }}
            footer={[]}
          >
          请与里手协商后，联系帮助中心的平台客服（微信）帮助修改或退订
        </Modal>
        <Modal title={<FormattedMessage id="Dashboard.Booking.View Guest" defaultMessage="View Guest(s)" />}
            visible={guestModal}
            className="guest_modal"
            maskClosable={false}
            onCancel={()=>{
              this.setState({
                guestModal: false,
                checkWechatQrNun: 11, // 最后一次刷新
              })
            }}
            footer={[]}
          >
          <Table columns={columns} dataSource={guestData} />
        </Modal>
      </div>
    )
  }
}

function select(store){
  return {
    userData: store.User.userData,
    currency: store.Common.currency
  }
}
Booking.propTypes = {
  intl: intlShape.isRequired
}
Booking = injectIntl(Booking)
Booking = connect(select)(Booking)
module.exports = Booking;
