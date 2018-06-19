/**
 * 左侧导航
 * booking 用
 */
import React from 'react';
import { Link } from 'react-router'

import styles from './index.scss'
class RightBar extends React.Component {
  constructor(...args) {
    super(...args);
  }
  render() {
    return (
      <div className="right_bar">
        左侧
      </div>
    )
  }
}
module.exports = RightBar;
