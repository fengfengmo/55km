import React from 'react';
import { InputNumber,Row,Col} from 'antd';
import styles from './index.scss'
class AdvancePrice extends React.Component {
  constructor(...args) {
    super(...args);
    this.state={
      maximum: this.props.maximum,
      disabled: this.props.disabled,
      value: this.props.value || [],
      currency: this.props.currency,
      groupTourId: parseInt(this.props.groupTourId)
    }
  }
  handleChange(v,index){
    const { value,maximum } = this.state;
    const {onChange} = this.props
    let data = value
    let item = data[index]
    const description = v && (v*(index+1)).toString() || ''
    item = {
      ...item,
      description
    }
    data[index] = item
    this.setState({
      value: data
    },()=>{
      onChange && onChange(data)
    })
  }
  componentWillUpdate(nextProps, nextState) {
     this.props = nextProps;
     this.state.value = nextProps.value
     this.state.maximum = nextProps.maximum
     this.state.disabled = nextProps.disabled
     this.state.currency = nextProps.currency
     this.state.groupTourId = parseInt(nextProps.groupTourId)
   }
  renderItem (){
    const {value,maximum,disabled,groupTourId,currency} = this.state
    const {onChange} = this.props
    let pricingItems = value || [];
    const num = maximum
    if (pricingItems.length<num ) {
      let item= []
      for (var i = 0; i < (num-pricingItems.length); i++) {
        item.push({
          title: (pricingItems.length+1+i).toString(),
          groupTourId: parseInt(groupTourId),
          description: '',
        })
      }
      pricingItems = pricingItems.concat(item)
      this.setState({
        value: pricingItems
      },()=>{
        onChange && onChange(pricingItems)
      })
      return null
    }

    if (pricingItems.length>num) {
      pricingItems = pricingItems.slice(0, num)
      this.setState({
        value: pricingItems
      },()=>{
        onChange && onChange(pricingItems)
      })
      return null
    }
    return pricingItems.sort((a,b)=>{ return parseInt(a.title) - parseInt(b.title)}).map((item, index) => {
        return(<Row className="pricing_item_box flex " key={index+item.groupTourId}>
                <Col span={6} className="pricing_item_col">{item.title}</Col>
                <Col span={9} className="pricing_item_col">
                  <InputNumber
                    min={1}
                    disabled={disabled}
                    defaultValue={item.description && item.title && parseInt((parseFloat(item.description)  / parseInt(item.title)))}
                    onChange={(value)=>this.handleChange(value,index)}/>
                </Col>
                <Col span={9} className="pricing_item_col">
                  {
                  item.description || 0
                  }
                  {currency}
                </Col>
              </Row>);
    })
  }
  render() {
    const {value} = this.props
    return (
      <div className="advance_price">
        {
          this.renderItem()
        }
      </div>
    )
  }
}
module.exports = AdvancePrice;
