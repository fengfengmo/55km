
import TYPES from 'actions/types'

const initialState = {
	filterData:{
		"isLoading":false,
		"title":null,
		"label": null,
		"startTime":null,
		"lowerPrice":null,
		"upperPrice":null,
		"language":null,
		"transportation":null,
		"maximumNumber":null,
		"startHour":null,
		"endHour":null,
		"tourSpan":[]
	},
	results:{
		resultsData:[],
		resultsHeaders:{},
		p:1,
		size:30,
		searchUri: null
	},
};
function Search(state=initialState, action){
    switch (action.type) {
			case TYPES.SET_FILTER_DATA:
        return {
  				...state,
          filterData: {
						...state.filterData,
						...action.data
					}
  			};
			case TYPES.SET_RESULT_DATA:
				return {
					...state,
					results:{
						...action.data
					}
				};
			default:
      	return state
    }
}
module.exports = Search;
