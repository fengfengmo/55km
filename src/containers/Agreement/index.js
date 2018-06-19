import React from 'react';
import { connect } from 'react-redux'
//import { title, html } from './index.md';
import styles from './index.scss'
class Agreement extends React.Component {
  // constructor(props) {
  //   super(props);
  // }
  constructor(props) {
    super(props);
    // this.state={
    //   html:null
    // }
  }

  render() {
    const {locale} = this.props
    const data = require('./index_'+locale+'.md');
    if (!data) {
      return null
    }
    return (
      <div className="agreement">
        <div className="max_width960 markdown">
          <div dangerouslySetInnerHTML={{ __html: data.html }} />
         </div>
      </div>
    )
  }
}
// export default Home;
module.exports = Agreement

function select(store){
  return {
    isLogin: store.User.isLogin,
    userData: store.User.userData,
    locale: store.Common.locale
  }
}
Agreement = connect(select)(Agreement)
module.exports = Agreement
