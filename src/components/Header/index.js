import React from 'react';
import { Link,browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { Input,Button,Menu,Dropdown,Icon,Badge,Select } from 'antd';
import styles from './index.scss'
import {signIn,openLogin,openSignup,signOut} from 'actions/User'
import {dashboard_item,groupDestinations,sortByBestinations}  from 'utils'
import {trackEvent} from 'actions/common'
const Option = Select.Option
const OptGroup = Select.OptGroup
const Search = Input.Search;
import { FormattedMessage, injectIntl,intlShape  } from 'react-intl';

class Header extends React.Component {
  constructor(...args) {
    super(...args);
    this.state={
      mobile_menu_wrap: false,
      logout: false,
    }
  }
  // _singin(){
  //   const {dispatch} =this.props
  //   dispatch(signIn('13564411117','123456'))
  // }
  async _signOut () {
    const {dispatch} =this.props
    trackEvent('用户行为','loginOut','success')
    await dispatch(signOut())
    browserHistory.push('/')
  }
  _openLogin(type){
    const {dispatch} = this.props
    dispatch(openLogin(type))
  }
  _openSignup(type){
    const {dispatch} = this.props
    dispatch(openSignup(type))
  }
  onSelectSearch (keyword) {
    if (keyword) {
      trackEvent('用户行为','header/search',keyword)
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
  /**
   * 搜索
   */
  onSearch(keyword){
    if (keyword) {
      browserHistory.push('/search/Any?title='+keyword)
    }
  }
  /**
   * 登录后渲染
   */
  _renderUser (){
    const {userData} = this.props
    const avatarUrl = userData.avatarUrl || '/static/images/usericon_120.png';
    const menu = (
      <Menu>
        <Menu.Item key="1">
          <Link to={'/dashboard'} onClick={()=>{trackEvent('用户行为','header/menu','clcik')}}><FormattedMessage id={'Dashboard.Item.Dashboard'} defaultMessage={'Dashboard'} /></Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link onClick={()=>{this._signOut()}}><FormattedMessage id={'Index.Header.Log out'} defaultMessage={'Log out'} /></Link>
        </Menu.Item>
      </Menu>
    );
    // const divStyle = {
    //   backgroundImage: 'url(' + avatarUrl + ')'
    // };
    const {mobile_menu_wrap} = this.state
    const _className = mobile_menu_wrap && 'mobile_menu_wrap mobile_menu_wrap_in' || 'mobile_menu_wrap'
    return (
      <nav>
        <ul>
          <li>
            <Dropdown overlay={menu}>
              <Link className="header_user_bar" to={'/dashboard'} >
                <div className="avatar_48" style={{backgroundImage: 'url(' + avatarUrl + '?imageView2/1/w/120/h/120)'}}></div>
                <span className="avatar_48_span">{userData.nickname}</span>
              </Link>
            </Dropdown>
          </li>
          <li>
            <Link to={'/dashboard/listing'} className="bnt_item">
              <FormattedMessage id={'Dashboard.Item.Your Listings'} defaultMessage={'Your Listings'} />
            </Link>
          </li>
        </ul>
        <div className="mobile">
          <Badge dot>
            <Link to={'/dashboard/inbox'}>
              <Icon type="mail" />
            </Link>
          </Badge>
          <Icon type="menu" onClick={()=>{
            this.setState({
              mobile_menu_wrap: !this.state.mobile_menu_wrap
            })
          }}/>
        </div>

      </nav>
    )
  }
  /**
   * 登录前
   */
  _renderNav (){
    return(
      <nav>
        <ul>
          <li className="bnt_log_in">
            <Button style={{width:120}} type="ghost" size={'large'} onClick={()=>{this._openLogin(true)}}><FormattedMessage id={'Index.Header.Log in'} defaultMessage={'Log in'} /></Button>
          </li>
          <li className="bnt_sign_up">
            <Button style={{width:120}} type="ghost" size={'large'}  onClick={()=>{this._openSignup(true)}}><FormattedMessage id={'Index.Header.Sign up'} defaultMessage={'Sign up'} /></Button>
          </li>
          <li className="bnt_log_host">
            <Button style={{minWidth:120}} type="primary" size={'large'}>
              <Link to={'/dashboard/listing'}><FormattedMessage id={'Index.Header.Become a HOST'} defaultMessage={'Become a HOST'} /></Link>

            </Button>
          </li>
        </ul>
        <div className="mobile">
          <Icon type="menu" onClick={()=>{
            this.setState({
              mobile_menu_wrap: !this.state.mobile_menu_wrap
            })
          }}/>
        </div>
      </nav>
    )
  }
  render() {
    const {mobile_menu_wrap} = this.state
    const _className = mobile_menu_wrap && 'mobile_menu_wrap mobile_menu_wrap_in' || 'mobile_menu_wrap'
    const {type,isLogin,userData,locale,intl} = this.props
    const avatarUrl = userData.avatarUrl || '/static/images/usericon_120.png';
    const _placeholder = intl.formatMessage({id:"Index.Search.placeholder", defaultMessage: "Choose the destination"})
    return (
      <header className="header">
        <div className={type !=='index' && 'header_box top_bar header_box_top' || 'header_box top_bar' } >
          <div className="logo">
            <Link to={'/'}><Icon type={'logo_'+locale} /></Link>
          </div>
          {
            type !=='index' && (<div className="search_bar">
               {/*<Search placeholder="Where to go?"  onSearch={(keyword)=>{
                   this.onSearch(keyword)
                 }}/>*/}
                 <Select  size="large" placeholder={_placeholder} onChange={(value)=>{
                   //this._newFilter('destination',value)
                   this.onSelectSearch(value)
                 }}>
                 {this.getDestinations()}
               </Select>
            </div>)
          }
          {
            isLogin && this._renderUser() || this._renderNav()
          }
        </div>
        <div className={_className}>
          <div className="mobile_menu" onClick={()=>{
            this.setState({
              mobile_menu_wrap: !this.state.mobile_menu_wrap
            })
          }}>
          {
            isLogin && (  <div className="mobile_menu_body">
                <ul>
                  <li>
                    <Link className="header_user_bar" to={'/dashboard'} >
                      <div className="avatar_48" style={{backgroundImage: 'url(' + avatarUrl + '?imageView2/1/w/120/h/120)'}}></div>
                      <span className="avatar_48_span">{userData.nickname}</span>
                    </Link>
                  </li>
                  {
                    dashboard_item.slice(1,10).map((item,index) => {
                      return (
                        <li className="dashboard_item" key={index}>
                        {
                          index === 8  && (<Link  onClick={()=>{this._signOut()}}>
                            <Icon type={item.icon} />
                            <FormattedMessage id={'Dashboard.Item.'+item.title} defaultMessage={item.title} />
                          </Link>) || (
                            <Link to={item.uri} >
                              <Icon type={item.icon} />
                              <FormattedMessage id={'Dashboard.Item.'+item.title} defaultMessage={item.title} />
                            </Link>
                          )
                        }

                        </li>
                      )
                    })
                  }
                </ul>
              </div>) || (<div className="mobile_menu_body">
              <ul>
                <li/>
                <li className="dashboard_item">
                  <Link onClick={()=>{this._openSignup(true)}}>
                    <FormattedMessage id={'Index.Header.Sign up'} defaultMessage={'Sign up'} />
                  </Link>
                </li>
                <li className="dashboard_item">
                  <Link onClick={()=>{this._openLogin(true)}}>
                    <FormattedMessage id={'Index.Header.Log in'} defaultMessage={'Log in'} />
                  </Link>
                </li>
              </ul>
            </div>
          )}
          </div>
        </div>
      </header>
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
Header.propTypes = {
  intl: intlShape.isRequired
}
Header = injectIntl(Header)
Header = connect(select)(Header)
module.exports = Header;
