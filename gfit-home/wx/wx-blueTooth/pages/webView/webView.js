//installGfit.js
//获取应用实例
const app = getApp()
Page({
  data: {
    userInfo:'',
    hasUserInfo:false
  },
  // 页面加载
  onLoad: function () {
    
  },
  // 页面看不见时
  onHide: function () {
    var that = this;
    
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
