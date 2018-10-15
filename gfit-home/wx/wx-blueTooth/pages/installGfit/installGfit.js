//installGfit.js
//获取应用实例
const app = getApp()
Page({
  data: {
    userInfo:'',
    hasUserInfo:false,
  },
  // 页面加载
  onLoad: function () {
    
  },
  toindexUrl: function () {
    wx.navigateTo({
      url: '../index/index',
    })
  },
  previewImage:function(){
    var that = this;
    wx.previewImage({
      urls: ['https://dev.gfitgo.com/gfit-home/wx-blueTooth/pages/pic/wxcode.jpg'],
      success:function(res){
        console.log(res)
      },
      fail:function(err){
        console.log(err)
      }
    })
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
