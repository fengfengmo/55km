import React from 'react';
import { Link } from 'react-router'
import {dashboard_item}  from 'utils/'
import { FormattedMessage } from 'react-intl'
import styles from './index.scss'

class DashboardHeader extends React.Component {
  constructor(...args) {
    super(...args);
  }
  render() {
    return (
      <header className="dashboard_header">
        <div className="max_width">
          <ul>
            {
              dashboard_item.map((item,index) => {
                return (
                  <li>
                    <Link className="dashboard_item_nav" to={item.uri} activeClassName="active">
                      <FormattedMessage id={'Dashboard.Item.'+item.title} defaultMessage={item.title} />
                    </Link>
                  </li>
                )
              })
            }
          </ul>
        </div>
      </header>
    )
  }
}
module.exports = DashboardHeader;
