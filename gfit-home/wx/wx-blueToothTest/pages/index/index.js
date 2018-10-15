//index.js
//获取应用实例
const app = getApp()
var Dec = require('../../utils/public.js');

Page({
  data: {
    aesceshi:'我是莉莉',
    status: "",
    getData:'',
    sousuo: "",
    openBlueTooth:"",
    msg1: "",
    value:'',
    characteristicsIndex:0,
    orderValue:'',
    serviceId:'',
    connectedDeviceId: "", //已连接设备uuid  
    services: "", // 连接设备的服务 
    characteristics: "",   // 连接设备的状态值  
    characteristicsArr:[],
    writeServicweId: '', // 可写服务uuid  
    writeCharacteristicsId: [],//可写特征值uuid  
    readServicweId: '', // 可读服务uuid  
    readCharacteristicsId: [0,2],//可读特征值uuid  
    notifyServicweId: '', //通知服务UUid  
    notifyCharacteristicsId: [], //通知特征值UUID  
    inputValue: "",
    characteristics1: "", // 连接设备的状态值  
    recordBleData:{
      action_id:'',
      actionData:[]
    },
    // 加密数据
    commendData: {encrypted: [{ name: "lily", instruction: 2, length: 10 },{ name: "xiaoming", instruction: 5, length: 10 }]}
    
  },
  onLoad: function () {
    var that = this
    var data = '0206aa'
    var buf = that.stringToHexBuffer(data)
    console.log(buf)
    // var ceshi4 = Dec.Encrypt(that.data.aesceshi);
    // console.log('加密后的数字',ceshi4)
    
    // JSON.stringify()
    // 加密解密 变量是字符串
    // var mm = Dec.Encrypt(JSON.stringify(that.data.commendData))
    // var jm = JSON.parse(Dec.Decrypt(mm))
    // console.log({ 'AES加密后的：': mm, '解密后的：': jm })
    // 加密解密结束
    if (wx.openBluetoothAdapter) {
      wx.openBluetoothAdapter()
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示  
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }

  },
  // 初始化蓝牙适配器lanya1
  openBlueTooth: function (e) {
    var that = this;
    // var isUse = app.useVersion('1.1.0');
    console.log(e.detail.value)
    if(e.detail.value){
      // if (isUse>0){
        // 初始化蓝牙适配器
        wx.openBluetoothAdapter({
          success: function (res) {
            // 本机蓝牙适配器状态
            wx.getBluetoothAdapterState({
              success: function (res) {
                that.recordBle('openBluetoothAdapter', 1);
                wx.showToast({
                  title: '本机适配',
                  icon: 'success',
                  duration: 2000
                })
                that.setData({
                  openBlueTooth: e.detail.value
                })
                console.log("haha")
                //监听蓝牙适配器状态  
                wx.onBluetoothAdapterStateChange(function (res) {
                  if (res.available) {
                    that.recordBle('onBluetoothAdapterStateChange', 1);
                    // wx.showToast({
                    //   title: res.discovering ? "在搜索。" : "未搜索。",
                    //   icon: 'success',
                    //   duration: 2000
                    // })
                    // 蓝牙状态发生变化后ios需停留2s在重新初始化
                    setTimeout(function () {
                      that.openBlueTooth();
                    }, 2000);
                  }else{
                    that.recordBle('onBluetoothAdapterStateChange',2);
                  }

                })
              },
              fail:function(){
                that.recordBle('openBluetoothAdapter', 2);
              }
            })
          },
          fail: function (err) {
            that.recordBle('openBluetoothAdapter',2);
            wx.showToast({
              title: "蓝牙未开启",
              icon: "loading",
              duration: 2000
            })
          },
          complete:function(){
            
          }
        })
      // }else{
      // }   
    }else{
    }
  },
  //搜索设备lanya3
  startBluetoothDevicesDiscovery: function (e) {
    var that = this;
    if (e.detail.value) {
      wx.startBluetoothDevicesDiscovery({
        services: ['E54EAA50-371B-476C-99A3-74D267E3EDAE'],
        allowDuplicatesKey: false,
        success: function (res) {
          that.recordBle('startBluetoothDevicesDiscovery', 1);
          // that.setData({
          //   msg: "搜索设备" + JSON.stringify(res),
          // })
          console.log('开始搜索设备',res)
          that.lanya4();
          //监听蓝牙适配器状态  
          wx.onBluetoothAdapterStateChange(function (res) {
            that.recordBle('onBluetoothAdapterStateChange', 1);
            that.setData({
              sousuo: res.discovering ? "在搜索。" : "未搜索。",
              status: res.available ? "可用。" : "不可用。",
            })
          })
          
        },
        fail:function(){
          that.recordBle('startBluetoothDevicesDiscovery', 2);
        }
      })
    }else{
      that.setData({
        msg: [],
        devices:[]
      })
      wx.hideLoading();
    }
  },
  // 获取所有已发现的设备  
  lanya4: function () {
    var that = this;
    // 获取发现的设备
    wx.getBluetoothDevices({
      success: function (res) {
        console.log('已发现的设备：', JSON.stringify(res.devices))
        that.setData({
          devices: res.devices
        })

        var devicesRort = that.sortRSSI(that.data.devices, 'RSSI')
        console.log('按照RSSI排序后的Ranner设备：', devicesRort)
        // 自动连接最强信号的跑步机
        // if (devicesRort[0]) {
        //   // that.connectTO(devicesRort[0]['deviceId']);
        //   wx.createBLEConnection({
        //     deviceId: devicesRort[0]['deviceId'],
        //     success: function (res) {
        //       console.log('蓝牙连接成功：', res.errMsg);
        //       that.setData({
        //         connectedDeviceId: devicesRort[0]['deviceId']
        //       })
        //       that.lanya5();
        //       that.lanya6();
        //       wx.hideLoading();
        //       console.log("自动连接到的最强设备：",that.data.connectedDeviceId)
        //       // that.lanya6();
        //     },
        //     fail: function (err) {
        //       console.log("连接蓝牙失败:", err);
        //     }

        //   })
        // } else {
        //   wx.showToast({
        //     title: '未检测到跑步机',
        //     icon: "none",
        //     duration: 2000
        //   })
        // }
        
        //是否有已连接设备  
        wx.getConnectedBluetoothDevices({
          success: function (res) {
            console.log(JSON.stringify(res.devices));
            that.setData({
              connectedDeviceId: res.deviceId
            })
          },
          fail: function (res) {
            console.log("没有蓝牙连接上", res);
          }
        })
        //监听蓝牙适配器状态  
        wx.onBluetoothAdapterStateChange(function (res) {
          that.setData({
            sousuo: res.discovering ? "在搜索。" : "未搜索。",
            status: res.available ? "可用。" : "不可用。",
          })
        })
      },
      fail: function (err) {
        console.log("没有发现设备")
      }
    })
  },
  //连接设备  
  connectTO: function (e) {
    var that = this;
    wx.showLoading({
      title: "蓝牙连接中"
    });
    // 先停止收索在创建连接
    that.lanya5();
    wx.createBLEConnection({
      deviceId: e.currentTarget.id,
      success: function (res) {
        console.log('蓝牙连接成功：',res.errMsg);
        that.setData({
          connectedDeviceId: e.currentTarget.id
        })
        wx.hideLoading();
        that.lanya6();
      },
      fail: function (err) {
        console.log("连接蓝牙失败:",err);
      }

    })
    console.log("连接的设备号：", that.data.connectedDeviceId);
  },
  //停止搜索周边设备  
  lanya5: function () {
    var that = this;
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log("已停止搜索：", res)
        that.setData({
          sousuo: res.discovering ? "在搜索。" : "未搜索。",
          status: res.available ? "可用。" : "不可用。",
        })
      }
    })
  },
  
  // 获取连接设备的所有service服务  
  lanya6: function () {
    var that = this;
    wx.getBLEDeviceServices({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        console.log('获取设备的服务列表:', JSON.stringify(res.services));
        that.setData({
          services: res.services,
          msg: res.services
        })
        that.lanya7();
      }
    })
  },
  changeCharacteristics: function (e) {
    const val = e.detail.value;
    var that = this;
    this.setData({
      correntUuid: that.data.characteristics[val[0]],
      correntNotify: that.data.characteristics[val[1]],
      correntWrite: that.data.characteristics[val[2]]
    })
  },
  //获取连接设备的所有特征值
  lanya7: function (e) {
    var that = this;
    var characteristicsArr1 = [], notifyCharacteristicsId = [], writeCharacteristicsId = [], readCharacteristicsId=[];
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
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
        console.log({
          '可写列表': that.data.writeCharacteristicsId,
          '可通知列表': that.data.notifyCharacteristicsId,
          '可读列表': that.data.readCharacteristicsId,
        })
        // console.log("当前服务的当前特征值：", that.data.characteristicsArr)
        // console.log("true:writeCharacteristicsId:", that.data.writeCharacteristicsId)
        // console.log("true:notifyCharacteristicsId:", that.data.notifyCharacteristicsId)
        // 10s内写入0x88
        that.writeData('88', 0, 0);
        // that.writeData('AA5504B10000B5', 1, 1);
         
        // that.writeData('5A1AEDD0390E6B85FA492865122BB6AF', 1, 1);
        
      },
      fail: function () {
        console.log("获取特征值失败");
      },
      complete: function () {
        console.log("");
      }
    })
  },
  bindPickerChange:function(e){
    that.setData({
      characteristicsIndex:e.detail.value
    })
    // 特征值发生变化 - 写入命令
  },
  getInputValue:function(e){
    var that = this;
    that.setData({
      orderValue: e.detail.value
    })
    console.log("输入框的value值", typeof (that.data.orderValue))
  },

  // 字符串转16进制
  strToHexCharCode: function (str) {
    　　if(str === "")
　　　　return "";
    　　var hexCharCode = [];
    　　hexCharCode.push("0x"); 
    　　for(var i = 0; i<str.length; i++) {
  　　　　hexCharCode.push((str.charCodeAt(i)).toString(16));
　　}
　　return hexCharCode.join("");
  },
  // 16进制数据转ArrayBuffer
  stringToHexBuffer: function (data) {
    //var data = AA5504B10000B5
    var typedArray = new Uint8Array(data.match(/[da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    }))
    return typedArray.buffer
  },
  // 提交
  orderSubmit:function(){
    var that=this;
    var orderValueHex = (parseInt(that.data.orderValue)).toString(16)
    console.log("用户输入的指令值：", orderValueHex)
    // that.writeData('123', 0, 0);
    // that.writeData(that.data.orderValue, 0, 0);
    // that.writeData(that.data.orderValue, 1, 1);
    that.writeData(orderValueHex, 1, 1);
    // (orderValue, byteNum, byteNumIv, writeIndex, readIndex)
  },
  
  // 写入并读取data
  writeData: function (orderValue,writeIndex,readIndex){
    var that=this;
    // A读写消息时先开启notify通知，注意只有特征值中notify为true的才能开启
    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能  
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
      serviceId: that.data.notifyServicweId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取  
      characteristicId: that.data.notifyCharacteristicsId[0],
      success: function (res) {//C开启监听特征值变化，如果蓝牙有响应，在这里就会收到消息
        console.log('开启notify通知成功：', res.errMsg)
        wx.onBLECharacteristicValueChange(function (characteristic) {
          console.log('触发动作！')
          // // ArrayBuffer转16进制字符串
          let hex = Array.prototype.map.call(new Uint8Array(characteristic.value), x => ('00' + x.toString(16)).slice(-2)).join('');
          that.setData({
            getData: hex
          })

        })  
      },
      fail: function (res) {
        console.log('开启notify通知失败：', res);
      },
      complete:function(){
        console.log({ 
          deviceId: that.data.connectedDeviceId, 
          serviceId: that.data.notifyServicweId, 
          characteristicId: that.data.notifyCharacteristicsId[0] 
          })
      }
    })
    // B开始写入消息，注意只有特征值中write未true的才能写入
    // 0x88
    var buf = new ArrayBuffer(orderValue.length / 2)
    var dataView = new DataView(buf)
    // // dataView.setUint8(0, 0x02);
    // // dataView.setUint8(1, 0x06);
    // // dataView.setUint8(2, 0x08);
    // // dataView.setUint8(3, 0xAE);
    for (var i = 0; i < orderValue.length / 2; i++) {
      dataView.setUint8(i,orderValue.slice(2 * i, 2 * i + 2));
    }
    // var buf = that.stringToHexBuffer(orderValue)
    wx.writeBLECharacteristicValue({
      deviceId: that.data.connectedDeviceId,
      serviceId: that.data.writeServicweId,
      characteristicId: that.data.writeCharacteristicsId[writeIndex],
      // 这里的value是ArrayBuffer类型  
      value: buf,
      success: function (res) {
        console.log({ '压力数据中写入:': orderValue, "处理后的命令:": buf })
      },
      fail: function (res) {
        console.log('写入失败', res)
      }
    });
    /**
     * 坑就在这里了，对于安卓系统，需要添加下面这段代码。你写完数据后，还必须读一次，才能被onBLECharacteristicValueChange监听到，才会把数据返回给你，
     * 但在苹果系统里面就不能有下面这段代码了，因为如果你添加上去的话，会出现发一次指令出现两次返回值的情况
    **/
    wx.readBLECharacteristicValue({
      deviceId: that.data.connectedDeviceId,
      serviceId: that.data.notifyServicweId,
      characteristicId: that.data.readCharacteristicsId[readIndex],
      success: function (res) {
        console.log('读取成功:', res)
      },
      fail: function (err) {
        console.log("读取失败：", err)
      }
    }) 
    
  },
  //断开设备连接  
  lanya0: function () {
    var that = this;
    wx.closeBLEConnection({
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        that.setData({
          connectedDeviceId: "",
          msg: []
        })
      }
    })
  },
  //监听input表单  
  inputTextchange: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  // recordBleData: {
  //   action_id: '',
  //   actionData: [
  //     { action: '', timestamp: '', result: '' }
  //   ]
  // }
  
  recordBle: function (actionName, result){
    var that = this, timestamp = Math.round(new Date().getTime() / 1000);
    that.data.recordBleData.actionData.push({ action: actionName, timestamp: timestamp, result: result })
    console.log(that.data.recordBleData)

  },
  // 查找runner蓝牙设备并按照RSSI排序
  sortRSSI: function (arr, sortAttr) {
    console.log({ '所有的跑步机': arr })
    if (arr.length === 1) {
      return arr;
    } else if (arr.length > 1) {
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
    } else {
      wx.showToast({
        title: '未检测到设备',
        icon: 'none',
        duration: 2000
      })
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
