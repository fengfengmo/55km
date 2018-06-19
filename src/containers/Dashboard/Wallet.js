/**
 * 钱包
 */
import React from 'react';
import { connect } from 'react-redux'
import { Link,browserHistory } from 'react-router'
import { Button,Icon,Spin,Tabs,Table,Select,Input,Modal,notification,Tag } from 'antd';
import styles from './index.scss'
import Walletstyles from './Wallet.scss'
import {_getUserWallet,_getBalance,_getBalanceWithdrawal,_postUserWallet} from 'api/'
import DashboardHeader from 'components/Header/DashboardHeader'
import LeftBar from 'components/LeftBar'
import {commaize,commaizeInt,exchangeRates,getCurrencyPrice,getFormat}  from 'utils/'
import { FormattedMessage } from 'react-intl'
import moment from 'moment';
const TabPane = Tabs.TabPane
const Option = Select.Option
const exchange = 1/exchangeRates['CNY']
class Wallet extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      isLoading :false,
      Withdrawals: false,
      addState: false,
      addStateData: {},
      BalanceWithdrawal: [],// 交易历史
      totalBalance: 0,
      PayoutMethod:[], //提现方式
      accountName:null,
      accountNumber:null,
      remark:null,
      amount:null, // 提现金额
      balanceData:{} //提现的数据
    }
  }
  componentWillMount (){
    const {dispatch,userData} = this.props
    _getBalance(userData.userId).then((res)=>{
      this.setState({
        totalBalance: res.totalBalance || 0
      })
    })
    _getBalanceWithdrawal(userData.userId).then((res)=>{
      const data = Array.from(res.data,(item)=>{
        return {
          ...item,
          key:item.createAt
        }
      })
      this.setState({
        BalanceWithdrawal: data
      })
    })
    this.getUserWallet()
  }
  getUserWallet(){
    const {userData} = this.props
    _getUserWallet (userData.userId).then((res)=>{
      this.setState({
        PayoutMethod: res
      })
    })
  }
  /**
   * 添加提现方式
   */
  postUserWallet (walletType){
    const {userData} = this.props
    const {accountName,accountNumber,remark} = this.state
    if (!remark || !accountName || !accountNumber) {
      return false
    }
    const data ={
      "userId":userData.userId,
      "accountName":accountName,
      "accountNumber":accountNumber,
      "remark":remark,
      "walletType":walletType
    }
    _postUserWallet(data).then((res)=>{
      notification.success({
        message: '成功',
        description: '帐号添加成功。'
      })
      this.getUserWallet()
    })
  }
  _renderPreferences(){
    const {PayoutMethod} = this.state
    const data = [
      {
        key: '1',
        Method:'Bank Transfer',
        ProcessedIn:'3–5<br/>business days',
        icon: 'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485419628_8qddm_0z2jl',
        icon_gray :'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485419643_jyztu_xs4lw',
        Fees:'None',
        Currency: 'THB',
        Details:'Business day processing only; weekends and banking holidays may cause delays.'
      },
      {
        key: '2',
        Method:'Paypal',
        ProcessedIn:'3–5<br/>business days',
        icon: 'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485419658_rurkr_uzk0m',
        icon_gray :'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485419676_3e7ds_yzlbs',
        Fees:'None',
        Currency: 'THB',
        Details:'Business day processing only; weekends and banking holidays may cause delays.'
      },
      {
        key: '3',
        Method:'Alipay',
        ProcessedIn:'3–5<br/>business days',
        icon: 'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485419543_2r39f_1n7e5',
        icon_gray :'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485419600_zr751_79um4',
        Fees:'None',
        Currency: 'THB',
        Details:'Business day processing only; weekends and banking holidays may cause delays.'
      },
      {
        key: '4',
        Method:'Wechat',
        ProcessedIn:'3–5<br/>business days',
        icon: 'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485419696_lkd1b_whmo2',
        icon_gray :'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485419710_j3sgi_a0ezp',
        Fees:'None',
        Currency: 'THB',
        Details:'Business day processing only; weekends and banking holidays may cause delays.'
      }
    ];
    let newData =[]
    if (PayoutMethod.length>0) {
      newData = Array.from(data,(item,index)=>{
        const x = PayoutMethod.filter(x=> parseInt(x.walletType) === parseInt(item.key))
        return {
          ...item,
          ...x[0]
        }
      })
    }else{
      newData = data
    }
    const columns = [{
      title: 'Method',
      dataIndex: 'Method',
      width: '30%',
      render: (text, record) => (
        <div className={record.walletType && "method_icon method_icon_on" || "method_icon"}>
          {record.walletType && <img src={record.icon} /> || <img src={record.icon_gray} />}

        </div>
      ),
    }, {
      title: 'Processed In',
      dataIndex: 'Processed',
      render: (text, record) => (
        <div  dangerouslySetInnerHTML={{__html:record.ProcessedIn}}>

        </div>
      ),
    }, {
      title: 'Fees',
      dataIndex: 'Fees',
      render: (text, record) => (
        <div>
        {record.Fees}
        </div>
      ),
    }, {
      title: 'Currency',
      key: 'Currency',
      render: (text, record) => (
        <div>
        {record.Currency}
        </div>
      ),
    }, {
      title: 'Details',
      key: 'Details',
      width: '25%',
      render: (text, record) => (
        <div className="">
        {record.Details}
        </div>
      ),
    }];


    const {addState,addStateData,accountName,accountNumber,remark} = this.state
    return(
      <div className="wallet_main_wrap">
        <div className="wallet_main_title"><FormattedMessage id={'Wallet.Add Payout Method'} defaultMessage={'Add Payout Method'} /></div>
        <div className="wallet_main">
          <div className="wallet_main_header">
          <FormattedMessage id={'Wallet.Add Payout Methodp'} defaultMessage={'We can send money to people  with these payout methods. Which do you prefer?'} />

          </div>
          <div className="wallet_main_body wallet_main_body_add">
            <Table columns={columns} dataSource={newData} pagination={false} onRowClick={(record, index)=>{
              this.setState({
                addState:true,
                addStateData: record,
              })
              }}/>
          </div>
          <div className="wallet_main_footer wallet_main_footer_bnt">
            {/*<Button type="primary">
              <FormattedMessage id={'Wallet.Add Payout Method'} defaultMessage={'Add Payout Method'} />
            </Button>*/}
          </div>
        </div>
        <Modal title={''}
            visible={addState}
            className="wallet_main_modal"
            onCancel={()=>{
              this.setState({
                addState: false
              })
            }}

          >
          <div className="wallet_main_wrap">
            <div className="wallet_main_title">{'Add ' + addStateData.Method}</div>
            <div className="wallet_main wallet_main_add">
              <div className="wallet_main_header">
                <img src={addStateData.icon} />
              </div>
              <div className="wallet_main_body">
                <div className="wallet_main_item"><Input placeholder={'姓名'} value={accountName} onChange={(e)=>{
                  this.setState({
                    accountName: e.target.value
                  })
                }}/></div>
                <div className="wallet_main_item"><Input placeholder={'帐号'} value={accountNumber} onChange={(e)=>{
                  this.setState({
                    accountNumber: e.target.value
                  })
                }}/></div>
                <div className="wallet_main_item"><Input placeholder={'备注'} type={'textarea'} value={remark} onChange={(e)=>{
                  this.setState({
                    remark: e.target.value
                  })
                }}/></div>
              </div>
              <div className="wallet_main_footer">
              <Button type="primary" onClick={()=>{
                this.postUserWallet(parseInt(addStateData.key))
                  this.setState({
                    addState:false
                  })
                }}>
                {'Add ' + addStateData.Method+' Account'}
              </Button>
              </div>
            </div>
          </div>
          </Modal>
      </div>
    )
  }
  _renderWithdrawals () {
    const {Withdrawals,totalBalance,addStateData,amount,PayoutMethod} = this.state
    const {currency} = this.props
    const data = [
      {
        key: '1',
        Method:'Bank Transfer',
        icon: 'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485419628_8qddm_0z2jl'
      },
      {
        key: '2',
        Method:'Paypal',
        icon: 'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485419658_rurkr_uzk0m',
      },
      {
        key: '3',
        Method:'Alipay',
        icon: 'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485419543_2r39f_1n7e5'
      },
      {
        key: '4',
        Method:'Wechat',
        icon: 'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485419696_lkd1b_whmo2',
      }
    ];
    let newPayoutMethod =[]
    if (PayoutMethod.length>0) {
      newPayoutMethod = Array.from(PayoutMethod,(item,index)=>{
        const x = data.filter(x=> parseInt(x.key) === item.walletType)
        return {
          ...item,
          ...x[0]
        }
      })
    }
    return (
      <Modal title={''}
          visible={Withdrawals}
          className="wallet_main_modal"
          onCancel={()=>{
            this.setState({
              Withdrawals: !Withdrawals
            })
          }}
        >
        <div className="wallet_main_wrap ">
          <div className="wallet_main_title">{'申请提现'}</div>
          <div className="wallet_main wallet_main_add">
            <div className="wallet_main_body">
              <div className="wallet_main_item">
              可提现金额{commaize(getCurrencyPrice(totalBalance*exchange,'CNY'))}<FormattedMessage id={'Common.Currencie.CNY'} defaultMessage={'CNY'} />
              </div>
              <div className="wallet_main_item"><Input placeholder={'提现金额'} value={amount} onChange={(e)=>{
                this.setState({
                  amount: e.target.value
                })
              }}/></div>
              <Select  style={{ width: '100%'}} placeholder="提现方式" onSelect={(e)=>{
                const dd = newPayoutMethod.filter(x=> x.walletType === parseInt(e))
                if (dd && dd[0]) {
                  this.setState({
                    balanceData:{
                      realName: dd[0].accountName,
                      idCard: dd[0].accountNumber,
                      pictureUrl: dd[0].Method
                    }
                  })
                }
              }}>
                {
                  newPayoutMethod.map((item,index)=>{
                    return (<Option key={index} value={item.walletType}>{item.Method}</Option>)
                  })
                }
              </Select>
            </div>
            <div className="wallet_main_footer">
            <Button type="primary" onClick={()=>{

              }}>
              申请提现
            </Button>
            </div>
          </div>
        </div>
        </Modal>
    )
  }
  _renderHistory(){
    const {BalanceWithdrawal} = this.state
    const {currency} = this.props
    const columns = [{
      title: 'Date',
      dataIndex: 'createAt',
      key:'createAt',
      width: '14%',
      render: text => (moment(text).format(getFormat(true))),
    }, {
      title: 'Type',
      dataIndex: 'type',
      key:'type',
      width: '18%',
      render: (text)=>{
        return(
          <div>
          {text===1 && 'Reservation' || '无'}
          </div>
        )
      }
    }, {
      title: 'Details',
      key:'id',
      width: '50%',
      render: ()=>{
        return(
          <div>

          </div>
        )
      }
    }, {
      title: 'Total',
      dataIndex: 'amount',
      key: 'amount',
      width: '18%',
      render: (text, record) => (
        <div className="table_total">
          <FormattedMessage
            id={'Common.Currencies.'+currency}
            defaultMessage={`{num} `+ currency}
            values={{num: commaize(getCurrencyPrice(text*exchange,currency))}}
            />
        </div>
      ),
    }];
    return(
      <div className="wallet_main_wrap">
        <div className="wallet_main_title"><FormattedMessage id={'Wallet.Transaction History'} defaultMessage={'Transaction History'} /></div>
        <div className="wallet_main">
          <div className="wallet_main_header_history flex">
            <div className="header_l">
              <Select size="large" style={{ width: '100%' }}  defaultValue={'2017'}>
                <Option value="2016">2016</Option>
                <Option value="2017">2017</Option>
                <Option value="2018">2018</Option>
              </Select>
            </div>
            <div className="header_m">
              <Select size="large" style={{ width: '100%' }}  >
                <Option value="Feb">Feb</Option>
                <Option value="Feb2">Feb2</Option>
              </Select>

            </div>
            <div className="header_r">
              <Select size="large" style={{ width: '100%' }}  >
                <Option value="All listing">All listing</Option>
              </Select>
            </div>
          </div>
          <div className="wallet_main_body">
            <Table columns={columns} dataSource={BalanceWithdrawal} />
          </div>
        </div>
      </div>
    )
  }
  /**
   *
   */
  _renderGeneral(){
    const {totalBalance,PayoutMethod} = this.state
    const {currency} = this.props
    const data = [
      {
        key: '1',
        Method:'Bank Transfer',
        icon: 'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485419628_8qddm_0z2jl'
      },
      {
        key: '2',
        Method:'Paypal',
        icon: 'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485419658_rurkr_uzk0m',
      },
      {
        key: '3',
        Method:'Alipay',
        icon: 'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485419543_2r39f_1n7e5'
      },
      {
        key: '4',
        Method:'Wechat',
        icon: 'http://7xq8kr.com1.z0.glb.clouddn.com/webapi_1485419696_lkd1b_whmo2',
      }
    ];
    let newPayoutMethod =[]
    if (PayoutMethod.length>0) {
      newPayoutMethod = Array.from(PayoutMethod,(item,index)=>{
        const x = data.filter(x=> parseInt(x.key) === item.walletType)
        return {
          ...item,
          ...x[0]
        }
      })
    }
    return (
      <div className="wallet_main_wrap">
        <div className="wallet_main_title"><FormattedMessage id={'Wallet.General'} defaultMessage={'General'} /></div>
        <div className="wallet_main">
          <Tag color="#ED5564">该金额为旅行者实时预定支付的费用，将在每个行程结束后第二天正式进入您的帐户中。</Tag>
          <div className="wallet_main_header flex">
            <div className="header_l"><FormattedMessage id={'Wallet.Total'} defaultMessage={'Total'} /><span><FormattedMessage id={'Common.Currencie.'+currency} defaultMessage={currency} /></span></div>
            <div className="header_m">{commaize(getCurrencyPrice(totalBalance*exchange,currency))}</div>
            <div className="header_r"><Button type="next"><FormattedMessage id={'Wallet.Withdraw'} defaultMessage={'Withdraw'} /></Button></div>
          </div>

          <div className="wallet_main_footer">
          {
            PayoutMethod.length === 0 && (
              <div className="empyt_payout_method">
              <h3><FormattedMessage id={'Wallet.General.h3'} defaultMessage={'Please tell us how to pay you.'} /> </h3>
              <p><FormattedMessage id={'Wallet.General.p'} defaultMessage={'To get paid, you need to set up a payout method. Your earnings will be transferred to your bank account within 3-7 business days after the trip has ended successfully. The time it takes for the funds to appear in your account depends on your payout method. '} /></p>
                <Button type="primary">
                  <Link to={'/dashboard/wallet/preferences'}>
                    <FormattedMessage id={'Wallet.Add Payout Method'} defaultMessage={'Add Payout Method'} />
                  </Link>
                </Button>
              </div>
            ) || (
              <div className="payout_method flex">
                <div className="payout_method_l"><FormattedMessage id={'Wallet.Payout Method'} defaultMessage={'Payout Method'} /></div>
                <div className="payout_method_r clearafter">
                {
                  newPayoutMethod.map((item,index)=>{
                    return (<div key={index}><img src={item.icon} /><span>{item.Method}</span></div>)
                  })
                }
                </div>
              </div>
            )
          }

          </div>

        </div>
      </div>
    )
  }
  render() {
    const {location,params } = this.props
    const {authorIdGroupTour} = this.props
    return (
      <div>
        <DashboardHeader />
        <div className="max_width wallet_wrap flex">
          <div className="leftbar">
            <nav className="leftbar_nav">
              <Link to={'/dashboard/wallet/general'} activeClassName="active"><FormattedMessage id={'Wallet.General'} defaultMessage={'General'} /></Link>
              <Link to={'/dashboard/wallet/preferences'} activeClassName="active"><FormattedMessage id={'Wallet.Payout Preferences'} defaultMessage={'Payout Preferences'} /></Link>
              <Link to={'/dashboard/wallet/history'} activeClassName="active"><FormattedMessage id={'Wallet.Transaction History'} defaultMessage={'Transaction History'} /></Link>
            </nav>
          </div>
          <div className="dashboard_right">
            {this._renderWithdrawals()}
            {params.slug!=='preferences' && params.slug!=='history' && this._renderGeneral()}
            {params.slug==='preferences' && this._renderPreferences()}
            {params.slug==='history' && this._renderHistory()}
          </div>
        </div>
      </div>
    )
  }
}

function select(store){
  return {
    userData: store.User.userData,
    currency: store.Common.currency,
  }
}
Wallet = connect(select)(Wallet)
module.exports = Wallet;
