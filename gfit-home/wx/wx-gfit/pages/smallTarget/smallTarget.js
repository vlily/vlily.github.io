//获取应用实例
const app = getApp()
const OSS = require('../../utils/aliyun-oss-sdk.min.js')
// https://test.gfitgo.com/gfit-app-inf/
// https://gotochitu.com/gfit-frontend-inf/
Page({
  data: {
    nowData: 0,
    refresh: false,
    baseURL: 'https://gotochitu.com/gfit-app-inf/',
    errImgUrl:'../pic/smallTarget/urlAvator.png',
    userAvatarList: [],
    smallTargetData:{},
    scrollList: {},
  },
  onLoad: function () {
    var that = this;
    that.getSmallTargetData();
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    var that = this;
    that.setData({
      refresh:true
    })
    wx.showNavigationBarLoading();
    wx.stopPullDownRefresh();
    console.log("触发下拉刷新")
    that.getSmallTargetData();
    wx.hideNavigationBarLoading();
  },
  // 分享
  onShareAppMessage: function (res) {
    var that = this;
    var webViewUrl = res.webViewUrl;
    return {
      title: '一周小目标',
      path: '/pages/smallTarget/smallTarget?url=' + webViewUrl
    }
  },
  getSmallTargetData:function(){
    var that = this;
    var client = that.getImgFromOss();
    var userAvatarUrl = '', userAvatarListNow = [];
    var data={
      project_code:104
    }
    app.request(that.data.baseURL,'/web/small_goal/current', 'get', data, function (res) {
      console.log(res.data.data.participants)
      that.setData({
        smallTargetData: res.data.data,
        scrollList: res.data.data.participants
      })
      that.data.smallTargetData.bonus = (that.data.smallTargetData.bonus / 100).toFixed(2)
      // 三行最多展示24个
      var len = that.data.scrollList.length > 24 ? 24 : that.data.scrollList.length;
      for (var i = 0; i < len; i++) {
        if (that.data.scrollList[i].type == 1) {
          // 机器人
          userAvatarUrl = client.signatureUrl("robot_img/" + that.data.scrollList[i].value + ".jpg")
        } else {
          userAvatarUrl = client.signatureUrl("profile_img/" + that.data.scrollList[i].value + "/preview")
        }
        userAvatarListNow.push(userAvatarUrl)
      }
      that.setData({
        userAvatarList: userAvatarListNow,
        smallTargetData: that.data.smallTargetData
      })
      console.log('修改为角后的',that.data.smallTargetData)
      if (that.data.scrollList.length > 50) {
        that.data.scrollList.length = 50
      }
      if (!that.data.refresh){
        console.log(that.data.smallTargetData.bonus)
        that.addData(0, that.data.smallTargetData.bonus)
      }
    })
  },
  errImg:function(e){
    var that = this;
    if(e.type == 'error'){
      console.log(e)
      var errIndex = e.target.dataset.index;
      console.log(errIndex)
      that.data.userAvatarList[errIndex] = that.data.errImgUrl;
      that.setData({
        userAvatarList: that.data.userAvatarList
      })
    }
  },
  // 截获竖向滑动
  catchTouchMove: function (res) {
    return false
  },
  getImgFromOss: function () {
    var client = new OSS({
      region: "oss-cn-hangzhou",
      accessKeyId: "WMD6uv73gL0qNAyL",
      accessKeySecret: "QQ2aiWUNixcOnueKnxKdk0hDOJhJU6",
      bucket: "gfit-app"
    });
    return client;
  },
  addData: function (lowData, highData){
    var that = this;
    var addValue = (highData * 0.01).toFixed(2)
    var addTimer = setInterval(function () {
      lowData = (lowData * 1 + addValue * 1).toFixed(2);
      that.setData({
        nowData: lowData
      })
      if (lowData*1 >= highData*1) {
        console.log('hahha')
        clearInterval(addTimer)
        lowData = highData;
        that.setData({
          nowData: lowData
        })
      }
    },10)
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
