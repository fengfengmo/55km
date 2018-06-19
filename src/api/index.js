import moment from 'moment';
import Api from './api';
import {getLS} from 'actions/common'
import {navigatorLanguage} from 'utils'
if (!window.location.origin) {
  window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
}
// const API_ROOT = (process.env.NODE_ENV === 'production')
// 			? 'http://test.trip55.com/webapi/'
// 			:'http://localhost:8080/webapi/'
const API_ROOT = window.location.origin +'/webapi/'
/**
 *
 * @type {Api}
 */
const api = new Api({
  baseURI: API_ROOT,
  headers: {
		'X-Api-Key': 'web-app',
		'Accept-Language': getLS('locale') || navigatorLanguage(),//默认中文
		'Datetime': moment().format('YYYY-MM-DD HH:mm:ss'),
    'Content-Type': 'application/json'
  }
})
// function urlencoded(obj) {
//   var str = "";
//   for(var prop in obj){
//       str += prop + "=" + obj[prop] + "&"
//   }
//   return str;
// }
/**
 * _开头的 暴露到 actions使用
 */
module.exports = {
	/**
	 * api地址暴露
	 */
	apiUri () {
		return API_ROOT
	},
	/**
	 * 设置X-Auth-Token Accept-Language
	 */
	_setApiOpts (opts){
		opts.token && (api.opts.headers['X-Auth-Token'] = opts.token)
		opts.language && (api.opts.headers['Accept-Language'] = opts.language)
	},
	_removeApiOpts (opts){
		opts.token && (api.opts.headers['X-Auth-Token'] = null)
	},
	_getQiniu (key) {
		return API_ROOT + 'qiniutoken?file='+key
	},
	/**
	 * 登录接口
	 */
	_signIn (data) {
		return api.post('signin', {
      data:data
    })
	},
	/**
	 * 注册接口
	 */
	_signUp (data) {
		return api.post('signup', {
      data:data
    })
	},
	_signupwithemail (data) {
		return api.post('signupwithemail', {
      data:data
    })
	},
	/**
	 * 找回密码
	 */
	_findpassword (data) {
		return api.post('findpassword', {
      data:data
    })
	},
	/**
	 * 修改密码
	 */
	_changepassword(data){
		return api.post('user/'+data.userId+'/changepassword', {
      data:data
    })
	},
	/**
	 *获取活动类型
	 */
	getActivitylabel () {
 		return api.get('activitylabel')
 	},
	/**
	 * 获取用户信息
	 */
	_getUser (authorId){
		return api.get('user2/'+authorId)
	},
	/**
	 * 更新用户资料
	 */
	_putUser (authorId,data){
		return api.put('user2/'+authorId,{
			data: data
		})
	},
	/**
   * 根据authorId返回相关GroupTour列表
   */
  _getGrouptourAuthor(authorId) {
		return api.get('grouptour/author/'+authorId,{
			params: {
				p: 1,
				size: 999,
			}
		})
	},
	/**
   * 根据grouptourId返回旅程详情
   */
  _getGrouptour(grouptourId) {
		return api.get('grouptour2/'+grouptourId)
	},
  /**
   * 创建trip
   */
  _creatTrip (data) {
		return api.post('grouptour2', {
      data:data
    })
	},
	/**
   * 更新trip
   */
  _putTrip (data,grouptourId) {
		return api.put('grouptour2/'+grouptourId, {
      data:data
    })
	},
	/**
   * 提交trip审核
   * type
   * 0:草稿，1:已发布，2:上架，3:下架
   */
  _postTrip (data,grouptourId,type=2) {
		return api.post('grouptour2/'+grouptourId+'/'+type, {
      data:data
    })
	},
	/**
	 * 删除
	 * @type {[type]}
	 */
	_deleteTrip (authorId,grouptourId) {
		return api.del('grouptour/'+authorId+'/'+grouptourId)
	},
	/**
   * 搜索
   */
  _searchTrip (data) {
		return api.post('grouptour/search', {
      data:data
    })
	},
	/**
   * 提交订单
   */
  _postTripOrder (data) {
		return api.post('order', {
      data:data
    })
	},
	/**
	 * 用户信息的一些公共的信息
	 */
	_getStatView (userId) {
		return api.get('user/statview/'+userId)
	},
	/**
   *  发送验证码
   */
  _getEmailsecuritycode (id,email) {
		return api.get('emailsecuritycode/' + id +'/'+ email)
	},
	/**
   *  发送注册验证码
   */
  _getEmailsecuritycode2 (email) {
		return api.get('emailsecuritycode/'+ email)
	},
	/**
	 * 绑定邮箱
	 */
	_postEmailsecuritycode (data) {
		return api.post('emailbinding',{
			data:data
		})
	},
	/**
   *  发送手机验证码
   */
  _getPhonesecuritycode (id,phone,countryCode) {
		return api.get('securitycode/' + id +'/'+ phone,{
			params:{
				countryCode:countryCode
			}
		})
	},
	/**
   *  注册手机验证码
   */
  _getPhonesecuritycodeSign (phone,countryCode) {
		return api.get('securitycode/'+ phone,{
			params:{
				countryCode:countryCode
			}
		})
	},
	/**
	 * 绑定手机号
	 */
	_postPhonesecuritycode (data) {
		return api.post('mobilebinding',{
			data:data
		})
	},
	/**
	 * 提交身份证
	 */
	_postValid (data) {
		return api.post('valid/'+data.userId,{
			data:data
		})
	},
	/**
	 * 发送一个消息
	 */
	_postNotification (data) {
		return api.post('notification', {
      data:data
    })
	},
	/**
	 * 获取收件箱的消息
	 */
	 _getNotificationInbox (authorId) {
 		return api.get('notification/inbox/'+authorId,{
			params: {
				p: 1,
				size: 999,
			}
		})
 	},
	/**
	 * 根据id获取收件箱消息
	 */
	_getNotificationInboxDetail (id) {
		return api.get('notification/in/'+id)
	},
	/**
	 * 根据id获取fa发件箱消息
	 */
	_getNotificationOutboxDetail (id) {
		return api.get('notification/out/'+id)
	},
	/**
	 * 获取发件箱的消息
	 */
	 _getNotificationOutbox (authorId) {
 		return api.get('notification/outbox/'+authorId,{
			params: {
				p: 1,
				size: 999,
			}
		})
 	},
  /**
	 * 支付宝支付二维码
	 */
	_postAliapy (userId,orderId) {
		return api.post('charge/'+userId+'/pay/'+orderId)
	},
	/**
	 * 微信支付二维码pc
	 */
	_getWechatQr (orderId) {
		return api.get('wechat/pay/qr?orderId='+orderId,{
			wechatQR:true
		})
	},
	/**
	 * 微信支付检测pc
	 */
	_checkWechatQr (orderId,outTradeNo) {
		 // http://localhost:9000/wechat/pay/check?orderId=16&outTradeNo=20160906094707EkIXQnmZOMpB1ucS
		return api.get('wechat/pay/check',{
			params:{
				orderId:orderId,
				outTradeNo: outTradeNo,
			}
		})
	},
	/**
	 * 用户余额
	 */
	_getBalance (userId){
		return api.get('user/'+userId+'/balance')
	},
	/**
	 * 用户流水
	 */
	_getBalanceWithdrawal (userId){
		return api.get('user/balance/balanceliquidity',{
			params:{
				userId:userId
			}
		})
	},
	/**
	 * 我的订单
	 */
	_getOrderParticipated (userId) {
		return api.get('order/i/participated',{
			params:{
				userId:userId,
				p: 1,
				size:50
			}
		})
	},
	/**
	 * 我的订单 定我的
	 */
	_getOrderPublished (userId) {
		return api.get('order/i/published',{
			params:{
				userId:userId,
				p: 1,
				size:50
			}
		})
	},
	/**
	 * 激活优惠券
	 */
	_postDiscountcoupon (data) {
		return api.post('user/discountcoupon/active',{
			data:data
		})
	},
	/**
	 * 用户获取名下所有优惠券
	 */
	_getDiscountcoupon (userId) {
		return api.get('user/discountcoupon/'+userId)
	},
	/**
	 * 获取钱包 提现方式
	 */
	_getUserWallet (userId) {
		return api.get('user/'+userId+'/wallet')
	},
	/**
	 * 获取钱包 提现方式
	 */
	_postUserWallet (data) {
		return api.post('user/wallet',{
			data:data
		})
	},
  /**
	 * 管理可用日期
	 */
	_putSchedule (data,userId) {
		return api.put('grouptour/schedule/'+userId,{
			data:data
		})
	},
  /**
	 * 管理可用日期 基于行程向导的日历更新
	 */
	_putSchedule2 (data,userId) {
		return api.put('grouptour/'+userId+'/schedule',{
			data:data
		})
	},
  /**
	 * 订单详情
	 */
	_getOrder (orderId) {
		return api.get('order/'+orderId+'/detail')
	},
  /**
	 * 撰写评论
	 */
	_postReview (data) {
		return api.post('grouptour2/review',{
      data:data
    })
	},
  /**
	 * 回复评论
	 */
	_postReviewReply (data) {
		return api.post('groputour2/review/reply',{
      data:data
    })
	},
  /**
   * 行程页评价
   */
  _getReviewTour(tripid){
    return api.get('/grouptour2/review/tour/'+tripid+'?size=999')
  },
  /**
	 * 个人主页评价
	 */
	_getReviewExpert (userId) {
		return api.get('grouptour2/review/user/'+userId+'?size=999')
	},
  /**
	 * 我对别人的评价
	 */
	_getReviewBy (userId) {
		return api.get('/grouptour2/review/user/by/'+userId+'?size=999')
	},
  /**
	 * 别人对我的评价
	 */
	_getReviewAbout (userId) {
		return api.get('/grouptour2/review/user/about/'+userId+'?size=999')
	},
  /**
   * 收藏
   */
   _postFavorite (tripid,userId) {
 		return api.post('/grouptour/'+tripid+'/favorite/'+userId)
 	},
  /**
   * 收藏
   */
   _deleteFavorite (tripid,userId) {
 		return api.del('/grouptour/'+tripid+'/favorite/'+userId)
 	},
}
