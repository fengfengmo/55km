import React from 'react';
import styles from './index.scss'
class NewsDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      html:null
    }
  }
  componentWillMount () {
    const {location,params } = this.props
    const data = require('./index'+parseInt(params.slug)+'.md');
    this.setState({
      html: data.html,
    })
  }
  render() {
    const {html} = this.state
    if (!html) {
      return
    }
    return (
      <div className="newsdetail">
        <div className="max_width960 markdown">
          <div dangerouslySetInnerHTML={{ __html: html }} />
         </div>
      </div>
    )
  }
}
module.exports = NewsDetail
