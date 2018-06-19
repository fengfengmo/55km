/**
 * 分享组件
 */
import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import QRCode from 'qrcode.react'
import { Modal } from 'antd';
import styles from './index.scss'
const propTypes = {
  url: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  sites: PropTypes.array,
};

function getMetaContentByName(name) {
    return (document.getElementsByName(name)[0] || 0).content;
}
const sitesAll =["wechat", "qzone", "weibo","qq", "google", "twitter",
        "tencent", "douban", "linkedin", "facebook"]
let image = (document.images[0] || 0).src || '';
let site = getMetaContentByName('site') || getMetaContentByName('Site') || document.title;
let title = getMetaContentByName('title') || getMetaContentByName('Title') || document.title;
let description = getMetaContentByName('description') || getMetaContentByName('Description') || '';
let url = location.href
let origin = location.origin
let defaultProps = {
  url: url,
  origin: origin,
  title: title,
  description: description,
  summary: description,
  image: image,
  site: site,
  source: site,
  sites: sitesAll,
  wechatQrcodeTitle: '微信扫一扫：分享',
  wechatQrcodeHelper: '微信里点“发现”，扫一下,二维码便可将本文分享至朋友圈。',
};
class Share extends React.Component {
  constructor(...args) {
    super(...args);
    this.state={
      more: false
    }
  }
  _renderHtml (sites) {
    const url = this.props.url
    const fun = this.props.onFavorite
    const favorite = this.props.favorite
    let wechatQrcodeTitle = this.props.wechatQrcodeTitle
    let wechatQrcodeHelper = this.props.wechatQrcodeHelper

    let title = encodeURIComponent(this.props.title)
    let description = encodeURIComponent(this.props.description)
    let image = encodeURIComponent(this.props.image)
    let site = encodeURIComponent(this.props.site)
    let origin = encodeURIComponent(this.props.origin)

    let summary = description
    let source = site

    const templates = {
      qzone: `http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${url}&title=${title}&desc=${description}&summary=${summary}&site=${source}`,
      qq: `http://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}&source=${source}&desc=${description}`,
      tencent: `http://share.v.t.qq.com/index.php?c=share&a=index&title=${title}&url=${url}&pic=${image}`,
      weibo: `http://service.weibo.com/share/share.php?url=${url}&title=${title}&pic=${image}`,
      wechat: `javascript:`,
      douban: `http://shuo.douban.com/!service/share?href=${url}&name=${title}&text=${description}&image=${image}&starid=0&aid=0&style=11`,
      diandian: `http://www.diandian.com/share?lo=${url}&ti=${title}&type=link`,
      linkedin: `http://www.linkedin.com/shareArticle?mini=true&ro=true&title=${title}&url=${url}&summary=${summary}&source=${source}&armin=armin`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}&via=${origin}`,
      google: `https://plus.google.com/share?url=${url}`
    };

    return sites.map((site, i)=>{
      if(site === "wechat"){
        let doc = <div key={i} className='wechat-qrcode'>
                    <h4>{wechatQrcodeTitle}</h4>
                    <div className='qrcode'>
                      <QRCode value={url} size={100} />
                    </div>
                    <div className='help'>
                      <p>{wechatQrcodeHelper}</p>
                    </div>
                  </div>
        return (
          <Link key={i} className='share_wrap-icon icon-wechat' target='_blank'>
            {doc}
          </Link>
        )
      } else if(site === "favorite"){
        let _class = 'share_wrap-icon icon-favorite'
        if (favorite) {
          _class = 'share_wrap-icon icon-favorite icon-favorite-on'
        }
        return (
          <Link key={i} className={_class} onClick={()=>{
            fun && fun(favorite)
          }}>
          </Link>
        )
      } else if(site === "more"){
        return (
          <Link key={i} className='share_wrap-icon icon-more' onClick={()=>{
            this.setState({
              more:true
            })
          }}>
          </Link>
        )
      } else {
        let className = `icon-${site} share_wrap-icon`
        return (
          <Link key={i} className={className} target='_blank' to={templates[site]} />
        )
      }
    })
  }
  render() {
    let sites = this.props.sites
    return(
      <div className="share_wrap">
        {this._renderHtml(sites)}
        <Modal title={'Tell your friends'}
            visible={this.state.more}
            width={'450'}
            className="share_wrap share_wrap_modal"
            onCancel={()=>{
              this.setState({
                more: false
              })
            }}
            footer={[]}
          >
          {this._renderHtml(sitesAll)}
        </Modal>
      </div>
    )
  }
}
Share.propTypes = propTypes;
Share.defaultProps = defaultProps;
module.exports = Share;
