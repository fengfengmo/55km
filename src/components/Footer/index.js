import React from 'react';
import { Link } from 'react-router'
import { Select,Icon } from 'antd'
import { connect } from 'react-redux'
import {currencies} from 'utils/'
import styles from './index.scss'
import { addLocaleData,FormattedMessage } from 'react-intl'
const Option = Select.Option
class Footer extends React.Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    const {currency,dispatch,appLocale,locale} = this.props
    return (
      <footer className="footer">
        <div className="max_width footer_box clearafter">
          <div className="ft_nav international">
            <h4><FormattedMessage id="Footer.International" defaultMessage="International" /></h4>
            <div className="ft_nav_language">
              <FormattedMessage id="Footer.Language" defaultMessage="Language" /><br />
              <Select defaultValue={locale} onChange={(value)=>{
                dispatch({
                    type: 'SET_LOCALE',
                    data: value
                })
                  //addLocaleData(appLocale.data);
                  // console.log(appLocale)
              }}>
                 <Option value="zh">中文</Option>
                 <Option value="en">English</Option>
               </Select>
            </div>
            <div className="ft_nav_currency">
              <FormattedMessage id="Footer.Currency" defaultMessage="Currency" /><br />
              <Select defaultValue={currency} onChange={(value)=>{
                dispatch({
                    type: 'SET_CURRENCY',
                    data: value
                })
              }} >
                  {
                    currencies.map((item,index)=>{
                      return(
                        <Option value={item.value} key={index}>  <FormattedMessage id={'Common.Currencies.'+item.label} defaultMessage={item.label} /></Option>
                      )
                    })
                  }
               </Select>
            </div>
          </div>
          <div className="ft_nav about_us">
            <h4><FormattedMessage id="Footer.About us" defaultMessage="About us" /></h4>
            <ul>
              <li><Link to={'/aboutus'}><FormattedMessage id="Footer.About us" defaultMessage="About us" /></Link></li>
              <li><Link to={'/user-agreement'}><FormattedMessage id="Footer.User agreement" defaultMessage="User agreement" /></Link></li>

            </ul>
          </div>
          <div className="ft_nav become_a_host">
            <h4><FormattedMessage id="Footer.Become a HOST" defaultMessage="Become a HOST" /></h4>
            <ul>
              <li><Link to={'/dashboard/listing'}><FormattedMessage id="Footer.Become a HOST" defaultMessage="Become a HOST" /></Link></li>
              <li><Link to={'/help'}><FormattedMessage id="Footer.Support centre" defaultMessage="Support centre" /></Link></li>
            </ul>
          </div>
        </div>

        <div  className="footer_box2 clearafter">
          <div className="max_width flex">
            <div className="copyright">
              <Link to={'/'}><Icon type={'logo_'+locale} /></Link>
              <span >&copy; Naren Network Co.,Ltd.</span>
            </div>
            <div className="info">
            <span>沪ICP备15055883号</span></div>
          </div>
        </div>
      </footer>
    )
  }
}
function select(store){
  return {
    currency: store.Common.currency,
    locale: store.Common.locale,
    appLocale: store.Common.appLocale,
  }
}
Footer = connect(select)(Footer)
module.exports = Footer
