import TYPES from './types';


/**
 * 设置回调
 */
 export function setResult(data){
   return {
     type: TYPES.SET_RESULT_DATA,
     data: data
   };
 }
