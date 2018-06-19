import React from 'react';
import { title, html } from './index.md';
import styles from './index.scss'
class Aboutus extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="aboutus">
        <div className="max_width960 markdown">
          <div dangerouslySetInnerHTML={{ __html: html }} />
         </div>
      </div>
    )
  }
}

module.exports = Aboutus
