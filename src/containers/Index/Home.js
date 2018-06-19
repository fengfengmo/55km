import React from 'react';
class Home extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    //const {children} = this.props
    return (
      <div className="home">
        <div>
          <img src="http://s.trip55.com/images/header.jpg" />
        </div>
      </div>
    )
  }
}
// export default Home;
module.exports = Home
