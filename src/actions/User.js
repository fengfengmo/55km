import TYPES from './types';
import { Link } from 'react-router'
import {_signIn,_setApiOpts,_removeApiOpts,_getUser,_putUser,_getStatView} from 'api/'
import {saveLS,removeLS,trackPageview,trackEvent,getLS} from './common'
import moment from 'moment';
import {notification} from 'antd';
/**
 * 登录
 * @param  {[type]} mobileNum [description]
 * @param  {[type]} password  [description]
 * @return {[type]}           [description]
 */
export function signIn(data,cb){
	return (dispatch) => {
		// _setApiOpts({
		// 	language: 'en'
		// })
		let x = null
		return _signIn(data).then((res)=>{
			if (res.token) {
				trackEvent('用户行为','login','success')
				dispatch({
						type: TYPES.LOGIN_SUCCESS,
						data: res
				})
				_setApiOpts({
					token: res.token  // 设置请求头 X-Auth-Token
				})
				saveLS('userData',res);
				//saveLS('expirationTime',moment().add(parseInt(res.minutes), 'd').unix()); // 过期时间
				saveLS('expirationTime',moment().add(7, 'd').unix())
				saveLS('isLogin',true)
				x= res
			}else{
				trackEvent('用户行为','login','fail')
			}
		}).then(()=>{
			if (x.nickname) {
				notification.success({
						message: '成功',
						description: '欢迎您回来，' + x.nickname
				})
			}
			cb && cb()
		})
}}
/**
 * 获取公共信息
 * @param  {[type]} userId [description]
 * @return {[type]}        [description]
 */
export function getUserStatView(userId,cb){
	return (dispatch,getState) => {
		const {User} = getState()
		return _getStatView(userId).then((res)=>{
			//console.log(res)
			// const isLogin = getLS('isLogin') || false
			// console.log(isLogin)
			const newRes = {
				...res,
				unreadNotification: res.unreadNotification || 0
			}
			/**
			 * 验证信息数处理
			 * @type {[type]}
			 */
			let validNum = 0
			if (res.valid) {
				if (res.valid.status===1) {
					validNum++
				}
				if (res.valid.mobileStatus===1) {
					validNum++
				}
				if (res.valid.emailStatus===1) {
					validNum++
				}
				if (res.valid.socialMediaAccountStatus===1) {
					validNum++
				}
			}
			const userStatView = User.userStatView || {}
			if (newRes.unreadNotification!==0 && newRes.unreadNotification > userStatView.unreadNotification) {
				const key = `open${Date.now()}`
				notification.info({
						message: '提示',
						description: '您有新的消息',
						duration:8,
						key,
						btn: (<span onClick={()=>{
							notification.close(key);
							cb && cb();
						}}>点击查看查看</span>)
				})
			}

			res.validNum = validNum
			const userData = User.userData
			const newUserData = {
				...userData,
				avatarUrl:res.info1.avatarUrl,
				nickname:res.info1.nickname,
				mobileNum: res.info1.mobileNum,
			}
			/**
			 * 更新信息
			 * @type {[type]}
			 */
			dispatch({
					type: TYPES.LOGIN_SUCCESS,
					data: newUserData
			})
			saveLS('userData',newUserData);
			dispatch({
					type: TYPES.GETUSERSTATVIEW_SUCCESS,
					data: res
			})
			// saveLS('userStatView',res);
		})
	}
}
/**
 * 获取个人资料
 * @param  {[type]}   authorId [description]
 * @return {[type]}        [description]
 */
export function getUser(authorId){
	return (dispatch) => {
		return _getUser(authorId).then((res)=>{
			dispatch({
					type: TYPES.GETUSER_SUCCESS,
					data: res
			})
			//saveLS('userProfile',res);
		})
}}

/**
 * 更新个人资料
 * @param  {[type]}   authorId [description]
 * @return {[type]}        [description]
 */
export function putUser(authorId,data){
	return (dispatch) => {
		return _putUser(authorId,data).then((res)=>{
			dispatch({
					type: TYPES.GETUSER_SUCCESS,
					data: res
			})
			trackEvent('用户行为','updateUser','success')
			notification.success({
					message: '成功',
					description: '个人资料更新成功'
			});
			//saveLS('userProfile',res);
		})
}}



/**
 * localStorage的值
 * @param {[type]} data [description]
 */
export function setLSdata(res){
	_setApiOpts({
		token: res.token  // 设置请求头 X-Auth-Token
	})
	return{
		type: TYPES.LOGIN_SUCCESS,
		data: res
	}
}
/**
 * 退出
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export function signOut(data){
	removeLS('userData')
	removeLS('expirationTime')
	removeLS('isLogin')
	_removeApiOpts({
		token: true
	})
	return{
		type: TYPES.LOGIN_OUT
	}
}
/**
 * 打开登录框
 * @return {[type]} [description]
 */
export function openLogin(){
	const open = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
	if (open) {
		trackPageview('/login')
		trackEvent('用户行为','login','click')
	}
  return {
    type: TYPES.OPEN_LOGIN,
    open: open
  };
}
export function openSignup(){
	const open = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
	if (open) {
		trackPageview('/register')
		trackEvent('用户行为','register','click')
	}
  return {
    type: TYPES.OPEN_SIGNUP,
    open: open
  };
}
/**
 * 强制登录
 */
export function forceLogin(){
	const open = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  return {
    type: TYPES.FORCE_LOGIN,
    open: open
  };
}
/**
 * 设置回调
 */
 export function setLoginCb(fun){
   return {
     type: TYPES.LOGIN_SIGNUP_CB,
     loginSignupCB: fun
   };
 }
