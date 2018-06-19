import superagent from 'superagent'
import {notification } from 'antd'
import {trackEvent,removeLS} from 'actions/common'
import {browserHistory } from 'react-router'
import {apiUri} from 'api/index'
const methods = [
  'get',
  'head',
  'post',
  'put',
  'del',
  'options',
  'patch'
];

class _Api {

  constructor(opts) {

    this.opts = opts || {};

    if (!this.opts.baseURI)
      throw new Error('baseURI option is required');

    methods.forEach(method =>
      this[method] = (path, { params, data,PageSize,wechatQR } = {}) => new Promise((resolve, reject) => {
        const request = superagent[method](this.opts.baseURI + path);
        if (params) {
          request.query(params);
        }

        if (this.opts.headers) {
          request.set(this.opts.headers);
        }
        // 测试
        if (PageSize) {
          // console.log('PageSize',PageSize)
          request.set({'X-Page-Size': PageSize});
        }

        if (data) {
          request.send(data);
        }
        if (this.opts.withCredentials) {
          request.withCredentials();
        }
        if (wechatQR) {
          request.responseType('blob')
        }
        // request.end((err, { body,text} = {}) => err ? reject(body || JSON.parse(text) || err) : resolve(body || JSON.parse(text)));
        request.end((err,res) =>{
          const {body,text,headers} = res
          if (res.status===504) {
            notification.warn({
              message: '服务器维护中',
              description: '服务器维护中，稍后访问',
            })
          }
          const data = body || (text && JSON.parse(text))
          if (data.code===107 || data.code===106 || data.code===108 || data.code===101 || data.code===102 || data.code===103) {
            browserHistory.push('/logout')
          }
          //console.log(res.status)
          if (err && (data.code!==107 || data.code!==106 || data.code!==108 || data.code!==101 || data.code!==102 || data.code!==103)) {
            /**
             * 错误信息拦截
             */
            // console.log(err)
          //  const data = body || JSON.parse(text)
            // console.log(data)
            // if (data && data.code ===106) {
            //   // 未登录
            // }else{
            //
            // }
            notification.error({
              message: '系统错误',
              description: data.message && data.message || '未知错误',
            })
            const errData = data && (data.code && data.code || 0+'#'+data.message && data.message || '未知错误')
            trackEvent('系统错误',method+'#'+path, errData )
            reject(data || err)
          }else{
            /**
             * 有分页的东西
             */
            let data = null
            if (headers && headers['x-page-total']) {
              let data = body || (text && JSON.parse(text))
              resolve({
                data:data,
                headers:headers
              })
            /**
             *  微信支付需要的 outTradeNo
             */
            }else if (headers && headers['outtradeno']) {
              let data = body
              resolve({
                data:data,
                outTradeNo:headers.outtradeno
              })
            } else{
              let data = body || (text && JSON.parse(text))
              resolve(data)
            }

          }
        });
      })
    );

  }

}

const Api = _Api;
module.exports = Api;
