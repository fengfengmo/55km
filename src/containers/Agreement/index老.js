import React from 'react';
import { title, html } from './index.md';
import styles from './index.scss'
class Agreement extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="agreement">
        <div className="max_width960 markdown">
          <div dangerouslySetInnerHTML={{ __html: html }} />
         </div>
      </div>
    )
  }
}
// export default Home;
module.exports = Agreement
