
import TYPES from 'actions/types'

const initialState = {
	postData: {},
	authorIdGroupTour: {}, // 根据authorId返回相关GroupTour列表
};
function Trip(state=initialState, action){
    switch (action.type) {
			case TYPES.STEP_DATA_UPDATE:
        return {
  				...state,
          postData: {
						...state.postData,
						...action.data
					}
  			};
			/**
			 * 根据authorId返回相关GroupTour列表
			 * @type {[type]}
			 */
			case TYPES.GET_GROUPTOUR_AUTHOR:
	      return {
					...state,
	        authorIdGroupTour: action.data
				};
			default:
      	return state
    }
}
module.exports = Trip;
