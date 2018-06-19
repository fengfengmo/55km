import React from 'react';
import { Link } from 'react-router'
import {Form,Input,Row,Col,Icon,Select,Button} from 'antd'
import styles from './index.scss'
import {mobile_area} from 'utils/'
const FormItem = Form.Item;
const Option = Select.Option;
//const keys = [1,2]
const testData = [{
  countryCode:13,
  email:123,
  familyName:412,
  givenName:14,
  passport:12,
  mobileNum:4125,
}]
class InformationItem extends React.Component {
  constructor(...args) {
    super(...args);
    this.state={
      informationValue: this.props.informationValue || [{index:0}]
    }
  }
  componentWillUpdate(nextProps, nextState) {
     this.props = nextProps;
     if (this.state.informationValue!==nextProps.informationValue) {
       this.state.informationValue = nextProps.informationValue
       this._creatStringify()
     }
   }
  _creatArray (){
    const { getFieldValue } = this.props.form;
    const { informationValue} =this.state

  //  const data = Array.from(keys, (item,index) => {
    const data = Array.from(informationValue, (item,index) => {
      return Object.assign({},item,{
        "index": item.index,
        "countryCode" :getFieldValue(`countryCode-${item.index}`),
        "email" :getFieldValue(`email-${item.index}`),
        "familyName" :getFieldValue(`familyName-${item.index}`),
        "givenName" :getFieldValue(`givenName-${item.index}`),
        "passport" :getFieldValue(`passport-${item.index}`),
        "mobileNum" :getFieldValue(`mobileNum-${item.index}`),
      })
    })
    return data
  }
  componentWillMount () {
    const {informationValue} = this.state
    this._creatStringify()
  }
  /**
   * json转string 赋值数据
   */
  _creatStringify (){
    const {informationValue} = this.state
    console.log(informationValue)
    const data =informationValue && informationValue.map((item,index)=>{
      let obj = {}
      obj[`countryCode-${index}`] = item.countryCode || 86
      obj[`email-${index}`] = item.email
      obj[`familyName-${index}`] = item.familyName
      obj[`givenName-${index}`] = item.givenName
      obj[`passport-${index}`] = item.passport
      obj[`mobileNum-${index}`] = item.mobileNum
      this._setData({...obj})
      return {
        ...obj
      }
    })
  }
  /**
   * 删除
   */
  _remove (k){
    const {informationValue} = this.state
    const {onChange} = this.props
    if (k===0) {
     return;
    }
    // if (informationValue.length < 2) {
    //  return;
    // }
    const item = informationValue.filter(key => parseInt(key.index) !== k)
    this.setState({
      //keys: keys.filter(key => parseInt(key.index) !== parseInt(k)),
      informationValue: item
    },()=>{
      onChange && onChange(item)
      this._creatStringify()
    })
  }
  /**
   * 新增
   */
  _add (){
    const { informationValue } = this.state;
    const nextKeys = informationValue.concat({index:informationValue.length});
    console.log(nextKeys)
    this.setState({
      informationValue: nextKeys
    },()=>{
      this._onChange()
      // console.log(this.state.keys)
    })
    // const { keys } = this.state;
    // const nextKeys = keys.concat({index:keys.length});
    // this.setState({
    //   keys: nextKeys
    // },()=>{
    //   this._onChange()
    //   // console.log(this.state.keys)
    // })
  }
  /**
   * 检测值的变动
   */
  _onChange () {
    const {onCompletion,onChange,form} = this.props
    // 慢一丢丢
    setTimeout(()=>{
      let data = this._creatArray()
      onChange && onChange(data)
    },120)
  }
  /**
   * 赋值数据到from表单
   */
  _setData (data) {
    const {setFieldsValue} = this.props.form
    setFieldsValue(data)
  }
  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const {informationValue} = this.state
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    return (
      <div className="information_item_wrap">
        {
          informationValue && informationValue.map((k, index) => {
            return (
              <div className="information_item" key={k.index}>
                <FormItem
                  {...formItemLayout}
                  label={'Name'}

                  >
                  <Row>
                    <Col span={11}>
                      <FormItem>
                        {getFieldDecorator(`familyName-${k.index}`,{
                          rules: [{
                            required: true
                          } ]})(
                           <Input placeholder="First Name" onChange={()=>{this._onChange()}}/>
                         )}
                       </FormItem>
                     </Col>
                     <Col span={2}>
                      </Col>
                     <Col span={11}>
                       <FormItem>
                       {getFieldDecorator(`givenName-${k.index}`,{
                         rules: [{
                           required: true
                         } ]})(
                          <Input  placeholder="Last Name" onChange={()=>{this._onChange()}}/>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={'Email'}
                  >
                  {getFieldDecorator(`email-${k.index}`,{
                    rules: [{
                      required: true
                    } ]})(
                      <Input onChange={()=>{this._onChange()}}/>
                   )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={'Mobile'}
                  >
                  <Row>
                    <Col span={6}>
                      <FormItem>
                        {getFieldDecorator(`countryCode-${k.index}`,{
                          defaultValue: 86,
                          rules: [{
                            required: true
                          } ]})(
                            <Select size="large"   style={{ width: '100%' }} onChange={()=>{this._onChange()}}>
                              {
                                mobile_area.map((item,index)=>{
                                  return(
                                    <Option value={item.code} key={index}>{'+'+item.code}</Option>
                                  )
                                })
                              }
                            </Select>
                         )}
                       </FormItem>
                     </Col>
                     <Col span={2}>
                      </Col>
                     <Col span={16}>
                       <FormItem>
                       {getFieldDecorator(`mobileNum-${k.index}`,{
                         rules: [{
                           required: true
                         } ]})(
                          <Input onChange={()=>{this._onChange()}}/>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={'Passport'}
                  hasFeedback={false}
                  >
                  {getFieldDecorator(`passport-${k.index}`,{
                    rules: [{
                      required: true
                    } ]})(
                      <Input  onChange={()=>{this._onChange()}}/>

                   )}
                   {/*<Select size="large" style={{ width: '100%' }} onChange={()=>{this._onChange()}} >
                     <Option value="chinese">中文</Option>
                     <Option value="english">English</Option>
                   </Select>*/}
                 </FormItem>
                 {
                   k.index !==0 && (
                     <div className="item_delete" onClick={(e)=>{
                         e.preventDefault()
                          this._remove(k.index)
                       }}>
                       <Icon type="delete" />
                     </div>
                   )
                 }

              </div>
            )
          })
        }
        <div className="information_item_add">

          <Button type="ghost" style={{ width: 160 }} onClick={()=>{
              this._add()
            }}>
            +Add
          </Button>
        </div>
      </div>
    )
  }
}
module.exports = InformationItem;
