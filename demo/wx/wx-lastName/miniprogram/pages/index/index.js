//index.js
const app = getApp()

Page({
  data: {
    requestResult: '',
    cloudPath: '',  // 云端存放文件的路径
    imagePath: '',  // 本地图片文件的路径
    openid: '',
    user_nickName: '',  // 微信名
    page_iq: '',    // 页面上显示的iq值
    avatarUrl: './user-unlogin.png',
    user_dbFlag: false, // 判断标志：判断用户在云端数据库是否存在数据
    logged: false,
    takeSession: false,
    userInfo: {},
  },
  onLoad: function() {
    var that = this;
    that.onCloudInit();
    // that.onGetBaseData()
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
                user_nickaName:res.userInfo.nickName,
                logged:true,
                user_dbFlag:true
              })
              app.globalData.logged = true;
              app.globalData.user_dbFlag = true
              app.globalData.openid = res.userInfo.openid

              const db = wx.cloud.database()
              const dbCommand = db.command
              //读取用户数据，并渲染在页面上
              db.collection('Users').where({
                _openid: _.eq(app.globalData.openid) // 填入当前用户 openid
              }).get().then(res => {
                console.log(res.data)
                if(res.data != null){
                  //如果用户存在数据拉去用户的IQ数据
                  that.setData({
                    page_iq:res.data[0].IQ,
                    user_dbFlag:true
                  })
                }else{
                  console.log('拉取云端数据出错')
                }
              })
            }
          })
        }
      }
    })
  },
  // 客户端云能力初始化
  onCloudInit:function(){
    wx.cloud.init({
      traceUser: true
    })
  },
  // 操作数据库（lastname-cc5d22环境）
  onGetBaseData: function () {
    const lastnameDB = wx.cloud.database({
      env: 'lastname-cc5d22'
    })
    console.log('服务器',lastnameDB)
    lastnameDB.collection('users').add({
      data:{
        "lastname": '李',
        "name": '翠翠',
        "family": {
          "from": "遥远的东方", 
          "users": { 
            "0": { "city": "上海", "infor": "一起跑啊", "name": "李天临" }, 
            "1": { "city": "天津", "infor": "歌唱家", "name": "李奥" } 
          } 
        }
      },
      success:function(res){
        console.log(res)
      }
    })
    // console.log('获取服务器数据',users)
  },
  // 点击弹出‘微信授权’窗口
  //用户点击‘允许’，允许开发者获得用户的公开信息（昵称，头像等）
  onGetUserInfo: function(e) {
    const that = this;
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
        user_nickName:e.detail.userInfo.nickName
      })
      app.globalData.openid = e.detail.userInfo.openId
      //需要先获得用户信息才能查询数据库
      //验证云端是否存在用户数据 
      const db = wx.cloud.database();
      // 读取用户数据，并渲染在页面上
      db.collection('Users').where({
        _openid:app.globalData.openid //填入当前用户openid
      }).get().then(res => {
        if(res.data[0] != null){
          //存在数据就开始拉取
          that.setData({
            page_id:res.data[0].IQ,
            user_dbFlag:true
          })
        }else{
          //创建用户数据
          db.collection("Users").add({
            data:{
              userName:app.globalData.user_nickName,
              userDate:db.serverDate(),
              IQ:10,
              id:app.globalData.openid
            }
          })
          .then(res => {
            that.setData({
              page_id:'10',
              user_dbFlag:true
            })
            console.log('创建的新数据',res)
            app.globalData._id = res._id
          })

          that.setData({
            user_dbFlag:true
          })
        }
      })
      app.globalData.logged = true
    }
  },
  //前端调用自定义云函数（向后端服务发起名为'arthurSlog_getInfo'方法的请求）
  //请求的结果会返回，并保存在res对象中
  //请求后端接口，获取openid
  arthurSlog_getInfo:function(){
    wx.cloud.callFunction({
      name:'arthurSlog_getInfo',
      complete:res => {
        console.log('callFunction test result: ', res)
      }
    })
  },
  //传递打他给后端，获取处理结果
  arthurSlog_getInfoAdd: function () {
    wx.cloud.callFunction({
      name: 'arthurSlog_getInfoAdd',
      data: {
        a: 8,
        b: 8
      },
    })
    .then(res => {
      console.log(res.result)
    })
    .catch(console.error)
  },
  // 上传存储图片（到后端），云端函数不用自己编写了，腾讯给的有
  arthurSlog_uploadImg:function(){
    var that = this;
    //选择图片
    wx.chooseImage({
      count:1,
      sizeType:['original','compressed'],
      sourceType:['camera','album'],
      success: function(res) {
        // tempFilePaths是src路径集合数组
        const tempFilePaths = res.tempFilePaths;

        wx.showLoading({
          title:'上传中'
        })

        that.setData({
          imagePath: tempFilePaths[0],
        })
        console.log('图片临时路径',tempFilePaths)

        const filePath = tempFilePaths[0]
        const cloudPath = 'ArthurSlog' + filePath.match(/\.[^.]+?$/)[0]
        // 把小程序客户端的路径传到服务器
        wx.cloud.uploadFile({
          cloudPath,
          filePath,//小程序临时文件路径
        }).then(res => {
          console.log(res.fileID)
          console.log(res.statusCode)
        }).catch(error => {
          console.error('[上传文件]失败',error)
          wx.showToast({
            icon:'none',
            title: '上传失败',
          })
        }).then(() => {
          wx.hideLoading();
        })
      },
    })
  },
  arthurSlog_readingBook:function(){
    const that = this;
    //验证是否已经授权
    if(app.globalData.logged){
      const db = wx.cloud.database();
      const dbCommand = db.command;
      //读取用户数据，并渲染在页面上
      db.collection('Users').where({
        _openid: dbCommand.eq(app.globalData.openid) //植入当前用户 openid
      }).get().then(res => {
        console.log('查询数据库')
        if(!res.data){
          console.log("云端数据库没有返回数据")
          console.log("用户在数据库没有数据，现在为用户创建数据库")
          //创建用户数据
          db.collection('User').add({
            //data字段表示需新增的JSON数据
            data:{
              ueserName:app.globalData.user_nickName,
              userData:db.serverDate(),
              IQ:'10'
            }
          })
          .then(res => {
            console.log('用户数据创建成功')
            console.log(res)
          }).catch(console.error)
          app.globalData.user_dbFlag = true;
        } else if(res.data){
          console.log('成功更新数据库')
          console.log(res)
          that.setData({
            page_iq:++app.globalData.IQ
          })
        }

      })

    }else if(!app.globalData.logged){
      //弹出提示框，显示‘请点击头像授权’授权是通过onGetUserInfo执行的
      wx.showToast({
        icon: 'none',
        title: '请先点击右上角允许授权',
      })
    }
    
  },
  // 获取登录openid
  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },
  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})
