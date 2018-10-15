//app.js
App({
  onLaunch: function () {
    var that = this
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    
    
  },
  showModal: function (title,content,callFn){
    wx.showModal({
      title: title,
      content: content,
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          if (typeof callFn != 'undefined' && callFn instanceof Function){
            callFn();
          }
        }
      }
    })
  },
  // 基础库版本兼容
  useVersion: function (useVersion){
    var that = this;
    try {
      var nowVersion = wx.getSystemInfoSync().version;
      var v1 = nowVersion.split('.');
      var v1 = useVersion.split('.');
      var len = Math.max(v1.length, v2.length)
      while (v1.length < len) {
        v1.push('0')
      }
      while (v2.length < len) {
        v2.push('0')
      }
      for (var i = 0; i < len; i++) {
        var num1 = parseInt(v1[i])
        var num2 = parseInt(v2[i])
        if (num1 > num2) {
          return 1
        } else if (num1 < num2) {
          return -1
        }
      }
      return 0
    } catch (e) {
      // Do something when catch error
      that.showModal(('提示', '获取基础库版本失败！'));
    }
  },
  globalData: {
    open_page: true,
    wxpro_token:''
  }
})