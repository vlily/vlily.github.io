//sport.js
//获取应用实例
const app = getApp()

Page({
  data: {
    result:0,
    themes:[],
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    var that = this;
    that.themesInit();
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    var that = this;
    wx.showNavigationBarLoading();
    wx.stopPullDownRefresh();
    console.log("触发下拉刷新")
    that.themesInit();
    wx.hideNavigationBarLoading();
  },
  // 加载数据
  themesInit:function(){
    var that = this;
    var timestamp = app.getTimestamp();
    var metaData = {
      timestamp: timestamp,
      image_type: '1x'
    }
    console.log(metaData)
    app.request(app.globalData.baseURL, 'explorer/meta-data', 'get', metaData, function (res) {
      that.setData({
        themes: res.data.data.themes
      })
      var themesList = res.data.data.themes;
      var articlesBannerItem = {};
      for (var i = 0; i < themesList.length; i++) {
        articlesBannerItem = {
          'id': themesList[i].id,
          'name': themesList[i].name,
          'cover_text': themesList[i].cover_text,
          'url': themesList[i].resource.url,
        }
        app.globalData.articlesBanner.push(articlesBannerItem)
      }
      console.log('articlesBanner数据：', app.globalData.articlesBanner)
    })
  },
  onShareAppMessage: function (res) {
    var webViewUrl = res.webViewUrl
    return {
      title: 'gfit知识库',
      path: '/pages/knowledge/knowledge?url=' + webViewUrl
    }
  },
  toArticlesList:function(e){
    var that = this;
    var themeId = e.currentTarget.id;
    var timestamp = app.getTimestamp();
    console.log(themeId)
    app.globalData.themeId = themeId;
    app.globalData.articlesBanner.id = themeId
    var recordData={
      target:'theme',
      id: themeId,
      user_id:1,
      timestamp: timestamp
    }
    // 记录三个模块的点击流水
    app.request(app.globalData.baseURL,'explorer/record-event', 'post', recordData, function (res) {
      console.log(res.data.data)
      that.setData({
        result: res.data.data
      })
      wx.navigateTo({
        url: '../articlesList/articlesList'
      })
    })
  },
  toArticle:function(e){
    var that = this;
    var articleId = e.currentTarget.id;
    var themeId = e.currentTarget.dataset.themeid;
    var articleTitle = e.currentTarget.dataset.title;
    app.globalData.themeId = themeId;
    app.globalData.articlesBanner.id = themeId
    app.globalData.articleId = articleId;
    app.globalData.articleTitle = articleTitle;
    console.log(e)
    console.log(app.globalData.themeId)
    // app.toArticle(articleId)
    var that = this;
    wx.navigateTo({
      url: '../article/article'
    })
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
