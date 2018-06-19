import React , {PropTypes }from 'react';
import { Link,browserHistory } from 'react-router'
import 'scss/less/font.less' // 字体
import { Modal,Form,Input,Button,Checkbox,Select,Icon,Row,Col,notification,Popconfirm } from 'antd';
import { connect } from 'react-redux'
import moment from 'moment'
//import moment from 'moment-timezone'
import 'scss/less/index.less' // 增加一个按钮样式 antd
const FormItem = Form.Item;
import Header from 'components/Header'
import Footer from 'components/Footer'
import {openLogin,openSignup,signIn,setLoginCb,setLSdata,getUserStatView,signOut,forceLogin} from 'actions/User'
import {getLS,trackEvent} from 'actions/common'
import {mobile_area,navigatorLanguage} from 'utils'
import { FormattedMessage,injectIntl,intlShape} from 'react-intl'
import {_getPhonesecuritycodeSign,_signUp,_getEmailsecuritycode2,_signupwithemail,_findpassword} from 'api'
import './index.scss'
const Option = Select.Option;
const contextTypes = {
  router: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired
}
const confirm = Modal.confirm;
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      inputType:true, // 密码可视
      usePhoneLogin: true, // 手机登录
      usePhoneSignup: true, // 手机注册
      findpwd: false,//找回密码
      securityCodeCount:60,
      securityCodeSending:false,
      loginBox:false,
      signUpbox: false,
    }
  }
  _openLogin(type){
    const {dispatch} = this.props
    this.setState({
      findpwd:false,
      signUpbox:false,
      loginBox: type,
    },()=>{
      dispatch(openLogin(type))
    })
    //dispatch(forceLogin(false))
  }
  _openSignup(type){
    const {dispatch} = this.props
    this.setState({
      findpwd:false,
      signUpbox:type,
      loginBox: false,
    },()=>{
      dispatch(openSignup(type))
    })
    //dispatch(forceLogin(false))

  }
  /**
   *  登录
   */
   _submitForm(){
     const {dispatch,loginSignupCB} =this.props
     this.props.form.validateFields((error, value) => {
       if (!!!error) {
         // console.log(value)
         trackEvent('用户行为','login','process')
         dispatch(signIn(value,()=>{
           if (loginSignupCB) {
              loginSignupCB()
           }
         }))
       }
     })
   }
   findpassword(){
     const {dispatch,loginSignupCB,form} =this.props
      form.validateFields((error, value) => {
       if (!!!error) {
         const data = {
           ...value,
           password:value.newpassword,
           countryCode: value.countryCode.toString(),
         }
         trackEvent('用户行为','findPassword','process')
         _findpassword(data).then((res)=>{
           trackEvent('用户行为','findPassword','success')
           notification.success({
             message: '密码修改成功',
             description:"密码修改成功，请使用账号登陆"
           })
            this._openSignup(false)
            this._openLogin(false)
         })
       }
     })
   }
   _submitFormSign(type){
     const {dispatch,loginSignupCB} =this.props
     this.props.form.validateFields((error, value) => {
       if (!!!error) {
         //console.log(value)
         if (value.agreeto) {
           const data = {
             ...value,
             area:"上海",
             countryCode: value.countryCode.toString(),
           }
           trackEvent('用户行为','register','process')
           if (type) {
             _signUp(data).then((res)=>{
               console.log(res)
               if (res) {
                 trackEvent('用户行为','register','success')
                 notification.success({
                   message: '成功',
                   description:"账号注册成功，请使用账号登陆"
                 })
                  this._openSignup(false)
                  this._openLogin(true)
               }else{
                 trackEvent('用户行为','register','fail')
               }
             })
           }else{
             _signupwithemail(data).then((res)=>{
               if (res) {
                 trackEvent('用户行为','register','success')
                 notification.success({
                   message: '成功',
                   description:"账号注册成功，请使用账号登陆"
                 })
                 this._openSignup(false)
                 this._openLogin(true)
               }else{
                 trackEvent('用户行为','register','fail')
               }
             })
           }
         }else{
           notification.info({
             message: '提示',
             description:"您需要阅读并同意用户协议"
           })
         }
       }
     })

   }
   /**
    * 倒计时
    */
   countdown(type){
		const { securityCodeCount } = this.state;
    const {intl} = this.props
    const data ={
        num:securityCodeCount
      }
    const securityCodeText1 = intl.formatMessage({id:"Dashboard.Verifications.Send SMS", defaultMessage: "Send SMS"})
    const securityCodeText2 = intl.formatMessage({id:"Index.Header.Send mail", defaultMessage: "Send mail"})
    const securityCodeText3 = intl.formatMessage({id:"Index.Header.Send SMS2", defaultMessage: "Resend SMS({num})"}, data)
    const securityCodeText4 = intl.formatMessage({id:"Index.Header.Send mail2", defaultMessage: "Resend mail({num})"}, data)
		if(securityCodeCount===0){
			this.setState({
				securityCodeText: type && securityCodeText1 || securityCodeText2,
				securityCodeCount: 60,
				securityCodeSending: false
			})
		}else{
				this.setState({
					securityCodeText: type && securityCodeText3 || securityCodeText4,
					securityCodeCount: securityCodeCount-1,
          securityCodeSending:true
				},()=>{
          setTimeout(()=>{
            this.countdown(type)
          },1000)
        })
		}
	}
   _getSecurityCode (type) {
     const {dispatch,loginSignupCB} =this.props
     const {securityCodeSending} = this.state
     if (securityCodeSending) {
       return
     }
     if (type) {
       this.props.form.validateFields(['mobileNum','countryCode'],(error, value) => {
         if (!!!error) {
           console.log(value)
           _getPhonesecuritycodeSign(parseInt(value.mobileNum),value.countryCode).then((res)=>{
             console.log(res)
             this.countdown(type)
             notification.info({
               message: '提示',
               description:"验证码已发送至："+value.countryCode+""+ value.mobileNum
             })
           })
         }
       })
     }else{
       this.props.form.validateFields(['email'],(error, value) => {
         if (!!!error) {
           console.log(value)
           _getEmailsecuritycode2(value.email).then((res)=>{
             this.countdown(type)
             notification.info({
               message: '提示',
               description:"验证码已发送至："+value.email
             })
           })
         }
       })
     }

   }
   /**
    * 设置回掉
    */
   _setLoginCb () {
     // console.log(this.props.location.query.redirect)
    // cosnt query = this.props.location.query && this.props.location.query.redirect
     browserHistory.push(this.props.location.query.redirect)
   }
   /**
    * 查看消息
    */
   _inboxCb (){
     browserHistory.push('/dashboard/inbox')
   }
  async componentDidMount () {
    const {dispatch,isLogin,userData,userProfile} = this.props
    if (this.props.location.query && this.props.location.query.redirect && isLogin) {
      this._openLogin(true)
      dispatch(setLoginCb(()=>{this._setLoginCb()}))
    }
    if (isLogin) {
      await dispatch(getUserStatView(userData.userId,this._inboxCb))
    }
  }
  async componentWillUpdate (nextProps) {
    if (nextProps.location.query && nextProps.location.query.redirect && nextProps.location.query.redirect !== this.props.location.query.redirect ) {
      const {dispatch} = this.props
      this._openLogin(true)
      dispatch(setLoginCb(()=>{this._setLoginCb()}))
    }
    if (nextProps.location.pathname !== this.props.location.pathname) {
      const {dispatch,isLogin,userData} = this.props
      if (isLogin) {
        await dispatch(getUserStatView(userData.userId,this._inboxCb))
      }
    }
  }
  async componentWillMount () {
    const {dispatch,isLogin} = this.props
    /**
     * 获取用户状态
     * @type {[type]}
     */
    const locale = getLS('locale') || navigatorLanguage()
    locale==='zh' && moment.locale('zh-cn') || moment.locale('en')
    const userData = getLS('userData') && JSON.parse(getLS('userData'))
    const expirationTime = getLS('expirationTime') || 0
    if (getLS('isLogin') && userData && userData.token && moment().unix()< expirationTime) {
      await dispatch(setLSdata(userData))
    }else{
      dispatch(signOut())
    }
  }
  _renderSingup () {
    const { getFieldDecorator } = this.props.form;
    const {openSignup,intl} = this.props
    const {inputType,usePhoneSignup,securityCodeText,securityCodeSending,loginBox,signUpbox} = this.state
    if (loginBox) {
      return false
    }
    const width = (window.document.body.offsetWidth<768) && 80 || 120
    const placeholder1 = intl.formatMessage({id:"Login.placeholder11", defaultMessage: "Phone number"})
    const placeholder2 = intl.formatMessage({id:"Login.placeholder2", defaultMessage: "Email"})
    const placeholder3 = intl.formatMessage({id:"Login.placeholder3", defaultMessage: "Password"})

    const message1 = intl.formatMessage({id:"Login.message11", defaultMessage: "Please input Phone number!"})
    const message2 = intl.formatMessage({id:"Login.message2", defaultMessage: "Please input Email!"})
    const message22 = intl.formatMessage({id:"Login.message22", defaultMessage: "The input is not valid E-mail!"})
    const message3 = intl.formatMessage({id:"Login.message3", defaultMessage: "Please input your Password!"})

    const tips1 = usePhoneSignup && intl.formatMessage({id:"Login.Use Email instead.", defaultMessage: "Use Email instead."})  || intl.formatMessage({id:"Login.Use Phone number instead.", defaultMessage: "Use Phone number instead."})
    const selectBefore = (
          getFieldDecorator('countryCode', {
          initialValue: 86,
          rules: [{ required: true }],
          })(
            <Select  style={{ width: width }}>
                {mobile_area.map((item,index)=>{
                  return (<Option value={item.code} key={index}>{'+'+item.code}</Option>)
                })}
            </Select>
          )
      );
      if (!openSignup) {
        return null
      }
      return (
        <div className="login_form_wrap">
          <div className="login_form_wrap_header"><FormattedMessage id={'Index.Header.Sign up'} defaultMessage={'Sign up'} /></div>
          <div className="login_form_wrap_body">
            <Form  className="login_form">
            {/*<FormItem className="login_form_header">
            </FormItem>*/}
              {
                usePhoneSignup && (<FormItem>
                  {getFieldDecorator('mobileNum', {
                  rules: [{ required: true, message: message1 }],
                  })(
                    <Input addonBefore={selectBefore} placeholder={placeholder1} suffix={<Icon type="phone" />}/>
                  )}
                </FormItem>) || (<FormItem>
                  {getFieldDecorator('email', {
                    validateTrigger: ['onBlur'],
                  rules: [{ required: true,   type: 'email', message: message2 }],
                  })(
                    <Input  placeholder={placeholder2} suffix={<Icon type="phone" />}/>
                  )}
                </FormItem>)
              }
              <FormItem>
                  <Row>
                    <Col span={13}>
                      <FormItem>
                        {getFieldDecorator('securityCode',{
                          rules: [{
                            required: true
                          } ]})(
                           <Input />
                         )}
                       </FormItem>
                     </Col>
                     <Col span={2}>
                      </Col>
                     <Col span={9}>
                       <Button type="ghost" disabled={securityCodeSending} style={{height:44}} onClick={()=>{this._getSecurityCode(usePhoneSignup)}} className="login_form_button">
                        {
                          securityCodeText || (usePhoneSignup &&  <FormattedMessage id={'Index.Header.Send SMS'} defaultMessage={'Send SMS'} /> || <FormattedMessage id={'Index.Header.Send mail'} defaultMessage={'Send mail'} />)
                        }
                       </Button>
                    </Col>
                  </Row>
              </FormItem>
              <FormItem>
                {getFieldDecorator('password', {
                rules: [{ required: true, message: message3 }],
                })(
                  <Input  type={inputType && 'password' || 'input'} placeholder={placeholder3}  suffix={<Icon type="lock" />}/>
                )}
              </FormItem>
              <FormItem>
                <div className="flex login_flex">
                  <div className="login_item">
                  <Link onClick={()=>{
                    this.setState({
                      usePhoneSignup:!usePhoneSignup
                    })
                  }}>
                  {tips1}</Link></div>
                  <div className="login_item" onClick={()=>{
                    this.setState({
                      inputType: !inputType
                    })
                  }}> {inputType && (<Icon type="eye-o" />) || (<Icon type="eye" />)}<FormattedMessage id="Login.Show password" defaultMessage="Show password" /></div>
                </div>
              </FormItem>
              <FormItem>
                <div >
                {getFieldDecorator('agreeto', {
                  valuePropName: 'checked',
                  initialValue: true,
                })(
                  <Checkbox className="login_item"><FormattedMessage id="Login.Signuptips1" defaultMessage="By signing up, I agree to 55km’s" />
                    <Link to={'/user-agreement'}><FormattedMessage id="Login.Signuptips2" defaultMessage="Terms and Conditions" /></Link></Checkbox>
                )}

                </div>
              </FormItem>
              <FormItem>
                <Button type="next" onClick={()=>{this._submitFormSign(usePhoneSignup)}} className="login_form_button">
                  <FormattedMessage id={'Index.Header.Sign up'} defaultMessage={'Sign up'} />
                </Button>
              </FormItem>
            </Form>
          </div>
          <div className="login_form_wrap_footer">
            <FormattedMessage id={'Login.Already have an account?'} defaultMessage={'Already have an account? '} /><Link onClick={()=>{
              this._openLogin(true)
            }}><FormattedMessage id={'Login.Log in'} defaultMessage={'Log in'} /></Link>
          </div>
        </div>
      )
  }
  _renderLogin () {
    const { getFieldDecorator } = this.props.form;
    const {openLogin,intl} = this.props
    const {inputType,usePhoneLogin,findpwd,securityCodeText,securityCodeSending,signUpbox} = this.state
    if (signUpbox) {
      return false
    }
    const width = (window.document.body.offsetWidth<768) && 80 || 120
    const placeholder1 = intl.formatMessage({id:"Login.placeholder1", defaultMessage: "Phone number/Email"})
    const placeholder11 = intl.formatMessage({id:"Login.placeholder11", defaultMessage: "Phone number"})
    const placeholder2 = intl.formatMessage({id:"Login.placeholder2", defaultMessage: "Email"})
    const placeholder3 = intl.formatMessage({id:"Login.placeholder3", defaultMessage: "Password"})
    const message1 = intl.formatMessage({id:"Login.message1", defaultMessage: "Please input Phone number/Email!"})
    const message11 = intl.formatMessage({id:"Login.message11", defaultMessage: "Please input Phone number!"})
    const message2 = intl.formatMessage({id:"Login.message2", defaultMessage: "Please input Email!"})
    const message22 = intl.formatMessage({id:"Login.message22", defaultMessage: "The input is not valid E-mail!"})
    const message3 = intl.formatMessage({id:"Login.message3", defaultMessage: "Please input your Password!"})


    const selectBefore = (
          getFieldDecorator('countryCode', {
          initialValue: 86,
          rules: [{ required: true }],
          })(
            <Select  style={{ width: width }}>
                {mobile_area.map((item,index)=>{
                  return (<Option value={item.code} key={index}>{'+'+item.code}</Option>)
                })}
            </Select>
          )
      );
    if (!openLogin) {
      return null
    }
    if (findpwd) {
      return(
      <div className="login_form_wrap">
        <div className="login_form_wrap_header"><FormattedMessage id={'Login.Reset Password'} defaultMessage={'Reset Password'} /></div>
        <div className="login_form_wrap_body">
          <Form  className="login_form">
            <FormItem>
              {getFieldDecorator('mobileNum', {
              rules: [{ required: true, message: message11 }],
              })(
                <Input addonBefore={selectBefore} placeholder={placeholder11} suffix={<Icon type="phone" />}/>
              )}
            </FormItem>
            <FormItem>
                <Row>
                  <Col span={13}>
                    <FormItem>
                      {getFieldDecorator('securityCode',{
                        rules: [{
                          required: true
                        } ]})(
                         <Input />
                       )}
                     </FormItem>
                   </Col>
                   <Col span={2}>
                    </Col>
                   <Col span={9}>
                     <Button type="ghost" disabled={securityCodeSending} style={{height:44}} onClick={()=>{this._getSecurityCode(true)}} className="login_form_button">
                        {securityCodeText || <FormattedMessage id={'Dashboard.Verifications.Send SMS'} defaultMessage={'Send SMS'} />}
                     </Button>
                  </Col>
                </Row>
            </FormItem>
            <FormItem>
              {getFieldDecorator('newpassword', {
              rules: [{ required: true, message: message3 }],
              })(
                <Input type={'password'} placeholder={placeholder3}  suffix={<Icon type="lock" />}/>
              )}
            </FormItem>
            <FormItem>
              <Button type="next" onClick={()=>{this.findpassword()}} className="login_form_button">
                <FormattedMessage id={'Login.Change password'} defaultMessage={'Change password'} />
              </Button>
            </FormItem>
          </Form>
        </div>
      </div>
      )
    }

    return (<div className="login_form_wrap">
      <div className="login_form_wrap_header"><FormattedMessage id={'Index.Header.Log in'} defaultMessage={'Log in'} /></div>
      <div className="login_form_wrap_body">
        <Form  className="login_form">
        {
          usePhoneLogin && (<FormItem>
            {getFieldDecorator('mobileNum', {
            //initialValue: '13564411117',
            validateTrigger: ['onBlur'],
            rules: [{ required: true, message: message1 }],
            })(
              <Input placeholder={placeholder1} suffix={<Icon type="phone" />}/>
            )}
          </FormItem>) || (<FormItem>
            {getFieldDecorator('mobileNum', {
            validateTrigger: ['onBlur'],
            rules: [{
              type: 'email', message: message22,
            }, { required: true, message: message2 }],
            })(
              <Input  placeholder={placeholder2} suffix={<Icon type="phone" />}/>
            )}
          </FormItem>)
        }

          <FormItem>
            {getFieldDecorator('password', {
            rules: [{ required: true, message: message3 }],
            })(
              <Input  type={inputType && 'password' || 'input'} placeholder={placeholder3}  suffix={<Icon type="lock" />}/>
            )}
          </FormItem>
          <FormItem>
            <div className="flex login_flex">
              {getFieldDecorator('remember', {
                valuePropName: 'checked',
                initialValue: true,
              })(
                <Checkbox className="login_item"><FormattedMessage id="Login.Remember me" defaultMessage="Remember me" /></Checkbox>
              )}
              <div className="login_item" onClick={()=>{
                this.setState({
                  inputType: !inputType
                })
              }}> {inputType && (<Icon type="eye-o" />) || (<Icon type="eye" />)}<FormattedMessage id="Login.Show password" defaultMessage="Show password" /></div>
            </div>
          </FormItem>
          <FormItem>
            <div className="flex login_flex">
              {/*<Link className="login_item" onClick={()=>{
                this.setState({
                  usePhoneLogin: !usePhoneLogin
                })
              }}>{tips1}</Link>*/}
              <span></span>
              <Link className="login_item" onClick={()=>{
                this.setState({
                  findpwd: true
                })
              }}><FormattedMessage id="Login.Forgot password?" defaultMessage="Forgot password?" /></Link>
            </div>
          </FormItem>
          <FormItem>
            <Button type="next" onClick={()=>{this._submitForm()}} className="login_form_button">
              <FormattedMessage id={'Index.Header.Log in'} defaultMessage={'Log in'} />
            </Button>
          </FormItem>
        </Form>
      </div>
      <div className="login_form_wrap_footer">
        <FormattedMessage id={'Login.Don’t have an account?'} defaultMessage={'Don’t have an account? '} /><Link onClick={()=>{
          this._openSignup(true)
        }}><FormattedMessage id={'Login.Sign up'} defaultMessage={'Sign up'} /></Link>
      </div>
    </div>)
  }
  render() {
    const {openLogin,openSignup,force} = this.props
    const top = (window.document.body.offsetWidth<768) && 1 || 100
    return (
      <div className="minh8023">
        <Header />
        <div className="container">
          {this.props.children}
        </div>
        <Footer/>
        <Modal visible={openLogin || openSignup}
          onCancel={()=>{
            this._openLogin(false)
            this._openSignup(false)
          }}
          style={{ top: top }}
          width={480}
          closable={!force}
          maskClosable={!force}
          footer={''}
          wrapClassName="login_modal"
        >
            {openLogin && this._renderLogin()}
            {openSignup && this._renderSingup()}
          </Modal>
      </div>
    )
  }
}
function select(store){
  return {
    openLogin: store.User.openLogin,
    openSignup:store.User.openSignup,
    isLogin: store.User.isLogin,
    userData: store.User.userData,
    userProfile: store.User.userProfile,
    loginSignupCB: store.User.loginSignupCB,
    force:store.User.force
  }
}
App.propTypes = {
  intl: intlShape.isRequired
}
App = injectIntl(App)
App = Form.create()(App)
App = connect(select)(App)
App.contextTypes = contextTypes
module.exports = App
