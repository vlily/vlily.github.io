const app = getApp()

Page({
  data: {
    more: false,
    refresh:false,
    moreOver:0,
    articlesFirstTime: 0,
    loadmoreText:'加载中...',
    articles: [],
    articlesBanner:{
      title: '跑步干货',
      englishTitle: 'Running Knowledge',
      img: '../pic/knowledge/headRight.png',
    }
  },
  onLoad: function () {
    var that = this;
    that.getTheme();
    that.articlesInit();
  },
  getTheme:function(){
    var that = this;
    var themeId = app.globalData.themeId;
    var articlesBanner = app.globalData.articlesBanner;
    for (var i = 0; i < articlesBanner.length; i++) {
      if (articlesBanner[i].id == themeId) {
        that.setData({
          articlesBanner: articlesBanner[i]
        })
      }
    }
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    var that = this;
    wx.showNavigationBarLoading();
    wx.stopPullDownRefresh();
    that.setData({
      refresh: true
    })
    that.articlesInit();
    wx.hideNavigationBarLoading();
  },
  // 上拉加载更多
  onReachBottom: function () {
    var that = this;
    console.log('你在上拉加载中')
    that.setData({
      more: true
    })
    // 每次上拉请求5条
    that.articlesInit();
  },
  onShareAppMessage: function (res) {
    var that = this;
    var webViewUrl = res.webViewUrl;
    var articleName = that.data.articlesBanner.name;
    console.log(webViewUrl)
    return {
      title: articleName,
      path: '/pages/articlesList/articlesList?url=' + webViewUrl
    }
  },
  // 刷新及初始化加载
  articlesInit:function(){
    var that = this;
    if (that.data.refresh){
      that.setData({
        articles: [],
        articlesFirstTime:0,
        refresh:false,
        loadmoreText: '加载中...'
      })
    }
    // 初始化5条文章
    var themeId = app.globalData.themeId;
    console.log('主题id：', themeId)
    var themeArticles = {
      theme: themeId,
      image_type:'1x',
      timestamp: that.data.articlesFirstTime,
      size: 10
    }
    app.request(app.globalData.baseURL,'explorer/theme-articles', 'get', themeArticles, function (res) {
      if (res.data.data) {
        var articlesActive = res.data.data.articles;
        console.log(that.data.articles)
        if (that.data.more){
          that.data.articles.push.apply(that.data.articles, articlesActive)
          that.setData({
            articles: that.data.articles,
            more:false
          })
        }else{
          that.setData({
            articles: articlesActive,
          })
        }
        that.setData({
          articlesFirstTime: res.data.data.articles[res.data.data.articles.length - 1].publish_time
        })
      }else{
        that.setData({
          moreOver: 1,
          loadmoreText: '别拉了，到底啦~'
        })
      }
    })
  },      
  toArticle:function(e){
    var that = this;
    var articleId = e.currentTarget.id;
    var articleTitle = e.currentTarget.dataset.title;
    app.globalData.articleId = articleId;
    app.globalData.articleTitle = articleTitle;
    // app.toArticle(articleId)
    var that = this;
    wx.navigateTo({
      url: '../article/article'
    })
  },
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
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
