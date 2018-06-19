const sdkUrl = '//res.wx.qq.com/open/js/jweixin-1.0.0.js'
const isWechat = navigator.userAgent.indexOf('MicroMessenger') != -1
const getScript = (src, callback) => {
  var s = document.createElement('script');
  s.src = src;
  s.async = true;
  s.onreadystatechange = s.onload = function() {
    if (!callback.done && (!s.readyState || /loaded|complete/.test(s.readyState))) {
      callback.done = true;
      callback();
    }
  };
  document.querySelector('head').appendChild(s);
}

const wxShare = (cb) => {
    if(isWechat && typeof wx == 'undefined'){
        getScript(sdkUrl, ()=>{
    		/*global wx*/
    		wx.config(window.__WC_CONFIGS__);

    		wx.ready(function(){
          cb()
    		})
    		wx.error(function(res){
    			console.log(res)
    		})
    	})
    }else if (typeof wx == 'object') {
      wx.ready(function(){
        cb()
      })
    }
}
export { isWechat, getScript, sdkUrl, wxShare }
