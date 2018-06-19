import TYPES from './types';
import {_getGrouptourAuthor} from 'api/'

// setp 更新
export function updateStepDate(data){
	return {
		type: TYPES.STEP_DATA_UPDATE,
		data: data
	}
}
/**
 * 根据authorId返回相关GroupTour列表
 * @param  {[type]} authorId [description]
 * @return {[type]}          [description]
 */
export function getGrouptourAuthor(authorId){
	return (dispatch) => {
		return _getGrouptourAuthor(authorId).then((res)=>{
			dispatch({
					type: TYPES.GET_GROUPTOUR_AUTHOR,
					data: res
			})
		})
}}

export function delGrouptourAuthor(id){
	return (dispatch,getState) => {
		const {Trip} = getState()
		const authorIdGroupTour = Trip.authorIdGroupTour
		const data = authorIdGroupTour && authorIdGroupTour.data.filter(item => parseInt(item.id) !==id)
		const newData={
			...authorIdGroupTour,
			data
		}
		return dispatch({
					type: TYPES.GET_GROUPTOUR_AUTHOR,
					data: newData
			})
}}
