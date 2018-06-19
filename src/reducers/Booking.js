/**
 * 预定
 */
import TYPES from 'actions/types'

const initialState = {
	startDate: null, //时间
	guestNum: 1, // 人数
	data: {},// 旅程信息
	hostedData: {},// 发布人信息
	informationValue: []
};
function Booking(state=initialState, action){
    switch (action.type) {
			case TYPES.SET_BOOK_DATA:
        return {
  				...state,
          ...action.data
  			};
			default:
      	return state
    }
}
module.exports = Booking;
