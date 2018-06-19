
import TYPES from 'actions/types'

const initialState = {
	isLogin: false,
	userData: {},// 登录信息
	userStatView: {}, //用户信息的一些公共的信息
	userProfile: {},// 个人资料
	openLogin: false, //登录框
	openSignup: false, //注册框
	force: false, // 强制登录
	loginSignupCB:function loginSignupCB() {} // 登录回掉
};
function User(state=initialState, action){
    switch (action.type) {
			case TYPES.LOGIN_SUCCESS:
        return {
  				...state,
					isLogin: true,
          userData: action.data,
					openLogin: false
  			};
			case TYPES.GETUSERSTATVIEW_SUCCESS:
				return {
					...state,
					userStatView: action.data,
				};
			case TYPES.GETUSER_SUCCESS:
        return {
  				...state,
          userProfile: action.data
  			};
			case TYPES.LOGIN_OUT:
        return {
  				...state,
					isLogin: false,
					openSignup: false,
          userData: {},
  			};
			case TYPES.FORCE_LOGIN:
				return {
					...state,
					force: action.open,
				};
			case TYPES.OPEN_LOGIN:
				return {
					...state,
					openLogin: action.open,
					openSignup: false,
				};
			case TYPES.OPEN_SIGNUP:
				return {
					...state,
					openSignup: action.open,
					openLogin:false,
				};
			case TYPES.LOGIN_SIGNUP_CB:
				return {
					...state,
					loginSignupCB: action.loginSignupCB
				};
			default:
      	return state
    }
}
module.exports = User;
