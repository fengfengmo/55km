import React from 'react';
import { connect } from 'react-redux'
import styles from './index.scss'
import { Button,Icon,Spin,Tabs } from 'antd'
import { FormattedMessage, injectIntl, intlShape } from 'react-intl'
import DashboardHeader from 'components/Header/DashboardHeader'
import ReviewsItem from 'components/ReviewsItem'
import LeftBar from 'components/LeftBar'
import {_getReviewAbout,_getReviewBy} from 'api'
const TabPane = Tabs.TabPane

class Reviews extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      ReviewExpert: [],
      ReviewOrderer: [],
      ReviewExpertNum: 0,
      ReviewOrdererNum:0,
    }
  }
  componentWillMount () {
    const {userData } = this.props
    _getReviewAbout(userData.userId).then((res)=>{
      this.setState({
        ReviewExpert: res.data,
        ReviewExpertNum: res.headers['x-page-total']
      })
    //  console.log(res.headers['x-page-total'])
    })

    _getReviewBy(userData.userId).then((res)=>{
      this.setState({
        ReviewOrderer: res.data,
        ReviewOrdererNum:res.headers['x-page-total'],
      })
    //  console.log(res.headers['x-page-total'])
    })
  }
  render() {
    const {intl,userData} = this.props
    const {ReviewExpert,ReviewOrderer} = this.state
    const ReviewsAbout = intl.formatMessage({id:"Reviews.Tabs.About You", defaultMessage: "Reviews About You"})
    const ReviewsBy = intl.formatMessage({id:"Reviews.Tabs.By You", defaultMessage: "Reviews By You"})
    return (
      <div>
      <DashboardHeader />
      <div className="max_width flex reviews_wrap">
          <LeftBar></LeftBar>
          <div className="dashboard_right">
            <h1 className="list_title"><FormattedMessage id="Dashboard.Item.Reviews" defaultMessage="Reviews" /></h1>
            <Tabs defaultActiveKey="1" >
              <TabPane tab={ReviewsAbout} key="1">
                <div>
                  <p className="tips">You will see all past reviews here.Any hidden reviews indicate that you still need to complete a review and that the review period(14 days after trip ends)is still open.</p>
                  <ReviewsItem data={ReviewExpert} type={'reviews'} reply={true} userData={userData}/>
                </div>
              </TabPane>
              <TabPane tab={ReviewsBy} key="2">
                <ReviewsItem data={ReviewOrderer} type={'reviews'} reply={false} userData={userData}/>
              </TabPane>
            </Tabs>
         </div>
      </div>
      </div>
    )
  }
}
Reviews.propTypes = {
  intl: intlShape.isRequired
}
function select(store){
  return {
    userData: store.User.userData
  }
}
Reviews = injectIntl(Reviews)
Reviews = connect(select)(Reviews)
module.exports = Reviews
