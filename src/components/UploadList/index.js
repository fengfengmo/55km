import React from 'react';
import Animate from 'rc-animate';
//import Icon from '../icon';
const prefixCls = 'ant-upload';
// import Progress from '../progress';
import {Progress,Icon,Input} from 'antd';
import classNames from 'classnames';
import styles from './index.scss'

// https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
const previewFile = (file, callback) => {
  const reader = new FileReader();
  reader.onloadend = () => callback(reader.result);
  reader.readAsDataURL(file);
};

export default class UploadList extends React.Component {
  static defaultProps = {
    listType: 'text',  // or picture
    items: [],
    progressAttr: {
      strokeWidth: 3,
      showInfo: false,
    },
  };

  handleClose = (file,index) => {

      //this.props.items.splice(index, 1);
      //this.props.items = []
    if (this.props.onRemove) {
    //  e.preventDefault();
      return this.props.onRemove(this.props.items,file,index)
    }
  }
  handlePin = (file,index) => {
    const {items} = this.props
    const data = Array.from(items,(item,index2)=>{
      return {
        ...item,
        default: index ===index2 && 1 || 0
      }
    })
    console.log(data)
    if (this.props.onChange) {
    //  e.preventDefault();
      return this.props.onChange(data)
    }
  }
  handlePreview = (file, e) => {
    if (this.props.onPreview) {
      e.preventDefault();
      return this.props.onPreview(file);
    }
  }
  inputonChange = (file, e, index) => {
    // 改名字 测试用例。。待修改
    file.description = e.target.value
    let {items} = this.props
    items[index] = file
    this.props.items = items
  }

  componentDidUpdate() {
    if (this.props.listType !== 'picture' && this.props.listType !== 'picture-card') {
      return;
    }
    this.props.items.forEach(file => {
      if (typeof document === 'undefined' ||
          typeof window === 'undefined' ||
          !window.FileReader || !window.File ||
          !(file.originFileObj instanceof File) ||
          file.url !== undefined) {
        return;
      }
      /*eslint-disable */
      file.url = '';
      /*eslint-enable */
      previewFile(file.originFileObj, (previewDataUrl) => {
        /*eslint-disable */
        file.url = previewDataUrl;
        /*eslint-enable */
        this.forceUpdate();
      });
    });
  }

  render() {
    let list = this.props.items && this.props.items.length>0 &&this.props.items.sort((a,b)=>{ return a.sort - b.sort}).map((file,index) => {
      let progress;
      let icon = (
        <a
          className={`${prefixCls}-list-item-thumbnail`}
          onClick={e => this.handlePreview(file, e,index)}
          href={file.url}
          target="_blank"
        >
          <img src={file.url+'?imageView2/3/w/200/format/jpg'} alt={file.description} />
        </a>
      );
      const infoUploadingClass = classNames({
        [`${prefixCls}-list-item`]: true,
      });
      return (
        <div className={infoUploadingClass} key={file.url||file.photoUrl}>
          <div className={`${prefixCls}-list-item-info`}>
            {icon}
            <span
              className={`${prefixCls}-list-item-name`}

            >
            <Input
              onChange={e => this.inputonChange(file, e,index)}
              defaultValue={file.description}
              />
            </span>
            {
              this.props.listType === 'picture-card' && file.status !== 'uploading'
              ? (
                <span>
                  <a
                    href={file.url}
                    target="_blank"
                    style={{ pointerEvents: file.url ? '' : 'none' }}
                    onClick={e => this.handlePreview(file, e)}
                  >
                    <Icon type="eye-o" />
                  </a>
                  <Icon type={file.default===1 && 'pin_on' || 'pin'} onClick={() => this.handlePin(file,index)} />
                  <Icon type="delete" onClick={() => this.handleClose(file,index)} />
                </span>
              ) : <Icon type="cross" onClick={() => this.handleClose(file,index)} />
            }
          </div>

        </div>
      );
    });
    const listClassNames = classNames({
      [`${prefixCls}-list`]: true,
      [`${prefixCls}-list-${this.props.listType}`]: true,
    });
    return (
      <div className={listClassNames}>
        <Animate transitionName={`${prefixCls}-margin-top`}>
          {list}
        </Animate>
      </div>
    );
  }
}
