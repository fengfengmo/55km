module.exports = {
	saveLS (key, value) {
		window.localStorage.setItem(key, typeof value == 'object' ? JSON.stringify(value) : value)
	},
	getLS (key) {
		return window.localStorage.getItem(key) || null
	},
	removeLS (key) {
		window.localStorage.removeItem(key)
	},
	clearLS () {
		window.localStorage.clear()
	},
	/**
	 * 百度事件统计
	 * http://tongji.baidu.com/web/help/article?id=236&type=0
	 */
	trackEvent (category, action, opt_label) {
		//console.log(category, action, opt_label)
		window._hmt && window._hmt.push(['_trackEvent', category, action, opt_label])
		//console.log(window._hmt)
	},
	trackPageview (url) {
		window._hmt && window._hmt.push(['_trackPageview', url])
		//console.log(window._hmt)
	}
}
