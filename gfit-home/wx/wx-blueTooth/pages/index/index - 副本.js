//index.js
//获取应用实例
const app = getApp()
var Dec = require('../../utils/public.js');
Page({
  data: {
    open_page: true,
    isCheck:false,
    test_btn_text:"",
    wxpro_token: '',
    refresh_token:'',
    decrypt_key:'',
    action_id:'',
    openBluetooth:'',
    devices: [],
    connectedDeviceId:'',
    services: '',     // 连接设备的所有服务值  
    serviceId: '',     // 能读取操作的服务值
    characteristics: "",   // 连接设备的特征值  
    characteristicsArr: [],
    writeServicweId: '', // 可写服务uuid  
    writeCharacteristicsId: [],//可写特征值uuid  
    readServicweId: '', // 可读服务uuid  
    readCharacteristicsId: [0, 2],//可读特征值uuid  
    notifyServicweId: '', //通知服务UUid  
    timesRun:1,
    notifyCharacteristicsId: [], //通知特征值UUID  
    getRunnerTData:'',
    actionResult:0,
    setSerialNumber:-1,
    bluetoothAdapterState:{
      bluetoothDiscover: '',
      bluetoothAvailable:''
    },
    recordBleJournal: {
      action_id: '',
      journal: []
    },
    // 蓝牙指令
    commends: [
      { "instruction": 2, "name": "treadmill", "length": 0, "control": 0 }, 
      { "instruction": 1, "name": "vendor", "length": 0, "control": 0 }, 
      { "instruction": 3, "name": "status", "length": 1, "control": 5 }, 
      { "instruction": 3, "name": "start", "length": 3, "control": 1 }, 
      { "instruction": 3, "name": "stop", "length": 1, "control": 3 }, 
      { "instruction": 3, "name": "pause", "length": 1, "control": 2 },
      { "instruction": 3, "name": "speed", "length": 3, "control": 4 }, 
      { "instruction": 3, "name": "slope", "length": 3, "control": 4 }],
    commends2:[],
    commendWrite:[]
  },
  onLoad: function () {
    var that = this
    var commendId = that.getHexString(that.data.commends[0], 6)
    var commendIdEn = Dec.Encrypt('01', "CHITUYUNDONG2017")
    console.log('加密后的命令1：', commendIdEn)
    if (that.data.isCheck){
      that.setData({
        test_btn_text:'检测中...'
      })
    }else{
      that.setData({
        test_btn_text: '开启检测'
      })
    }
    // 获取登录令牌
    try {
      var authValue = wx.getStorageSync('auth')
      console.log(authValue)
      // 本地存储存在且未过期
      if (authValue) {
        wx.checkSession({
          success: function () {
            //session_key 未过期，并且在本生命周期一直有效
            console.log('从本地stroage中获取:',authValue)
            that.setData({
              open_page: false,
              wxpro_token: authValue.data.wxpro_token,
              refresh_token: authValue.data.wxpro_ref_token,
              decrypt_key: authValue.data.decrypt_key
            })
            that.getCommand();
          },
          fail: function () {
            // session_key 已经失效，需要重新执行登录流程
            that.getLogin() //重新登录
          }
        })
        
      } else {
        that.getLogin()
      }
    } catch (err) {
      that.setErr()
      console.log("获取本地存储失败", err)
    }
  },
  // 登录并存储
  getLogin:function(){
    var that = this;
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        var code = {
          code: res.code
        }
        console.log("初次登录:",code)
        that.request('wxpro/auth', 'get',code,that.data.wxpro_token, function (res) {
          that.setData({
            wxpro_token: res.data.data.wxpro_token,
            refresh_token: res.data.data.wxpro_ref_token,
            decrypt_key: res.data.data.decrypt_key
          })
          console.log(that.data.wxpro_token)
          try {
            wx.setStorageSync('auth',{
              name: 'auth',
              data: res.data.data
            })
            // 开始获取蓝牙指令
            that.getCommand();
            // var authData = wx.getStorageSync('auth')
            // console.log(authData)
          } catch (err) {
            that.setErr()
            console.log("存储失败", err)
          }
        });
      }
    }) 
  },
  // 获取蓝牙指令
  getCommand:function(){
    var that = this, code = {operation:'all'};
    console.log('getCommand:',that.data.wxpro_token)
    that.request('wxpro/command', 'get', code, that.data.wxpro_token, function (res) {
      // console.log(that.data.decrypt_key, res.data.data.encrypted)
      // 解密并保存跑步机命令
      var commandString = Dec.Decrypt(res.data.data.encrypted, that.data.decrypt_key,"gfitwxmp20180524")
      var commandJson = JSON.parse(commandString.trim());
      that.setData({
        commends2: commandJson
      })
      console.log(that.data.commends2)
    })
  },
  // 开始检测
  test_start: function () {
    var that = this
      console.log('未开始检测')
      that.setData({
        isCheck: true,
        test_btn_text: '检测中...'
      })
      var timestamp = that.getTimestamp();
      // 获取action-id
      var actionData = {
        action: '蓝牙测试',
        timestamp: timestamp,
        result: that.data.actionResult
      }
      that.request('wxpro/record/action', 'post', actionData, that.data.wxpro_token, function (res) {
        that.setData({
          action_id: res.data.data.action_id
        })
        console.log(res,that.data.action_id)
      });
      // 开始检测
      that.getRunnerT();
  },
  // 开启蓝牙
  getRunnerT:function(){
    var that = this;
    console.log('找到蓝牙指令',that.data.commends)
    wx.showToast({
      title: '正在初始化',
      icon: "success",
      duration: 2000
    })
    // var isUse = app.useVersion('1.1.0');
    if (wx.openBluetoothAdapter){
      wx.openBluetoothAdapter({
        success: function (res) {
          wx.hideToast()
          that.setData({
            openBluetooth: "初始化蓝牙适配器成功！" + JSON.stringify(res),
          })
          that.getBluetoothAdapterState();
        },
        fail: function (err) {
          console.log(err);
          wx.showToast({
            title: '蓝牙初始化失败',
            icon: "success",
            duration: 2000
          })
          setTimeout(function () {
            wx.hideToast()
          }, 2000)
        }
      })
      
    }else{
      that.setErr()
      app.showModal('提示', '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。')
    }
    
  },
  // 蓝牙适配器是否可用
  getBluetoothAdapterState:function(){
    var that = this;
    wx.getBluetoothAdapterState({
      success: function (res) {
        // var available = res.available,
        //   discovering = res.discovering;
        // if (!available) {//蓝牙未开启
        //   wx.showToast({
        //     title: '设备无法开启蓝牙连接',
        //     icon: "success",
        //     duration: 2000
        //   })
        //   setTimeout(function () {
        //     wx.hideToast()
        //   }, 2000)
        // } else {
        //   if (!discovering) {//程序还未搜索设备
        //     // 开始扫描附近蓝牙
        //     that.startBluetoothDevicesDiscovery();
        //     // // 获取本机已配对（处于已连接状态）的蓝牙设备
        //     // that.getConnectedBluetoothDevices();
        //   }
        // }
        that.startBluetoothDevicesDiscovery();
        //监听蓝牙适配器状态  
        wx.onBluetoothAdapterStateChange(function (res) {
          var available = res.available;
          if (available) {//如果可用，则获取其状态   
            // 蓝牙状态发生变化后ios需停留2s在重新初始化
            setTimeout(function () {
              that.getRunnerT();
            }, 2000);
            that.getBluetoothAdapterState();
            that.getConnectedBluetoothDevices();
          }
          that.setData({
            bluetoothDiscover: res.discovering ? "在搜索。" : "未搜索。",
            bluetoothAvailable: res.available ? "可用。" : "不可用。",
          })
          console, log(that.data.bluetoothAdapterState)
        })
      },
    })
  },
  // 开始扫描附近蓝牙
  startBluetoothDevicesDiscovery:function(){
    var that = this;
    wx.showLoading({
      title: "蓝牙搜索"
    });
    // 搜索附近蓝牙(费资源)
    wx.startBluetoothDevicesDiscovery({
      services: ['E54EAA50-371B-476C-99A3-74D267E3EDAE'],
      allowDuplicatesKey: false,
      success: function (res) {
        // if (!res.isDiscovering) {//未发现，继续检查蓝牙适配器是否可用
        //   that.getBluetoothAdapterState();
        // } else {//扫描到设备后，获取设备列表
        //   that.getBluetoothDevices();
        // }
        wx.hideLoading();
        that.getBluetoothDevices();
        //监听蓝牙适配器状态  
        wx.onBluetoothAdapterStateChange(function (res) {
          that.setData({
            bluetoothDiscover: res.discovering ? "在搜索。" : "未搜索。",
            bluetoothAvailable: res.available ? "可用。" : "不可用。",
          })
        })
      },
      fail: function (err) {
        that.setErr()
        console.log(err);
      }
    })
  },
  // 获取设备列表
  getBluetoothDevices:function(){
    var that = this;
    wx.getBluetoothDevices({
      success: function (res) {
        if (res.devices.length < 1){
          console.log('搜索到的是空设备')
          that.startBluetoothDevicesDiscovery();
        }else{
          console.log('已发现的设备：', JSON.stringify(res.devices))
          that.setData({
            devices: res.devices
          })
          // 获取最强信号的RunnerT设备，并自动连接
          var devicesRort = that.sortRSSI(that.data.devices, 'RSSI')
          console.log({ '排序后的': devicesRort})
          if (devicesRort[0]) {
            console.log('最强信号的设备：', devicesRort[0])
            that.createBLEConnection('50:F1:4A:50:5A:08');
          } else {
            wx.showToast({
              title: '未检测到跑步机',
              icon: "none",
              duration: 2000
            })
          }
        }
        //是否有已连接设备  
        wx.getConnectedBluetoothDevices({
          success: function (res) {
            console.log(JSON.stringify(res.devices));
            that.setData({
              connectedDeviceId: res.deviceId
            })
          },
          fail: function (res) {
            that.setErr()
            console.log("没有蓝牙连接上", res);
          }
        })
      },
      fail: function (err) {
        that.setErr()
        console.log("没有发现设备")
      }
    })
  },
  // 连接设备
  createBLEConnection: function (connectedDeviceId) {
    var that = this;
    wx.showLoading({
      title: "蓝牙连接中"
    });  
    wx.createBLEConnection({
      deviceId: connectedDeviceId,
      success: function (res) {
        console.log('蓝牙连接成功：', res.errMsg);
        that.setData({
          connectedDeviceId: connectedDeviceId
        })
        console.log("自动连接到的最强设备：", that.data.connectedDeviceId)
        wx.hideLoading();
        // 停止收索设备
        that.stopBluetoothDevicesDiscovery();
        that.getBLEDeviceServices();
      },
      fail: function (err) {
        wx.hideLoading();
        that.setErr()
        console.log("连接蓝牙失败:", err);
      }

    })
    console.log("连接的设备号：", that.data.connectedDeviceId);
  },
  //停止搜索周边设备  
  stopBluetoothDevicesDiscovery: function () {
    var that = this;
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log("已停止搜索：", res)
      },
      fail:function(err){
        that.setErr()
        console.log("停止搜索失败！", res)
      }
    })
  },
  // 获取连接设备的所有service服务  
  getBLEDeviceServices: function () {
    var that = this;
    wx.getBLEDeviceServices({
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        console.log('获取设备的服务列表:', JSON.stringify(res.services));
        that.setData({
          services: res.services,
        })
        that.getBLEDeviceCharacteristics();
      },
      fail:function(err){
        that.setErr();
        console.log("搜索service服务失败！", res)
      }
    })
  },
  //获取连接设备的所有特征值
  getBLEDeviceCharacteristics: function (e) {
    var that = this;
    var characteristicsArr1 = [], notifyCharacteristicsId = [], writeCharacteristicsId = [], readCharacteristicsId = [];
    wx.getBLEDeviceCharacteristics({
      deviceId: that.data.connectedDeviceId,
      serviceId: that.data.services[1].uuid,
      success: function (res) {
        console.log('获取特征值成功：', JSON.stringify(res.characteristics))
        for (let i = 0; i < res.characteristics.length; i++) {
          let charc = res.characteristics[i];
          characteristicsArr1.push("uuid：" + charc.uuid.split('-')[0] + " notify：" + charc.properties.notify + " write：" + charc.properties.write)
          if (charc.properties.notify) {//能发送消息
            notifyCharacteristicsId.push(charc.uuid);
            that.setData({
              notifyServicweId: that.data.services[1].uuid,
              notifyCharacteristicsId: notifyCharacteristicsId
            })
          }
          if (charc.properties.write) {//能写
            writeCharacteristicsId.push(charc.uuid);
            that.setData({
              writeServicweId: that.data.services[1].uuid,
              writeCharacteristicsId: writeCharacteristicsId
            })
          }
          if (charc.properties.read) {//能读
            readCharacteristicsId.push(charc.uuid)
            that.setData({
              readServicweId: that.data.services[1].uuid,
              readCharacteristicsId: readCharacteristicsId
            })
          }
        }
        that.setData({
          characteristics: res.characteristics,
          serviceId: that.data.services[1].uuid,
          characteristicsArr: characteristicsArr1
        })
        console.log("当前服务的当前特征值：", that.data.characteristicsArr)
        console.log("writeCharacteristicsId:", that.data.writeCharacteristicsId)
        console.log("notifyCharacteristicsId:", that.data.notifyCharacteristicsId)
        // 10s内写入0x88
        var writeCharacteristicsIdCnnnect = that.getUUid(that.data.writeCharacteristicsId, "E54EAA55")
        var readCharacteristicsIdCnnnect = that.getUUid(that.data.readCharacteristicsId, "E54EAA55")
        var writeCharacteristicsIdCheck = that.getUUid(that.data.writeCharacteristicsId, "E54EAA57")
        var readCharacteristicsIdCheck = that.getUUid(that.data.readCharacteristicsId, "E54EAA56")
        that.writeData('0x88',1,0, writeCharacteristicsIdCnnnect, readCharacteristicsIdCnnnect);
        var commendId = that.getHexString(that.data.commends[0], 6)
        var commendIdEn = Dec.Encrypt(commendId, "CHITUYUNDONG2017")
        console.log({
          '加密后的命令':commendIdEn,
          '指令码的长度':commendIdEn.length
        })
        var a = '5A1AEDD0390E6B85FA492865122BB6AF'
        that.writeData(a, a.length/2, 1, writeCharacteristicsIdCheck, readCharacteristicsIdCheck);
        // var timer = setInterval(function () { 
        //   wx.readBLECharacteristicValue({
        //     deviceId: that.data.connectedDeviceId,
        //     serviceId: that.data.readServicweId,
        //     characteristicId: readCharacteristicsIdCheck,
        //     success: function (res) {
        //       console.log('一直读取数据:', res)
        //       clearInterval(timer);
        //     },
        //     fail: function (err) {
              
        //       that.setErr();
        //       console.log("读取失败：", err)
        //     }
        //   })
        // }, 300)
        

        // that.getStatus()

      },
      fail: function () {
        that.setErr();
        console.log("获取特征值失败");
      },
      complete: function () {
        console.log("");
      }
    })
  },
  // 开始控制跑步机
  // controlRannerT:function(){
  //   // 10s内写入0x88
  //   var writeCharacteristicsId1 = that.getUUid(that.data.writeCharacteristicsId, "E54EAA55")
  //   var readCharacteristicsId1 = that.getUUid(that.data.readCharacteristicsId, "E54EAA55")
  //   that.writeData('0x88', writeCharacteristicsId1, readCharacteristicsId1);
  //   // 开始启动跑步机
  //   that.getStatus()
  // },
  //查询跑步机连接状态300ms发送一次请求
  // getStatus:function(){
  //   console.log('控制跑步机环节')
  //   var writeCharacteristicsId = that.getUUid(that.data.writeCharacteristicsId, "E54EAA57")
  //   var readCharacteristicsId = that.getUUid(that.data.readCharacteristicsId, "E54EAA56")

  //   var commendId = that.getHexString(that.data.commends[0], 6)
  //   var commendIdEn = Dec.Encrypt(commendId, "CHITUYUNDONG2017")
  //   console.log('加密后的命令：', commendIdEn)
  //   that.writeData('02',1, writeCharacteristicsId, readCharacteristicsId);
  //   console.log('跑步机返回的信息：', that.data.getRunnerTData)
    
  //   // var timer = setInterval(function(){
      
  //   //   // 如果返回1，代表跑步机开启成功
  //   //   if (1) {
  //   //     // 开始写入暂停命令
  //   //   }
  //   //   // 如果返回2，代表跑步机暂停成功
  //   //   if (2) {
  //   //     // 按照一定速度重新启动
  //   //   }
  //   //   // 如果返回3，重启成功，
  //   //   if (3) {
  //   //     // 停止
  //   //   }
  //   //   // 如果返回4，停止成功
  //   //   if (4) {
  //   //     clearInterval(timer);
  //   //     //关闭定时器返回消息，测试成功。发送：3.1.3 记录用户检测操作，3.1.5 同步用户的蓝牙操作记录
  //   //   }
  //   // },300)
    
  // },
  // 写入并读取data
  writeData: function (orderValue, byteNum,byteiv,writeCharacteristicsId, readCharacteristicsId) {
    console.log('开始写入')
    var that = this;
    var notifyCharacteristicsId = that.getUUid(that.data.notifyCharacteristicsId, "E54EAA56")
    if (orderValue != '0x88'){
      // 每次写入命令，设置序列值
      that.setSerialNumber(that.data.setSerialNumber)
      console.log('系列号：', that.data.setSerialNumber)
      // 组装命令码并aes加密
      console.log((136).toString(16))
      
    }
    // A读写消息时先开启notify通知，注意只有特征值中notify为true的才能开启
    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能  
      deviceId: that.data.connectedDeviceId,
      serviceId: that.data.notifyServicweId,
      characteristicId: notifyCharacteristicsId,
      success: function (res) {//C开启监听特征值变化，如果蓝牙有响应，在这里就会收到消息
        console.log('开启notify通知成功：', res.errMsg)
        wx.onBLECharacteristicValueChange(function (characteristic) {
          // ArrayBuffer转16进制字符串
          let hex = Array.prototype.map.call(new Uint8Array(characteristic.value), x => ('00' + x.toString(16)).slice(-2)).join('');
          console.log("接收蓝牙返回的数据：", hex)
          // 检测返回值
          if (hex.length > 2) {
            var timestamp = that.getTimestamp();
            var code = {
              action_id: that.data.action_id,
              data: hex,
              timestamp: timestamp
            }
            console.log(code)
            that.request('wxpro/parse', 'post', code, that.data.wxpro_token, function (res) {
              console.log(res)
            })
          }
          that.setData({
            getRunnerTData: hex
          })
        })
        console.log("跑步机返回的数据：",that.data.getRunnerTData)
        // B开始写入消息，注意只有特征值中write未true的才能写入
        // ArrayBuffer分配字节空间比如0x88分配一个字节，020006分配3个字节
        var buf = new ArrayBuffer(byteNum)
        // 分配字节成功
        if (buf.byteLength === byteNum){
          var dataView = new DataView(buf)//对buf按照缩影进行排序
          dataView.setUint8(byteiv, orderValue); //写入1个字节的8位无符号整数

          wx.writeBLECharacteristicValue({
            deviceId: that.data.connectedDeviceId,
            serviceId: that.data.writeServicweId,
            characteristicId: writeCharacteristicsId,
            // 这里的value是ArrayBuffer类型  
            value: buf,
            success: function (res) {
              console.log({ '写入命令:': orderValue, "处理后的命令:": buf })
            },
            fail: function (res) {
              that.setErr();
              console.log('写入失败', res)
            }
          });
          /**
           * 坑就在这里了，对于安卓系统，需要添加下面这段代码。你写完数据后，还必须读一次，才能被onBLECharacteristicValueChange监听到，才会把数据返回给你，
           * 但在苹果系统里面就不能有下面这段代码了，因为如果你添加上去的话，会出现发一次指令出现两次返回值的情况
           */
          wx.readBLECharacteristicValue({
            deviceId: that.data.connectedDeviceId,
            serviceId: that.data.readServicweId,
            characteristicId: readCharacteristicsId,
            success: function (res) {
              console.log('读取成功:', res)
            },
            fail: function (err) {
              that.setErr();
              console.log("读取失败：", err)
            }
          })
        }else{
          console.log('分配字节长度' + buf.byteLength+'过长失败');
          that.setErr();
        }
        
      },
      fail: function (res) {
        that.setErr();
        console.log('开启notify通知失败：', res);
      }
    })

  },
  // json值转化16进制并合并
  getHexString: function (json, setSerialNumber){
    var that=this
    if (json.length<1){
      return that.sethex(json.instruction) + that.sethex(json.length) + that.sethex(setSerialNumber)
    }else{
      if (json.name =='start'){
        console.log('长度大于0且是开启命令')
        // 开启：速度10,坡度1
        return that.sethex(json.instruction) + that.sethex(json.length) + that.sethex(json.control) + that.sethex(10) + that.sethex(1) + that.sethex(setSerialNumber)
      }else{
        console.log('长度大于0且不是开启命令')
        return that.sethex(json.instruction) + that.sethex(json.length) + that.sethex(json.control) + that.sethex(setSerialNumber)
      }
    }
  },
  // 十进制转16进制
  sethex:function(num){
    if (num<10){
      return '0'+num
    }else{
      return num.toString(16)+''
    }
  },
  setErr:function(){
    var that = this;
    that.setData({
      isCheck:false
    })
    app.showModal('提示', '服务器繁忙，请稍后再试！')
  },
  // 记序列号
  setSerialNumber:function(num){
    var that = this;
    num++;
    if (num>255){
      num=0;
    }
    that.setData({
      setSerialNumber:num
    })
    return num;
  },
  // 去除空格
  trim:function(str){
    return str.replace(/^\s+|\s+$/gm, '')
  },
  // 接口封装
  request: function (path, method, data, wxproToken,doSuccess){
    var that = this;
    wx.request({
      url: 'https://dev.gfitgo.com/gfit-app-inf/'+path,
      data: data,
      method: method,
      header: {
        'content-type': 'application/json',
        'wxpro_token': wxproToken
      },
      success: function (res) {
        console.log(path+'后台返回值:', res)
        if (wxproToken){
          console.log("wxproToken不为空就要判断登录是否过期：", wxproToken)
          if (res.data.resultCode =='400400'){
            console.log('登录令牌过期', res.data.resultCode)
            // 登录令牌过期
            wx.request({
              url: 'https://dev.gfitgo.com/gfit-app-inf/wxpro/refresh_token',
              data: that.data.refresh_token,
              method: 'get',
              header: {
                'content-type': 'application/json',
              },
              success:function(res){  
                //刷新令牌过期
                if (res.data.resultCode == '400401'){
                  console.log('刷新令牌过期', res.data.resultCode)
                  that.getLogin();
                }else{
                  that.setData({
                    wxpro_token: res.data.data.wxpro_token,
                  })
                }
              },
              fail:function(err){
                console.log('wxpro/refresh_token：',err)
              }
            })
          }

        }
        if (typeof doSuccess == "function"){
          doSuccess(res)
        }
      },
      fail: function (err) {
        app.showModal('提示', '服务器繁忙，请稍后再试！')
      },
    })
  },
  // 蓝牙操作流水步骤记录
  getBleJournal: function (arr, instruction, err) {
    var that = this, timestamp = that.getTimestamp();
    arr.push({ instruction: instruction, timestamp: timestamp, err: err })
    console.log(arr)
  },
  getTimestamp:function(){
    var timestamp = Math.round(new Date().getTime() / 1000);
    return timestamp;
  },
  // 查找runner蓝牙设备并按照RSSI排序
  sortRSSI: function (arr,sortAttr) {
    if (arr.length === 1){
      return arr;
    } else if (arr.length > 1){
      for (var i = 0, len = arr.length; i < len - 1; i++) {
        for (var j = 0; j < arr.length - i - 1; j++) {
          if (arr[j][sortAttr] < arr[j + 1][sortAttr]) {
            var hand = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = hand;
          }
        }
      }
      return arr;
    }else{
      wx.showToast({
        title: '未检测到设备',
        icon: 'none',
        duration: 2000
      })
    }
    
  },
  // 查找数组中（可写列表）含有指定的（57）特征值的uuid
  getUUid:function(arr,target){
    for (var i = 0, len = arr.length; i < len;i++){
      if (arr[i].indexOf(target)>-1){
        return arr[i];
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
