//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
  },
  onLoad: function () {
    var that = this;
  },
  
  onShareAppMessage: function (res) {
    var that = this;
    var webViewUrl = res.webViewUrl;
    return {
      title: '运动场',
      path: '/pages/index/index?url=' + webViewUrl
    }
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
