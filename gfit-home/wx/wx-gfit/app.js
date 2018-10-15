//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  // 接口封装
  // 知识库
  request: function (baseURL,path, method, data, doSuccess) {
    var that = this;
    //线上 https://gotochitu.com/gfit-frontend-inf/
    //知识库 https://test.gfitgo.com/gfit-frontend-inf/
    wx.request({
      url: baseURL + path,
      data: data,
      method:method,
      header: {
        'content-type': 'application/json',
      },
      success: function (res) {
        console.log(path + '后台返回值:', res)
        if (res.statusCode == '200'){
          if (typeof doSuccess == "function") {
            doSuccess(res)
          }
        }else{
          that.showModal('提示', '服务器繁忙，请稍后再试！')
        }
        
      },
      fail: function (err) {
        console.log(path + '调用失败:', err)
        that.showModal('提示', '服务器繁忙，请稍后再试！')
      },
    })
  },
  //作流水步骤记录
  getBleJournal: function (arr, instruction, err) {
    var that = this, timestamp = that.getTimestamp();
    arr.push({ instruction: instruction, timestamp: timestamp, err: err })
    console.log(arr)
  },
  // 获取时间戳
  getTimestamp: function () {
    var timestamp = Math.round(new Date().getTime() / 1000);
    return timestamp;
  },
  showModal: function (title, content, callFn) {
    wx.showModal({
      title: title,
      content: content,
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          if (typeof callFn != 'undefined' && callFn instanceof Function) {
            callFn();
          }
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    toArticlesList:0,
    articleId:0,
    articleTitle:'',
    themeId:0,
    articlesBanner:[],
    baseURL: 'https://gotochitu.com/gfit-frontend-inf/'
  }
})