import React from 'react';
import { Link } from 'react-router'
import moment from 'moment';
import {_getQiniu} from 'api'
import styles from './index.scss'
import {config} from 'utils/config'
class QiniuUpload extends React.Component {
  constructor(...args) {
    super(...args);
    this.state ={
      fileList: this.props.fileList || this.props.defaultFileList || []
    }
    //this._onChange= this._onChange.bind(this)
  }
  // 增加文件
  _addFile (json) {
    const {onChange} = this.props
    const {fileList} =this.state
    const uuid = fileList && fileList.length
    const data = {
      "url" : config.qiniu.domain + json.key,
      "description" : '',
      "sort":uuid,
      "default": 0,
    }
    // console.log(uuid)
    let nextFileList = fileList.concat();
    //nextFileList.push(data);
    nextFileList = nextFileList.concat(data);
    this.setState({
      fileList: nextFileList
    },()=>{
      console.log(nextFileList)
      onChange &&  onChange(nextFileList)
    });

  }
  componentWillUpdate(nextProps, nextState) {
     this.props = nextProps;
     this.state.fileList = nextProps.fileList || []
   }
  componentDidMount () {
    const {onChange} = this.props
    const {fileList} = this.state
    //setTimeout(()=>{
      this._uploadQiniu()
      onChange &&  onChange(fileList)
    //},12)
  }
  /**
   * 七牛上传
   */
   _uploadQiniu () {
     const {usertoken,type} = this.props
     let key = ''
     const uploader = new QiniuJsSDK().uploader({
         runtimes: 'html5,flash,html4',    //上传模式,依次退化
         browse_button: type && ('qiniu_pickfiles_'+type) || qiniu_pickfiles,       //上传选择的点选按钮，**必需**
         //uptoken_url: '/token',            //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
         //uptoken : uptoken, //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
         uptoken_func : (file)=> {
           // 直接返回
           const ajax = new XMLHttpRequest();
           key = 'webapi_'+moment().unix() +'_'+ Math.random().toString(36).substring(3, 8)+'_'+ Math.random().toString(36).substring(3, 8)
           const url = _getQiniu(key);
           ajax.open('GET', url, false);
           ajax.setRequestHeader("X-Auth-Token", usertoken);
           ajax.setRequestHeader("X-Api-Key", "web-app");
           ajax.setRequestHeader("Accept-Language", "zh");
           ajax.setRequestHeader("Datetime", moment().format('YYYY-MM-DD HH:mm:ss'));
           ajax.setRequestHeader("Content-Type", "application/json");
           ajax.send();
           if (ajax.status === 200) {
               const res = JSON.parse(ajax.responseText);
               return res.token
           } else {
               return ''
           }
         },
         // unique_names: true, // 默认 false，key为文件名。若开启该选项，SDK为自动生成上传成功后的key（文件名）。
         //save_key: true,   // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK会忽略对key的处理
         domain: config.qiniu.domain,   //bucket 域名，下载资源时用到，**必需**
         get_new_uptoken: true,  //设置上传文件的时候是否每次都重新获取新的token
         container:  type && ('qiniu_container_'+type) || 'qiniu_container',           //上传区域DOM ID，默认是browser_button的父元素，
         max_file_size: '4mb',           //最大文件体积限制
         flash_swf_url: config.qiniu.flash_swf_url,  //引入flash,相对路径
         max_retries: 3,                   //上传失败最大重试次数
         dragdrop: true,                   //开启可拖曳上传
         drop_element:  type && ('qiniu_container_'+type) || 'qiniu_container',       //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
         chunk_size: '4mb',                //分块上传时，每片的体积
         auto_start: true,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传
         init: {
             'FilesAdded': function(up, files) {
                 plupload.each(files, function(file) {
                     // 文件添加进队列后,处理相关的事情
                 });
             },
             'FileUploaded': (up, file, info)=> {
               const json = JSON.parse(info)
               this._addFile(json)
             },
             'Error': function(up, err, errTip) {
                    //上传出错时,处理相关的事情
             },
             'UploadComplete': function() {
                    //队列文件处理完毕后,处理相关的事情
             },
             'Key': function(up, file) {

               return key
             }
         }
     });
   }
  render() {
    const {type} =this.props
    const Id = type && ('qiniu_pickfiles_'+type) || 'qiniu_pickfiles'
    const Idcontainer = type && ('qiniu_container_'+type) || 'qiniu_container'
    if (type==='single') {
      return (
        <div className="qiniu_upload">
          <div id={Idcontainer}>
            <div className="pickfiles" id={Id}>
              {this.props.children}
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="qiniu_upload">
        <div id={Idcontainer}>
          <div className="pickfiles" id={Id}>
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
}
module.exports = QiniuUpload;
