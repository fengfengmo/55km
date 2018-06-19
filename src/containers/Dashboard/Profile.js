/**
 * 个人信息编辑
 */
import React from 'react';
import { connect } from 'react-redux'
import { Link,browserHistory } from 'react-router'
import { Button,Icon,Spin,Form,Input,DatePicker,Radio,Select,Row,Col} from 'antd';
import styles from './index.scss'
import Profilestyles from './Profile.scss'
import TripItem from 'components/TripItem'
import LeftBar from 'components/LeftBar'
import UploadList from 'components/UploadList'
import QiniuUpload from 'components/QiniuUpload'
import { FormattedMessage } from 'react-intl'
import moment from 'moment';
import {getGrouptourAuthor} from 'actions/Trip'
import {trackEvent} from 'actions/common'
import {getUser,putUser} from 'actions/User'
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;


const dateFormat = 'YYYY/MM/DD';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      isLoading :false,
      fileList: [],
      newAvatarUrl: {},
    }
    this._checkuPloadPhotos = this._checkuPloadPhotos.bind(this)
  }
  componentDidMount (){
    const {dispatch,userData} = this.props
    dispatch(getUser(userData.userId)).then(()=>{
      const {userProfile} = this.props
      const data ={
        ...userProfile,
        birthday: userProfile.birthday && moment.unix(userProfile.birthday/1000) || null
      }

      this._setData(data)
      /**
       * 处理照片
       * @type {Object}
       */
      const photos = data.photos && Array.from(data.photos, (item,index) => {
         return Object.assign({},item,{
           url: item.photoUrl
         })
       }) || []
      this.setState({
        newAvatarUrl: {
          url: data.avatarUrl
        },
        fileList: photos
      })
      this._setData({
        uploadPhotos: photos
      })
    })
  }
  /**
   * 赋值数据到from表单
   */
  _setData (data) {
    const {setFieldsValue} = this.props.form
    setFieldsValue(data)
  }
  /**
   * 更新用户信息
   */
  _putUser(){
    const {dispatch,userData,form} = this.props
    form.validateFields((error, value) => {
      value.avatarUrl= this.state.newAvatarUrl.url
      value.birthday = moment(value.birthday).unix()*1000
      value.photos = this._reformPhotos()
       if (!error) {
        dispatch(putUser(userData.userId,value))
       }

    });
  }
  /**
   * 处理照片
   */
  _reformPhotos (){
    const {getFieldValue} = this.props.form
    const data  = getFieldValue('uploadPhotos').filter((item)=>{
      return item.default === 1
    })
    return Array.from(getFieldValue('uploadPhotos'), (item,index) => {
      return Object.assign({},item,{
        default: (data.length===0 && index=== 0) && 1 || (item.default===1 && 1) ||  0,
        photoUrl: item.url || item.photoUrl
      })
    })
  }
  /**
   * checkuPloadPhotos 检查照片数量 最低3
   */
  _checkuPloadPhotos (rule, value, callback){
    let error = false
    if (value && value.length<3) {
      error = true
    }
    if (!error) {
     callback();
     return;
   }
   callback('checkuPloadPhotos!');
  }
  render() {
    const {userData} = this.props
    const {getFieldDecorator,setFieldsValue} = this.props.form
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    let divStyle ={}
    if (this.state.newAvatarUrl && this.state.newAvatarUrl.url) {
      divStyle = {
        backgroundImage: 'url(' + this.state.newAvatarUrl.url + '?imageView2/1/w/240/h/240)'
      };
    }else{
      const avatarUrl = userData.avatarUrl || '/static/images/usericon_120.png'
      divStyle = {
        backgroundImage: 'url(' + avatarUrl + '?imageView2/1/w/240/h/240)'
      };
    }
    return (
      <div className="max_width flex profile_wrap">
        <LeftBar></LeftBar>
        <div className="dashboard_right">
          <div >
            <Form>
              <FormItem
                {...formItemLayout}
                label={' '}
                >
                <div className="avatar_big" style={divStyle} ></div>
                  <QiniuUpload
                    classNames="qiniu_upload"
                    usertoken={userData.token}
                    type={'single'}
                    onChange={(data)=>{
                      if (data && data.length!==0) {
                        trackEvent('用户行为','avatar','success')
                        this.setState({
                          newAvatarUrl : data.pop()
                        })
                      }
                    }}>
                    <Button type="primary" className="upload_avatar"><FormattedMessage id={'Dashboard.Profile.Browse picture'} defaultMessage={'Browse picture'} /></Button>

                  </QiniuUpload>
               </FormItem>
              <FormItem
                {...formItemLayout}
                label={<FormattedMessage id={'Dashboard.Profile.Name'} defaultMessage={'Name'} />}
                className="profile_item_two"
                >
                <Row>
                  <Col span={11}>
                    <FormItem>
                      {getFieldDecorator('familyName',{
                        rules: [{
                          required: true
                        } ]})(
                         <Input />
                       )}
                     </FormItem>
                   </Col>
                   <Col span={2}>
                    </Col>
                   <Col span={11}>
                     <FormItem>
                     {getFieldDecorator('givenName',{
                       rules: [{
                         required: true
                       } ]})(
                        <Input />
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </FormItem>
               <FormItem
                 {...formItemLayout}
                 label={<FormattedMessage id={'Dashboard.Profile.Nickname'} defaultMessage={'Nickname'} />}
                 >
                 {getFieldDecorator('nickname',{
                   rules: [{
                     required: true
                   } ]})(
                    <Input />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={<FormattedMessage id={'Dashboard.Profile.Date of birth'} defaultMessage={'Date of birth'} />}
                  >
                  {getFieldDecorator('birthday',{
                    rules: [{
                      required: true
                    } ]})(
                      <DatePicker format={dateFormat} size={'large'}/>
                   )}
                 </FormItem>
                 <FormItem
                   {...formItemLayout}
                   label={<FormattedMessage id={'Dashboard.Profile.Gender'} defaultMessage={'Gender'} />}
                   className="profile_item_flex"
                   >
                   {getFieldDecorator('gender',{
                     rules: [{
                       required: true
                     } ]})(
                       <RadioGroup >
                          <Radio value={'male'}><FormattedMessage id={'Dashboard.Profile.Gender.male'} defaultMessage='Male' /></Radio>
                          <Radio value={'female'}><FormattedMessage id={'Dashboard.Profile.Gender.female'} defaultMessage='Female' /></Radio>
                          <Radio value={'other'}><FormattedMessage id={'Dashboard.Profile.Gender.other'} defaultMessage='Other' /></Radio>

                        </RadioGroup>
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label={<FormattedMessage id={'Dashboard.Profile.Languages'} defaultMessage={'Languages'} />}
                    >
                    {getFieldDecorator('language',{
                      rules: [{
                        required: true
                      } ]})(
                      <Select size="large" style={{ width: '100%' }} multiple >
                      <Option value="Chinese"><FormattedMessage id={'Common.Language.Chinese'} defaultMessage='Chinese' /></Option>
                      <Option value="English"><FormattedMessage id={'Common.Language.English'} defaultMessage='English' /></Option>
                      <Option value="Thai"><FormattedMessage id={'Common.Language.Thai'} defaultMessage='Thai' /></Option>
                      <Option value="Vienamese"><FormattedMessage id={'Common.Language.Vienamese'} defaultMessage='Vienamese' /></Option>
                      <Option value="Japanese"><FormattedMessage id={'Common.Language.Japanese'} defaultMessage='Japanese' /></Option>
                      <Option value="Singlish"><FormattedMessage id={'Common.Language.Singlish'} defaultMessage='Singlish' /></Option>
                      <Option value="Malay"><FormattedMessage id={'Common.Language.Malay'} defaultMessage='Malay' /></Option>
                      <Option value="Indonesian"><FormattedMessage id={'Common.Language.Indonesian'} defaultMessage='Indonesian' /></Option>
                      </Select>
                     )}
                   </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label={<FormattedMessage id={'Dashboard.Profile.Country of Passport'} defaultMessage={'Country of Passport'} />}
                    >
                    {getFieldDecorator('country',{
                      rules: [{
                        required: true
                      } ]})(
                      <Select size="large" style={{ width: '100%' }} >
                        <Option value="China"><FormattedMessage id={'Dashboard.Profile.Country.China'} defaultMessage={'China'} /></Option>
                        <Option value="Thailand"><FormattedMessage id={'Dashboard.Profile.Country.Thailand'} defaultMessage={'Thailand'} /></Option>
                        <Option value="Vietnam"><FormattedMessage id={'Dashboard.Profile.Country.Vietnam'} defaultMessage={'Vietnam'} /></Option>
                        <Option value="Japan"><FormattedMessage id={'Dashboard.Profile.Country.Japan'} defaultMessage={'Japan'} /></Option>
                        <Option value="Singaporean"><FormattedMessage id={'Dashboard.Profile.Country.Singaporean'} defaultMessage={'Singaporean'} /></Option>
                        <Option value="Malaysian"><FormattedMessage id={'Dashboard.Profile.Country.Malaysian'} defaultMessage={'Malaysian'} /></Option>
                        <Option value="Indonesian"><FormattedMessage id={'Dashboard.Profile.Country.Indonesian'} defaultMessage={'Indonesian'} /></Option>
                        <Option value="Others"><FormattedMessage id={'Dashboard.Profile.Country.Others'} defaultMessage={'Others'} /></Option>


                      </Select>
                     )}
                   </FormItem>
                   <FormItem
                     {...formItemLayout}
                     label={<FormattedMessage id={'Dashboard.Profile.Current city'} defaultMessage={'Current city'} />}
                     >
                     {getFieldDecorator('city',{
                       rules: [{
                         required: true
                       } ]})(
                         <Input />
                      )}
                    </FormItem>
                    <FormItem
                      {...formItemLayout}
                      label={<FormattedMessage id={'Dashboard.Profile.Address'} defaultMessage={'Address'} />}
                      >
                      {getFieldDecorator('address',{
                        rules: [{
                          required: true
                        } ]})(
                          <Input type={'textarea'} rows={4}/>
                       )}
                     </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label={<FormattedMessage id={'Dashboard.Profile.About yourself'} defaultMessage={'About yourself'} />}
                    >
                    {getFieldDecorator('aboutYourself',{
                      rules: [{
                        required: true
                      } ]})(
                        <Input type={'textarea'} rows={4}/>
                     )}
                   </FormItem>
                   <div className='form_item_upload'>
                   <div className="form_item_label"><FormattedMessage id={'Dashboard.Profile.Photos'} defaultMessage={'Photos'} /></div>
                   <div className="form_item_tips">
                    <FormattedMessage id={'Dashboard.Profile.Photos.p'} defaultMessage={'Please upload at least 3 pictures.'} />

                     <span><FormattedMessage id={'Dashboard.Profile.Photos.p2'} defaultMessage={'Tell more detail about your picture.'} /></span>
                   </div>
                   <FormItem

                     >
                     <UploadList listType='picture-card'
                        items={this.state.fileList}
                        onChange={(data)=>{
                          // console.log(data)
                          this.setState({
                            fileList : data
                          },()=>{
                            setFieldsValue({
                              uploadPhotos: data
                            })
                          })
                        }}
                        onRemove={(items,file,index)=>{
                          const {fileList} = this.state
                          let uploadPhotosItem = fileList.filter(item => item.url !== file.url)
                          this.setState({
                            fileList : uploadPhotosItem
                          },()=>{
                            setFieldsValue({
                              uploadPhotos: uploadPhotosItem
                            })
                          })
                        }}
                      />
                     {getFieldDecorator('uploadPhotos', {
                       name: 'file',
                       rules: [{
                         required: true,
                         type:'array',
                         validator: this._checkuPloadPhotos
                       }]
                     })(

                     <QiniuUpload
                       fileList={this.state.fileList}
                       classNames="qiniu_upload"
                       usertoken={userData.token}
                       onChange={(data)=>{
                         this.setState({
                           fileList : data
                         })
                       }}>
                       <div>
                          <Icon type="add" />
                          <div className="ant-upload-text">Upload</div>
                        </div>
                     </QiniuUpload>

                   )}
                    </FormItem>
                  </div>
                   <FormItem
                     {...formItemLayout}
                     label={' '}
                     >
                     <div className="save_bnt">
                       <Button type="next" className="save" onClick={()=>{
                           this._putUser()
                         }}><FormattedMessage id={'Dashboard.Profile.Save Changes'} defaultMessage={'Save Changes'} /></Button>
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
    userProfile: store.User.userProfile,
    authorIdGroupTour: store.Trip.authorIdGroupTour,
  }
}
Profile = Form.create()(Profile);
Profile = connect(select)(Profile)
module.exports = Profile;
