/**
 * 信息认证页面
 */
import React from 'react';
import { connect } from 'react-redux'
import { Link,browserHistory } from 'react-router'
import { Button,Icon,Spin,Input,Row,Col,Select,Modal,notification} from 'antd';
import styles from './index.scss'
import Verificationsstyles from './Verifications.scss'
import TripItem from 'components/TripItem'
import LeftBar from 'components/LeftBar'
import DashboardHeader from 'components/Header/DashboardHeader'
import {_getEmailsecuritycode,_postEmailsecuritycode,_getPhonesecuritycode,_postPhonesecuritycode,_postValid,_getPhonesecuritycodeSign} from 'api/'
import { FormattedMessage,injectIntl,intlShape } from 'react-intl'
import {getUserStatView} from 'actions/User'
import {trackEvent} from 'actions/common'
import {mobile_area} from 'utils/'
import QiniuUpload from 'components/QiniuUpload'
const Option = Select.Option;
class Verifications extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      isLoading :false,
      countryCode: null,
      email:null,
      emailVerify: null,
      emailV:false,
      emailPlaceholder: '',
      phone: null,
      phoneVerify: null,
      phoneV:false,
      phonePlaceholder: '',
      pictureUrl: '', // card 验证 pic
      //cardStatus:0,// 身份证认证状态  0 未认证 1已认证 2 待认证
    }
  }
  componentDidMount (){
    const {dispatch,userData,intl,userStatView} = this.props
    this.setState({
      emailV: false,
      phoneV:false,
      countryCode: (userStatView.info1 && userStatView.info1.countryCode && parseInt(userStatView.info1.countryCode)) || 86,
      emailPlaceholder: intl.formatMessage({id:"Dashboard.Verifications.Email code here...", defaultMessage: "Email code here..."}),
      phonePlaceholder: intl.formatMessage({id:"Dashboard.Verifications.Phone code here...", defaultMessage: "Phone code here..."})
    })
  }
  /**
   * 手机相关
   */
  getPhonesecuritycode () {
    const {dispatch,userData} = this.props
    const {phone,phoneV,phoneVerify} = this.state
    let {countryCode}  = this.state
    if (!phone) {
      return false
    }
    /**
     * 设置默认地区
     */
    if (!countryCode) {
      countryCode = 86
    }
    if (!phoneV) {
      /**
       * 发短信
       * @type {[type]}
       */
       _getPhonesecuritycode(userData.userId,parseInt(phone),countryCode).then((res)=>{
         this.setState({
           phoneV: true
         })
         trackEvent('用户行为','verification/phone','process')
         notification.success({
          message: '验证码已发送',
          description: '验证码已通过手机短信的形式发送至 '+countryCode+''+phone+' 请注意查收。',
        })
       })
    }else{
      /**
       * 认证
       */
      const data = {
        "userId":userData.userId,
        "mobileNum": phone,
        "area":"上海",
        "countryCode": countryCode.toString(),
        "securityCode":phoneVerify
      }
      _postPhonesecuritycode(data).then((res)=>{
        this.setState({
          phoneV: false
        },()=>{
          dispatch(getUserStatView(userData.userId))
          trackEvent('用户行为','verification/phone','success')
          notification.success({
           message: '认证成功',
           description: '手机号认证成功',
          })
        })
      })
    }
  }
  /**
   * 身份验证
   */
  postValid () {
    const {dispatch,userData} = this.props
    const {pictureUrl} = this.state
    if (!pictureUrl) {
      return false
    }
    const data ={
      userId: userData.userId,
      pictureUrl:pictureUrl,
      idCard:'3204089238232323',//  写死
      realName:'realName' //  写死
    }
    _postValid(data).then((res)=>{
      console.log(res)
        trackEvent('用户行为','verification/card','process')
        dispatch(getUserStatView(userData.userId))
        notification.success({
         message: '已提交身份认证',
         description: '已提交身份认证',
        })

    })
  }
  /**
   * 邮箱相关
   */
  getEmailsecuritycode (){
    const {dispatch,userData,intl} = this.props
    const {email,emailV,emailVerify} = this.state
    if (!email) {
      return false
    }
    if (!emailV) {
      /**
       * 发邮件
       * @type {[type]}
       */
       _getEmailsecuritycode(userData.userId,email).then((res)=>{
         this.setState({
           emailV: true
         })
         trackEvent('用户行为','verification/email','process')
         notification.success({
          message: '验证码已发送',
          description: '验证码已通过邮件的形式发送至 '+email+' 请注意查收。',
        })
       })
    }else{
      /**
       * 认证
       */
      const data = {
        "userId":userData.userId,
        "email": email,
        "securityCode":emailVerify
      }
      _postEmailsecuritycode(data).then((res)=>{
        this.setState({
          emailV: false
        },()=>{
          trackEvent('用户行为','verification/email','success')
          dispatch(getUserStatView(userData.userId))
          notification.success({
           message: '认证成功',
           description: '邮箱认证成功',
          })
        })
      })
    }
  }
  _renderCardStatus () {
    const {userStatView,userData} = this.props
    let Status = 0
    if (userStatView && userStatView.valid  && userStatView.valid.status) {
      Status = userStatView.valid.status
    }
    return Status
  }
  _renderUploadButton(type='single') {
    const {userData} = this.props
    const {pictureUrl} = this.state
    if (this._renderCardStatus()===2) {
      return null
    }
    return (
      <div>
      <QiniuUpload
        classNames="qiniu_upload"
        usertoken={userData.token}
        type={type}
        onChange={(data)=>{
          if (data.length!==0) {
            this.setState({
              pictureUrl : data.pop().url
            },()=>{
              console.log(this.state.pictureUrl)
            })
          }
        }}>
        {
          pictureUrl && (<Button type="ghost">Edit</Button>) ||(<Button type="primary">+Add ID card</Button>)
        }
      </QiniuUpload>
      {pictureUrl && <Button type="primary" style={{marginTop:12}} onClick={()=>{
        this.postValid()
      }}>Upload</Button>}
      </div>
    )
  }
  render() {
    const {userStatView,userData} = this.props
    const {email,emailPlaceholder,emailV,emailVerify,phone,phonePlaceholder,phoneV,phoneVerify,countryCode,pictureUrl} =this.state
    const emailStatus = userStatView.valid && userStatView.valid.emailStatus && userStatView.valid.emailStatus===1 // 邮箱验证
    const mobileStatus = userStatView.valid && userStatView.valid.mobileStatus && userStatView.valid.mobileStatus===1 // 手机验证
    const status = userStatView.valid && userStatView.valid.status && userStatView.valid.status===1 // 身份认证
    const emailButton = emailV && (<FormattedMessage id={'Dashboard.Verifications.Verify'} defaultMessage={'Verify'} />) || (emailStatus && (<FormattedMessage id={'Dashboard.Verifications.Change Email'} defaultMessage={'Change Email'} />) || (<FormattedMessage id={'Dashboard.Verifications.Send mail'} defaultMessage={'Send mail'} />))
    const phoneButton = phoneV && (<FormattedMessage id={'Dashboard.Verifications.Verify'} defaultMessage={'Verify'} />) || (mobileStatus && (<FormattedMessage id={'Dashboard.Verifications.Change Cellphone'} defaultMessage={'Change Cellphone'} />) || (<FormattedMessage id={'Dashboard.Verifications.Send SMS'} defaultMessage={'Send SMS'} />))
    return (
      <div>
      <DashboardHeader />
      <div className="max_width flex verification_wrap">
        <LeftBar type={'dashboard'}></LeftBar>
        <div className="dashboard_right">
            <h1 className="list_title"><FormattedMessage id={'Dashboard.Item.Verifications'} defaultMessage={'Verifications'} /></h1>
            <div className="verification_item verification_email flex">
              <div className={emailStatus && 'verification_item_icon verification_item_icon_verify' || 'verification_item_icon'}>
                <Icon type="mail" />
                Email
              </div>
              <div className="verification_item_input_wrap">
              {
                  emailV && (<Input value={emailVerify} placeholder={emailPlaceholder} onChange={(e)=>{
                    this.setState({
                      emailVerify:e.target.value
                    })
                  }}/>) || (
                    emailStatus && (<Input value={email} placeholder={userStatView.info1.email} onChange={(e)=>{
                      this.setState({
                        email:e.target.value
                      })
                    }}/>) || (
                    <Input value={email} onChange={(e)=>{
                      this.setState({
                        email:e.target.value
                      })
                    }}/>
                  )
                )
              }
                <p>
                <FormattedMessage id={'Dashboard.Verifications.Emailtips'} defaultMessage={`You have confirmed your email：{emailData}. A confirmed email is important to allow us to securely communicate with you.`} values={
                  {emailData: email && email || (emailStatus && userStatView.info1.email) }
                }/>
                </p>
                <div className="verification_item_button_mobile">
                  <Button type="primary" onClick={()=>{
                    this.getEmailsecuritycode()
                  }}>
                  {emailButton}
                  </Button>
                </div>
              </div>
              <div className="verification_item_button_wrap">
                <Button type="primary" onClick={()=>{
                  this.getEmailsecuritycode()
                }}>
                {emailButton}
                </Button>
              </div>
            </div>

            <div className="verification_item verification_phone flex">
              <div className={mobileStatus && 'verification_item_icon verification_item_icon_verify' || 'verification_item_icon'}>
                <Icon type="phone" />
                Phone
              </div>
              <div className="verification_item_input_wrap">
                <Row>
                  <Col span={8}>
                    <Select value={countryCode} onChange={(value)=>{
                      this.setState({
                        countryCode: value
                      })
                    }}>
                      {mobile_area.map((item,index)=>{
                        return (<Option value={item.code} key={index}>{'+'+item.code}</Option>)
                      })}
                    </Select>
                  </Col>
                  <Col span={1}></Col>
                  <Col span={15}>
                  {
                      phoneV && (<Input value={phoneVerify} placeholder={phonePlaceholder} onChange={(e)=>{
                        this.setState({
                          phoneVerify:e.target.value
                        })
                      }}/>) || (
                        mobileStatus && (<Input value={phone} placeholder={userStatView.info1.mobileNum} onChange={(e)=>{
                          this.setState({
                            phone:e.target.value
                          })
                        }}/>) || (
                        <Input value={phone} onChange={(e)=>{
                          this.setState({
                            phone:e.target.value
                          })
                        }}/>
                      )
                    )
                  }
                  </Col>
                </Row>
                <p>
                  <FormattedMessage id={'Dashboard.Verifications.Phonetips'} defaultMessage={`Your number is only shared with another 55km member once you have a confirmed booking.`}/>
                </p>
                <div className="verification_item_button_mobile">
                  <Button type="primary" onClick={()=>{
                    this.getPhonesecuritycode()
                  }}>{phoneButton}</Button>
                </div>
              </div>
              <div className="verification_item_button_wrap">
                <Button type="primary" onClick={()=>{
                  this.getPhonesecuritycode()
                }}>{phoneButton}</Button>
              </div>
            </div>

            <div className="verification_item verification_card flex">
              <div className={status && 'verification_item_icon verification_item_icon_verify' || 'verification_item_icon'}>
                <Icon type="id_card" />
                Card
              </div>
              <div className="verification_item_input_wrap">
                <p>
                  <FormattedMessage id={'Dashboard.Verifications.Cardtips'} defaultMessage={`You’ll need to provide a government ID.When you book,your host will only see your name and age range.`}/>
                </p>
                {
                  this._renderCardStatus()===2 && <p style={{color: '#06BEBD'}}><FormattedMessage id={'Dashboard.Verifications.pending for review'} defaultMessage={`pending for review`}/></p>
                }
                {
                  pictureUrl && (<p className='verification_item_img'>
                    <img src={pictureUrl}/>
                  </p>)
                }

              {/*  <Link>File uploaded</Link>*/}
                <div className="verification_item_button_mobile">
                  {this._renderUploadButton('mobile')}
                </div>
              </div>
              <div className="verification_item_button_wrap">
                {this._renderUploadButton()}
              </div>
            </div>
            {/*<div className="verification_item verification_social flex">
              <div className="verification_item_icon">
                <Icon type="s_link" />
                Social media
              </div>
              <div className="verification_item_input_wrap">
                <Select defaultValue="WEIBO">
                  <Option value="WEIBO">WEIBO</Option>
                </Select>
                <p>Keep online verification simple by connecting your 55km and Social media accounts.</p>
                <div className="verification_social_item">
                  <Icon type="link" />
                  <Icon type="link" />
                  <Icon type="link" />
                  <Icon type="link" />
                </div>
              </div>
              <div className="verification_item_button_wrap">
                <Button type="primary">Connect</Button>
              </div>
            </div>
            */}

        </div>
      </div>

      {/*<Modal
          visible={true}
          className="verification_wrap_modal"
          onCancel={()=>{
            this.setState({
              sendMessageM: false
            })
          }}
          footer={[
            <Button key="submit" type="primary" size="large" onClick={()=>{
              console.log('12')
            }}>
              验证
            </Button>,
          ]}
        >
        <Input value={email} onChange={(e)=>{
          this.setState({
            email:e.target.value
          })
        }}/>
        </Modal>*/}
      </div>
    )
  }
}

function select(store){
  return {
    userData: store.User.userData,
    userStatView: store.User.userStatView,
  }
}
Verifications.propTypes = {
  intl: intlShape.isRequired
}
Verifications = injectIntl(Verifications)
Verifications = connect(select)(Verifications)
module.exports = Verifications;
