//sport.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')

Page({
  web_url: "",
  data: {
    article:{
      url: '',
      articleId:''
    }
  },
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function (option) {
    var that = this; 
    var correntUrl = util.getCurrentPageUrlWithArgs()
    var currentUrl = 'https://gotochitu.com/gfit/article/' + app.globalData.articleId
    var pages = getCurrentPages();
    var currentPage = pages[pages.length - 1];
    var web_src = decodeURIComponent(currentPage.options.return_url ||
      encodeURIComponent(currentUrl))
    var title = decodeURIComponent(currentPage.options.title)
    this.web_url = web_src;
    that.data.article.url = web_src;
    if (option.return_url){
      app.globalData.articleTitle = title;
    }
    
    that.data.article.articleId = app.globalData.articleId;
    that.setData({
      article: that.data.article
    })
    console.log('信息',option)
  },
  onShareAppMessage: function (res) {
    var that = this;
    var timestamp = app.getTimestamp();
    var webViewUrl = res.webViewUrl
    var articleTitle = app.globalData.articleTitle
    console.log('这篇文章的标题', articleTitle)
    // imageUrl: '/pages/article/article?return_url=' + encodeURIComponent(webViewUrl),
    // articleTitle
    // imageUrl: 'https://oixdzfgmw.qnssl.com/explorer/cover/100018/18052517021116545.jpg',
    return {
      title: '知识库',
      path: '/pages/article/article?return_url=' + encodeURIComponent(webViewUrl),
      success: function (res) {
        that.web_url = return_url
        console.log(webViewUrl)
        var data = {
          id: app.globalData.articleId,
          user_id: '',
          timestamp: timestamp,
          share_to: '微信',
          result: '1'
        }
        app.request(app.globalData.baseURL,'explorer/record-share', 'post', data, function (res) {

        })
      },
      fail:function(){
        var data = {
          id: e.currentTarget.id,
          user_id: '',
          timestamp: timestamp,
          share_to: '微信',
          result: '0'
        }
        app.request(app.globalData.baseURL,'explorer/record-share', 'post', data, function (res) {
        })
      }
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
