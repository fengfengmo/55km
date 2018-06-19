/**
 * 系统设置页面
 */
import React from 'react';
import { connect } from 'react-redux'
import { Link,browserHistory } from 'react-router'
import { Form,Button,Icon,Spin,Input,notification } from 'antd';
import styles from './index.scss'

import LeftBar from 'components/LeftBar'
import DashboardHeader from 'components/Header/DashboardHeader'
import {_changepassword} from 'api'
import { FormattedMessage,injectIntl,intlShape } from 'react-intl'
import {signOut} from 'actions/User'
const FormItem = Form.Item;
class Setting extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      isLoading :false
    }
  }
  // componentWillMount (){
  //   const {dispatch,userData} = this.props
  // }
  _save (){
    const {dispatch,userData} =this.props
    this.props.form.validateFields((error, value) => {
      if (!!!error) {
        value.userId = userData.userId
        //console.log(value)
        _changepassword(value).then((res)=>{
          //console.log(res)
          notification.success({
            message: '成功',
            description:"密码已修改，请重新登录。"
          })
          this._signOut()
        })
      }
    })
  }
  async _signOut () {
    const {dispatch} =this.props
    await dispatch(signOut())
    browserHistory.push('/')
  }
  render() {
    const {intl} = this.props
    const {getFieldDecorator,setFieldsValue} = this.props.form
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const label0 = intl.formatMessage({id:"Setting.Change password", defaultMessage: "Change password"})
    const label1 = intl.formatMessage({id:"Setting.Old password", defaultMessage: "Old password"})
    const label2 = intl.formatMessage({id:"Setting.New password", defaultMessage: "New password"})
    const label3 = intl.formatMessage({id:"Setting.Confirm password", defaultMessage: "Confirm password"})
    return (
      <div>
        <DashboardHeader />
        <div className="max_width flex setting_wrap">
          <LeftBar type={'dashboard'}></LeftBar>
          <div className="dashboard_right">
            <h1 className="list_title"><FormattedMessage id={'Dashboard.Item.Setting'} defaultMessage={'Setting'} /></h1>
              {/*<Form>
                <FormItem
                  {...formItemLayout}
                  className="form_item_title"
                  label={'Change Email'}
                />

                  <FormItem
                    {...formItemLayout}
                    label={'Email'}
                  >
                  {getFieldDecorator('email',{
                    rules: [
                      { required: true},
                    ],
                  })(
                    <Input />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={' '}
                  >
                  <div className="save_bnt">
                    <Button type="primary" className="save" onClick={()=>{

                      }}>Save</Button>
                   </div>
               </FormItem>
            </Form>*/}

            <Form>
              <FormItem
                {...formItemLayout}
                className="form_item_title"
                label={label0}
              />
                <FormItem
                  {...formItemLayout}
                  label={label1}
                >
                {getFieldDecorator('oldPassword',{
                  rules: [
                    { required: true},
                  ],
                })(
                  <Input type={'password'} />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={label2}
              >
              {getFieldDecorator('password',{
                rules: [
                  { required: true},
                ],
              })(
                <Input type={'password'} />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={label3}
            >
            {getFieldDecorator('password2',{
              rules: [
                { required: true},
              ],
            })(
              <Input type={'password'} />
            )}
          </FormItem>
              <FormItem
                {...formItemLayout}
                label={' '}
                >
                <div className="save_bnt">
                  <Button type="primary" className="save" onClick={()=>{
                    this._save()
                    }}><FormattedMessage id={'Setting.Save'} defaultMessage={'Save'} /></Button>
                 </div>
             </FormItem>
          </Form>
          </div>
        </div>
      </div>
    )
  }
}

function select(store){
  return {
    userData: store.User.userData,
  }
}
Setting.propTypes = {
  intl: intlShape.isRequired
}
Setting = injectIntl(Setting)
Setting = Form.create()(Setting);
Setting = connect(select)(Setting)
module.exports = Setting;
