//index.js
//获取应用实例
const app = getApp()
var Dec = require('../../utils/public.js');
Page({
  data: {
    nowData: 0,
    runnerMac: "",
    stepId: 10,
    stepMove: {
      stepMoveId: 0,
      stepImg: '../pic/icon2.png',
      stepP: '正在搜索跑步机',
      stepBtn: '停止搜索',
      stepText: '搜索到跑步机',
    },
    animationData1: {},
    animationData: {},
    isCheck: false,
    finish: false,
    wxpro_token: '',
    refresh_token: '',
    decrypt_key: '',
    action_id: 0,
    openBluetooth: '',
    devices: [],
    connectedDeviceId: '',
    services: '',     // 连接设备的所有服务值  
    characteristicsArr: [],
    writeServicweId: '', // 可写服务uuid  
    writeCharacteristicsId: [],//可写特征值uuid  
    readServicweId: '', // 可读服务uuid  
    readCharacteristicsId: [0, 2],//可读特征值uuid  
    notifyServicweId: '', //通知服务UUid  
    notifyCharacteristicsId: [], //通知特征值UUID  
    getRunnerTData: '',
    setSerialNumber: -1,
    writeCharacteristicsIdCheck: '',
    readCharacteristicsIdCheck: '',
    timer: '',
    discoveryTimes: 0,
    nowStatus: '',
    protocol: '',
    getParseStatus: {},
    recordBleJournal: {
      action_id: '',
      journal: []
    },
    // 蓝牙指令
    commends: [],
    commendId: {},
    commendsOld: {
      B1: 0,
      B2: 0,
      B3: 0,
      B4: 0,
    }
  },
  // 页面加载
  onLoad: function () {
    '111'
    var that = this
    // 获取登录令牌
    try {
      var authValue = wx.getStorageSync('auth')
      console.log(authValue)
      // 本地存储存在且未过期
      if (authValue) {
        wx.checkSession({
          success: function () {
            //session_key 未过期，并且在本生命周期一直有效
            console.log('从本地stroage中获取:', authValue)
            that.setData({
              wxpro_token: authValue.data.wxpro_token,
              refresh_token: authValue.data.wxpro_ref_token,
              decrypt_key: authValue.data.decrypt_key
            })
            console.log('getStorage66666666666666', authValue.data.decrypt_key)
            // that.getCommand();
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
      app.showModal('提示', '当前服务器繁忙，请稍后再试')
      console.log("获取本地存储失败", err)
    }
  },
  onShow: function () {
  },
  // 页面看不见时
  onHide: function () {
    var that = this;
    try {
      wx.clearStorageSync()
    } catch (e) {
      // Do something when catch error
    }
    clearInterval(that.data.timer)
    // that.closeBLEConnection();
    that.connectionStateChange();
  },
  toInstallGfit: function () {
    wx.navigateTo({
      url: '../installGfit/installGfit',
    })
  },
  // 登录并存储
  getLogin: function () {
    var that = this;
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        var code = {
          code: res.code
        }
        console.log("初次登录:", code)
        that.request('wxpro/auth', 'get', code, that.data.wxpro_token, function (res) {
          that.setData({
            wxpro_token: res.data.data.wxpro_token,
            refresh_token: res.data.data.wxpro_ref_token,
            decrypt_key: res.data.data.decrypt_key
          })
          console.log('getLogin66666666666666', res.data.data.decrypt_key)
          try {
            wx.setStorageSync('auth', {
              name: 'auth',
              data: res.data.data
            })
            // 开始获取蓝牙指令
            // that.getCommand();
            // var authData = wx.getStorageSync('auth')
            // console.log(authData)
          } catch (err) {
            app.showModal('提示', '当前服务器繁忙，请稍后再试')
            console.log("存储失败", err)
          }
        });
      }
    })
  },
  createAnimation: function (moveNum, stepMoveId) {
    var that = this;
    var animation = wx.createAnimation({
      duration: 2000,
      timingFunction: 'ease',
    })
    this.animation = animation
    animation.opacity(1).right(moveNum).step()
    console.log(that.data.stepId)
    if (stepMoveId == 0) {
      this.setData({
        animationData: animation.export()
      })
      console.log('stepMoveId=0', that.data.animationData)
    } else {
      this.setData({
        animationData1: animation.export()
      })
      console.log('stepMoveId其他', that.data.animationData)
    }

  },
  // 开始检测
  test_start: function () {
    var that = this
    that.closeBLEConnection(that.data.connectedDeviceId);
    that.setAction('开启检测', 0)
    var stepMove = {
      stepMoveId: 0,
      stepImg: '../pic/icon2.png',
      stepP: '正在搜索跑步机',
      stepBtn: '停止搜索',
      stepText: '搜索到跑步机',
    }
    that.setData({
      isCheck: true,
      stepId: 20,
      stepMove: stepMove
    })
    if (that.data.stepId == 20 && that.data.stepMove.stepMoveId == 0){
      that.setData({
        animationData:{}
      })
      that.createAnimation('0rpx', 0)
    }
    // 开始检测
    that.getRunnerT();
  },

  // 开启蓝牙
  getRunnerT: function () {
    var that = this;
    if (that.data.isCheck) {
      if (wx.openBluetoothAdapter) {
        wx.openBluetoothAdapter({
          success: function (res) {
            that.setData({
              openBluetooth: "初始化蓝牙适配器成功！" + JSON.stringify(res),
            })
            console.log('检测蓝牙适配器：', res)
            that.getBluetoothAdapterState();
          },
          fail: function (err) {
            console.log(err);
            wx.showToast({
              title: '请先开启手机蓝牙',
              icon: "none",
              duration: 2000
            })
            setTimeout(function () {
              wx.hideToast()
            }, 1500)
          }
        })
      } else {
        app.showModal('提示', '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。')
      }
    }

    // }

    that.setAction('开启蓝牙', 10)
  },
  // 蓝牙适配器是否可用
  getBluetoothAdapterState: function () {
    var that = this;
    if (that.data.isCheck) {
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
          // ios test
          //监听蓝牙适配器状态  
          // wx.onBluetoothAdapterStateChange(function (res) {
          //   var available = res.available;
          //   if (available) {//如果可用，则获取其状态   
          //     // 蓝牙状态发生变化后ios需停留2s在重新初始化
          //     setTimeout(function () {
          //       that.getRunnerT();
          //     }, 2000);
          //     that.getBluetoothAdapterState();
          //     // that.getConnectedBluetoothDevices();
          //   }
          //   that.setData({
          //     bluetoothDiscover: res.discovering ? "在搜索。" : "未搜索。",
          //     bluetoothAvailable: res.available ? "可用。" : "不可用。",
          //   })
          //   console.log(that.data.bluetoothAdapterState)
          // })
          //ios test
        },
        fail: function () {
          that.setErr();
        }
      })
    }
  },
  // 开始扫描附近蓝牙
  startBluetoothDevicesDiscovery: function () {
    // servicesUUID
    var that = this;
    if (that.data.isCheck) {
      if (that.data.discoveryTimes >= 30) {
        wx.hideLoading();
        that.closeTest(404)
        that.data.discoveryTimes = 0;
      } else {
        that.data.discoveryTimes++;
        console.log('搜索次数', that.data.discoveryTimes)
        // 搜索附近蓝牙(费资源)
        // services: ['E54EAA50-371B-476C-99A3-74D267E3EDAE'],老协议0000180A-0000-1000-8000-00805f9b34fb
        wx.startBluetoothDevicesDiscovery({
          services: ['E54EAA50-371B-476C-99A3-74D267E3EDAE'],
          allowDuplicatesKey: false,
          success: function (res) {
            console.log('查找设备', res)
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
            wx.hideLoading();
            that.closeTest(404)
            console.log(err);
          }
        })
      }
      that.setAction('扫描设备', 20)
    }
  },
  // 获取设备列表
  getBluetoothDevices: function () {
    var that = this;
    if (that.data.isCheck) {
      wx.getBluetoothDevices({
        success: function (res) {
          console.log('获取到的设备源数据', res)
          that.setData({
            devices: res.devices
          })
          console.log('获取到的设备', that.data.devices)
          if (that.data.devices.length < 1) {
            console.log('搜索到的是空设备')
            that.startBluetoothDevicesDiscovery();
          } else {
            wx.hideLoading();
            console.log('已发现的设备：', that.data.devices)
            // 获取最强信号的RunnerT设备，并自动连接
            var devicesRort = that.sortRSSI(that.data.devices, 'RSSI')
            console.log({ '排序后的': devicesRort })
            if (devicesRort[0]) {
              console.log('最强信号的设备：', devicesRort[0])
              //获取广播地址
              var arrayBuff = Array.prototype.map.call(new Uint8Array(devicesRort[0].advertisData), x => ('00' + x.toString(16)).slice(-2)).join('');
              var runnerMac = arrayBuff.toLowerCase();
              var stepMoveNow = {
                stepMoveId: 1,
                stepImg: '../pic/icon4.png',
                stepP: '搜索到跑步机' + runnerMac,
                stepBtn: '停止检测',
                stepText: '',
              };
              console.log('mac地址', runnerMac)
              that.setData({
                runnerMac: runnerMac,
                stepMove: stepMoveNow,
                nowData: 20
              })
              console.log(that.data.stepId, that.data.stepMove.stepMoveId)
              if (that.data.stepId == 20 && that.data.stepMove.stepMoveId == 1) {
                that.setData({
                  animationData:{}
                })
                that.createAnimation('500rpx', 0)
                that.createAnimation('0rpx', 1)
              }           
              that.addData(0, that.data.nowData).then(function (result) {
                // '50:F1:4A:50:5A:08',"50:F1:4A:50:31:BC" 我的7C:01:0A:6B:05:EA 常玉峰测试的不要连"50:F1:4A:50:54:45" 老协议的34:15:13:D2:D9:6A
                that.createBLEConnection('3743B8DD-BCF7-282E-D223-5DC6FA46AA9E');
                console.log('需要连接的deviceId', devicesRort[0].deviceId)
                // that.createBLEConnection(devicesRort[0].deviceId);
              });
            } else {
              that.closeTest(404)
            }
            //是否有已连接设备  
            wx.getConnectedBluetoothDevices({
              success: function (res) {
                console.log(JSON.stringify(res.devices));
                if (res.deviceId) {
                  that.setData({
                    connectedDeviceId: res.deviceId
                  })
                }
              },
              fail: function (res) {
                that.setErr();
                console.log("没有蓝牙连接上", res);
              }
            })
          }
        },
        fail: function (err) {
          app.showModal('提示', '当前服务器繁忙，请稍后再试')
          console.log("没有发现设备")
        }
      })
      that.setAction('可连接到RunnerT', 30)
    }
  },
  // 连接设备
  createBLEConnection: function (connectedDeviceId) {
    var that = this;
    if (that.data.isCheck) {
      var stepMoveNow = {
        stepMoveId: 1,
        stepImg: '../pic/icon4.png',
        stepP: '正在连接跑步机',
        stepBtn: '停止检测',
        stepText: '',
      };
      that.setData({
        stepMove: stepMoveNow,
      })
      wx.createBLEConnection({
        deviceId: connectedDeviceId,
        success: function (res) {
          console.log('蓝牙连接成功：', res.errMsg);
          stepMoveNow.stepP = '跑步机连接成功'
          that.setData({
            connectedDeviceId: connectedDeviceId,
            stepMove: stepMoveNow,
            nowData: 30
          })
          that.addData(20, that.data.nowData).then(function (result) {
            console.log("自动连接到的最强设备：", that.data.connectedDeviceId)
            // 停止收索设备
            that.stopBluetoothDevicesDiscovery();
            that.getBLEDeviceServices();
          });
        },
        fail: function (err) {
          wx.hideLoading();
          that.closeTest(0)
          console.log("连接蓝牙失败:", err);
        }

      })
      that.setAction('可连接', 40)
      console.log("连接的设备号：", that.data.connectedDeviceId);
    }
  },
  // 断开连接
  closeBLEConnection: function (connectedDeviceId) {
    var that = this;
    console.log('来执行蓝牙关闭呀', connectedDeviceId)
    that.setData({
      animationData:{}
    })
    //是否有已连接设备  
    if(connectedDeviceId){
      wx.getConnectedBluetoothDevices({
        success: function (res) {
          console.log('是否有已连接的设备',res.devices);
          
          if (res.devices.length>0) {
            console.log('是否有已连接的设备aaaaa',res.devices[0]);
            wx.closeBLEConnection({
              deviceId: res.devices[0].deviceId,
              success: function (res) {
                console.log('已断开蓝牙', res)
                wx.closeBluetoothAdapter()
                that.setData({
                  finish:true
                })
              },
              fail: function () {
                console.log('断开蓝牙失败')
                that.setErr()
                clearInterval(that.data.timer);
              }
            })
          }else{
            console.log('没有要连接的蓝牙设备')
          }
        },
        fail: function (res) {
          that.setErr();
          console.log("没有蓝牙连接上", res);
        }
      })
    }
    
  },
  // 检测蓝牙变化
  connectionStateChange: function () {
    wx.onBLEConnectionStateChange(function (res) {
      // 该方法回调中可以用于处理连接意外断开等异常情况
      console.log(res.deviceId, res.connected)
      console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
    })
  },
  //停止搜索周边设备  
  stopBluetoothDevicesDiscovery: function () {
    var that = this;
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log("已停止搜索：", res)
      },
      fail: function (err) {
        that.closeTest(0)
        console.log("停止搜索失败！", err)
      }
    })
  },
  // 获取连接设备的所有service服务  
  getBLEDeviceServices: function () {
    var that = this;
    console.log('获取service服务', that.data.connectedDeviceId)
    if (that.data.isCheck) {
      wx.getBLEDeviceServices({
        deviceId: that.data.connectedDeviceId,
        success: function (res) {
          console.log('获取设备的服务列表:', JSON.stringify(res.services));
          that.setData({
            services: res.services,
          })
          that.getBLEDeviceCharacteristicsProtocol();

        },
        fail: function (err) {
          that.closeTest(0)
          console.log("搜索service服务失败！", err)
        }
      })
    }
  },
  getBLEDeviceCharacteristicsProtocol: function () {
    var that = this;
    console.log('getBLEDeviceCharacteristicsProtocol')
    if (that.data.isCheck) {
      wx.getBLEDeviceCharacteristics({
        deviceId: that.data.connectedDeviceId,
        serviceId: that.data.services[0].uuid,
        success: function (res) {
          console.log('获取特征值成功Protocol：', JSON.stringify(res.characteristics))
          that.readBLECharacteristicValue('00002A24-0000-1000-8000-00805F9B34FB');
        },
        fail: function () {
          that.closeTest(0)
          console.log("获取特征值失败Protocol");
        }
      })
    }
  },
  readBLECharacteristicValue: function (characteristicId) {
    var that = this;
    console.log('读取判断新协议')
    if (that.data.isCheck) {
      // 00002A24-0000-1000-8000-00805F9B34FB
      wx.readBLECharacteristicValue({
        deviceId: that.data.connectedDeviceId,
        serviceId: "0000180A-0000-1000-8000-00805F9B34FB",
        characteristicId: characteristicId,
        success: function (res) {
          console.log('读取成功(查找新协议):', res)
          that.onBLECharacteristicValueChange();
        },
        fail: function (err) {
          that.closeTest(0)
          console.log("读取失败：", err)
        }
      })
    }
  },
  onBLECharacteristicValueChange: function () {
    var that = this;
    console.log('读取新协议值')
    if (that.data.isCheck) {
      wx.onBLECharacteristicValueChange(function (res) {
        console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`)
        let hex = Array.prototype.map.call(new Uint8Array(res.value), x => ('00' + x.toString(16)).slice(-2)).join('');
        var protocolName = that.hexCharCodeToStr(hex);
        console.log(hex, protocolName)
        if (protocolName.indexOf('3.') > -1) {
          that.setData({
            protocol: '2.0'
          })
        } else {
          that.setData({
            protocol: '1.0'
          })
        }
        that.getCommand();
        console.log(protocolName, that.data.protocol)
      })
    }
  },
  // 全角字符转半角
  ToCDB: function (str) {
    var tmp = "";
    for (var i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 65248 && str.charCodeAt(i) < 65375) {
        tmp += String.fromCharCode(str.charCodeAt(i) - 65248);
      }
      else {
        tmp += String.fromCharCode(str.charCodeAt(i));
      }
    }
    return tmp
  },
  // 获取蓝牙指令
  getCommand: function () {
    var that = this, code = { operation: 'all', protocol: that.data.protocol };
    if (that.data.isCheck) {
      console.log('getCommand:', that.data.wxpro_token)
      that.request('wxpro/command', 'get', code, that.data.wxpro_token, function (res) {
        console.log({
          '加密后的跑步机命令': res.data.data.encrypted,
          'key666666666666666': that.data.decrypt_key,
        })
        // 解密并保存跑步机命令
        var commandString = Dec.Decrypt(res.data.data.encrypted, that.data.decrypt_key, "gfitwxmp20180524")
        console.log(commandString)
        var patt = /\[[^\]]+\]/g;
        var commandArrString = commandString.match(patt);
        console.log(commandArrString)
        var commandJson = JSON.parse(commandArrString);
        console.log({
          '加密后的跑步机命令': res.data.data.encrypted,
          'key': that.data.decrypt_key,
          '新跑步机命令': commandJson
        })
        console.log('新的跑步机命令', commandString)
        that.setData({
          commends: commandJson
        })
        console.log('获取到的蓝牙命令1：', that.data.commends)
        var commendId = that.getTestCommand(that.setSerialNumber(that.data.setSerialNumber), that.data.commendsOld);
        that.setData({
          commendId: commendId
        })
        console.log('测试需要的命令:', that.data.commendId)
        that.getBLEDeviceCharacteristics();
      })
    }
  },
  //获取连接设备的所有特征值
  getBLEDeviceCharacteristics: function (e) {
    var that = this;
    var characteristicsArr1 = [], notifyCharacteristicsId = [], writeCharacteristicsId = [], readCharacteristicsId = [];
    if (that.data.isCheck) {
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
          console.log("readCharacteristicsId:", that.data.readCharacteristicsId)
          console.log("writeCharacteristicsId:", that.data.writeCharacteristicsId)
          console.log("notifyCharacteristicsId:", that.data.notifyCharacteristicsId)
          // 10s内在55写入0x88
          var writeCharacteristicsIdCnnnect = that.getUUid(that.data.writeCharacteristicsId, "E54EAA55")
          var readCharacteristicsIdCnnnect = that.getUUid(that.data.readCharacteristicsId, "E54EAA55")
          var writeCharacteristicsIdCheck = that.getUUid(that.data.writeCharacteristicsId, "E54EAA57")
          var readCharacteristicsIdCheck = that.getUUid(that.data.readCharacteristicsId, "E54EAA56")
          console.log('readCharacteristicsIdCheck', readCharacteristicsIdCheck)
          that.setData({
            writeCharacteristicsIdCheck: writeCharacteristicsIdCheck,
            readCharacteristicsIdCheck: readCharacteristicsIdCheck
          })
          console.log({
            'readCharacteristicsIdCheck': that.data.readCharacteristicsIdCheck,
            'writeCharacteristicsIdCheck': that.data.writeCharacteristicsIdCheck
          })
          that.writeData('88', writeCharacteristicsIdCnnnect, readCharacteristicsIdCnnnect)
          that.InitStatus()
        },
        fail: function () {
          that.closeTest(0)
          console.log("获取特征值失败");
        }
      })
    }
  },
  InitStatus: function () {
    var that = this;
    if (that.data.isCheck) {
      var p = new Promise(function (resovle, reject) {
        that.writeData(that.data.commendId.commendIdstatus, that.data.writeCharacteristicsIdCheck, that.data.readCharacteristicsIdCheck, function () {
          console.log('检查跑步机的状态!!!', that.data.getParseStatus.data)
          var stepMoveNow = {};
          if (that.data.getParseStatus.data) {
            console.log('跑步机初始化状态', that.data.getParseStatus.data)
            if (that.data.getParseStatus.data.D2 == 10 || that.data.getParseStatus.data.D0 == 10) {
              // 休眠
              console.log('我是休眠状态')
              that.closeBLEConnection(that.data.connectedDeviceId);
              clearInterval(that.data.timer);
              stepMoveNow = {
                stepMoveId: 3,
                stepImg: '../pic/status-sleep.png',
                stepP: '跑步机已休眠',
                stepText: '跑步机已休眠，请先激活跑步机再重新检测',
              };
              that.setData({
                stepId: 30,
                stepMove: stepMoveNow
              })

            } else if (that.data.getParseStatus.data.D2 == 4 || that.data.getParseStatus.data.D0 == 4) {
              // 运行中
              that.closeBLEConnection(that.data.connectedDeviceId);
              clearInterval(that.data.timer);
              console.log('我是运行状态')
              stepMoveNow = {
                stepMoveId: 3,
                stepImg: '../pic/status-run.png',
                stepP: '跑步机正在运行',
                stepText: '跑步机正在运行中，请先停止跑步机再重新检测 ',
              };
              that.setData({
                stepId: 30,
                stepMove: stepMoveNow
              })

            } else if (that.data.getParseStatus.data.D2 == 65 || that.data.getParseStatus.data.D0 == 65) {
              // 暂停
              console.log('我是暂停状态')
              that.closeBLEConnection(that.data.connectedDeviceId);
              clearInterval(that.data.timer);
              stepMoveNow = {
                stepMoveId: 3,
                stepImg: '../pic/status-stop.png',
                stepP: '跑步机已暂停',
                stepText: '跑步机已暂停，请按停止键重置跑步机 ',
              };
              that.setData({
                stepId: 30,
                stepMove: stepMoveNow
              })

            } else if (that.data.getParseStatus.data.D2 == 1 || that.data.getParseStatus.data.D0 == 1) {
              // 安全锁脱落
              console.log('我是安全锁脱落状态')
              that.closeBLEConnection(that.data.connectedDeviceId);
              clearInterval(that.data.timer);
              stepMoveNow = {
                stepMoveId: 3,
                stepImg: '../pic/status-keyed.png',
                stepP: '跑步机安全锁脱落',
                stepText: '请将安全锁复位后重新检测\n安全锁分为磁性的和插片式，一端有线绳链接一个夹子',
              };
              that.setData({
                stepId: 30,
                stepMove: stepMoveNow
              })

            } else if (that.data.getParseStatus.data.D2 == 7 || that.data.getParseStatus.data.D0 == 7) {
              // 错误
              console.log('我是错误状态')
              that.closeBLEConnection(that.data.connectedDeviceId);
              clearInterval(that.data.timer);
              stepMoveNow = {
                stepMoveId: 3,
                stepImg: '../pic/status-error.png',
                stepP: '跑步机出错',
                stepText: '咨询跑步机售后\n或者根据跑步机说明书查找出错原因\n你也可以尝试重启跑步机消除错误代码',
              };
              that.setData({
                stepId: 30,
                stepMove: stepMoveNow
              })
            } else {
              // 可写
              that.startFn()
                .then(that.pauseFn)
                .then(that.startMFn)
                .then(that.SpeedFn)
                .then(that.stopFn)
              that.setAction('成功', 100)
              resovle(that.data.nowStatus);
            }
          }
        })
      })
      return p
    }
  },
  startFn: function () {
    var that = this;
    var p = new Promise(function (resovle, reject) {
      console.log('执行开启1')
      // if (that.data.nowStatus == '') {
      // 开启 速度50,坡度1  that.data.commendId.commendIdstart
      console.log(that.data.commendId.commendIdstart)
      var stepMoveNow = {
        stepMoveId: 1,
        stepImg: '../pic/icon4.png',
        stepP: '跑步机启动中',
        stepBtn: '停止检测',
        stepText: '',
      };
      that.setData({
        stepMove: stepMoveNow,
      })
      that.writeData(that.data.commendId.commendIdstart, that.data.writeCharacteristicsIdCheck, that.data.readCharacteristicsIdCheck);
      that.getStatus(that.data.commendId.commendIdstatus, that.data.writeCharacteristicsIdCheck, that.data.readCharacteristicsIdCheck, function () {
        console.log('获取getParseStatus内容', that.data.getParseStatus.data)
        if (that.data.getParseStatus.data) {
          if (that.data.getParseStatus.data.D3 == 10 || that.data.getParseStatus.data.D10 == 10) {
            stepMoveNow.stepP = '跑步机启动成功'
            // nowData: 40
            that.setData({
              stepMove: stepMoveNow,
            })
            that.addData(30, 40)
            console.log('当前数据nowData', that.data.nowData)
            console.log('达到目标速度', that.data.timer)
            clearInterval(that.data.timer);
            console.log('加速', that.data.nowStatus)
            resovle(that.data.nowStatus);
          }
        }

      });

      // }

    })
    return p
  },
  pauseFn: function () {
    var that = this;
    var p = new Promise(function (resovle, reject) {
      console.log('执行暂停')
      // if (that.data.nowStatus == 'start') {
      console.log('开始暂停跑步机')
      var stepMoveNow = {
        stepMoveId: 1,
        stepImg: '../pic/icon4.png',
        stepP: '跑步机暂停中',
        stepBtn: '停止检测',
        stepText: '',
      };
      that.setData({
        stepMove: stepMoveNow,
      })
      that.writeData(that.data.commendId.commendIdpause, that.data.writeCharacteristicsIdCheck, that.data.readCharacteristicsIdCheck);
      that.getStatus(that.data.commendId.commendIdstatus, that.data.writeCharacteristicsIdCheck, that.data.readCharacteristicsIdCheck, function () {
        console.log(that.data.getParseStatus, '暂停按钮')
        if (that.data.getParseStatus.data.D2 == 65 || that.data.getParseStatus.data.D0 == 65) {
          stepMoveNow.stepP = '跑步机暂停成功'
          that.setData({
            stepMove: stepMoveNow,
          })
          that.addData(40, 60)
          clearInterval(that.data.timer);
          console.log('我是暂停', that.data.nowStatus)
          resovle(that.data.nowStatus);
        }
      });
      // }

    })
    return p
  },
  startMFn: function () {
    var that = this;
    var p = new Promise(function (resovle, reject) {
      // if (that.data.nowStatus == 'pause') {
      console.log('加速跑步机前的预热')
      var stepMoveNow = {
        stepMoveId: 1,
        stepImg: '../pic/icon4.png',
        stepP: '继续运动中',
        stepBtn: '停止检测',
        stepText: '',
      };
      that.setData({
        stepMove: stepMoveNow,
      })
      // 25fc5737437c2cc9e3dc33aa12488423
      that.writeData(that.data.commendId.commendIdstart, that.data.writeCharacteristicsIdCheck, that.data.readCharacteristicsIdCheck);
      that.getStatus(that.data.commendId.commendIdstatus, that.data.writeCharacteristicsIdCheck, that.data.readCharacteristicsIdCheck, function () {
        console.log(that.data.getParseStatus)
        console.log('老协议开启命令')
        if (that.data.getParseStatus.data.D3 == 10 || that.data.getParseStatus.data.D10 == 10) {
          clearInterval(that.data.timer);
          console.log('加速前的预热', that.data.nowStatus)
          resovle(that.data.nowStatus);
        }
      });
      // }
    })
    return p
  },
  SpeedFn: function () {
    var that = this;
    var p = new Promise(function (resovle, reject) {
      // if (that.data.nowStatus == 'startM') {
      console.log('加速跑步机')
      // 25fc5737437c2cc9e3dc33aa12488423
      that.writeData(that.data.commendId.commendIdspeed, that.data.writeCharacteristicsIdCheck, that.data.readCharacteristicsIdCheck);
      that.getStatus(that.data.commendId.commendIdstatus, that.data.writeCharacteristicsIdCheck, that.data.readCharacteristicsIdCheck, function () {
        console.log(that.data.getParseStatus)
        if (that.data.getParseStatus.data.D3 == 50 || that.data.getParseStatus.data.D10 == 50) {
          var stepMoveNow = {
            stepMoveId: 1,
            stepImg: '../pic/icon4.png',
            stepP: '继续运动成功',
            stepBtn: '停止检测',
            stepText: '',
          };
          that.setData({
            stepMove: stepMoveNow,
            nowData: 80
          })
          that.addData(60, 80)
          clearInterval(that.data.timer);
          console.log('我是加速', that.data.nowStatus)
          resovle(that.data.nowStatus);
        }

      });
      // }
    })
    return p
  },
  stopFn: function () {
    var that = this;
    var p = new Promise(function (resovle, reject) {
      // if (that.data.nowStatus == 'speed') {
      console.log('停止跑步机')
      var stepMoveNow = {
        stepMoveId: 1,
        stepImg: '../pic/icon4.png',
        stepP: '跑步机停止中',
        stepBtn: '停止检测',
        stepText: '',
      };
      that.setData({
        stepMove: stepMoveNow,
      })
      // 25fc5737437c2cc9e3dc33aa12488423
      that.writeData(that.data.commendId.commendIdstop, that.data.writeCharacteristicsIdCheck, that.data.readCharacteristicsIdCheck);
      that.getStatus(that.data.commendId.commendIdstatus, that.data.writeCharacteristicsIdCheck, that.data.readCharacteristicsIdCheck, function () {
        console.log(that.data.getParseStatus)
        if (that.data.getParseStatus.data.D2 == 8 || that.data.getParseStatus.data.D0 == 8 || that.data.getParseStatus.data.D0 == 0) {
          stepMoveNow.stepP = '跑步机停止成功';
          that.setData({
            stepMove: stepMoveNow,
          })
          that.addData(80, 100)
          clearInterval(that.data.timer);
          console.log('哈哈停止了', that.data.nowStatus)
          resovle(that.data.nowStatus);
        }

      });
      // }
    })
    return p
  },
  // 获取需要使用的几个命令
  getTestCommand: function (serialNumber, commendsOld) {
    var that = this;
    var commendId = {};
    var key = '', commendIdcenter = '';
    for (var i = 0; i < that.data.commends.length; i++) {
      key = 'commendId' + that.data.commends[i].name;
      commendIdcenter = that.getHexString(that.data.commends[i], serialNumber, commendsOld)
      if (that.data.protocol == '2.0') {
        console.log('我是新协议', that.data.protocol)
        commendId[key] = Dec.Encrypt(commendIdcenter, "CHITUYUNDONG2017")
      } else {
        console.log('我是老协议', that.data.protocol)
        commendId[key] = commendIdcenter
      }
      console.log({
        'key值': key,
        'commendIdcenter中间组合值': commendIdcenter
      })
    }
    console.log('最终值', commendId)
    return commendId;
  },
  //查询跑步机连接状态300ms发送一次请求
  getStatus: function (commendIdstatus, writeCharacteristicsIdCheck, readCharacteristicsIdCheck, fnback) {
    var that = this;
    console.log('控制跑步机环节')
    if (that.data.isCheck) {
      clearInterval(that.data.timer);
      that.data.timer = setInterval(function () {
        that.writeData(commendIdstatus, writeCharacteristicsIdCheck, readCharacteristicsIdCheck)
        if (typeof fnback == "function") {
          fnback()
        };
      }, 1000)
    }
  },
  // 写入并读取data
  writeData: function (orderValue, writeCharacteristicsId, readCharacteristicsId, fnback) {
    console.log('开始写入', orderValue)
    var that = this;
    if (that.data.isCheck) {
      var p = new Promise(function (resovle, reject) {
        var notifyCharacteristicsId = that.getUUid(that.data.notifyCharacteristicsId, "E54EAA56")
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
                  protocol: that.data.protocol,
                  data: hex,
                  timestamp: timestamp
                }
                that.request('wxpro/parse', 'post', code, that.data.wxpro_token, function (res) {
                  console.log('我是只有一次查询的结果：', res)
                  that.setData({
                    getParseStatus: res.data.data
                  })
                  console.log('设置不成功？', that.data.getParseStatus)
                  if (that.data.getParseStatus) {
                    resovle(that.data.getParseStatus);
                    if (typeof fnback == "function") {
                      fnback()
                    }
                  }
                })
              }
              that.setData({
                getRunnerTData: hex
              })
              console.log("跑步机返回的数据：", that.data.getRunnerTData)
            })

            // B开始写入消息，注意只有特征值中write未true的才能写入
            // ArrayBuffer分配字节空间byteNum比如0x88分配一个字节，020006分配3个字节
            var byteNum = orderValue.length / 2;
            var buf = new ArrayBuffer(byteNum)
            console.log(buf.byteLength, byteNum)
            // 分配字节成功
            if (buf.byteLength === byteNum) {
              var dataView = new DataView(buf)//对buf按照缩影进行排序
              var i = 0;
              for (; i < byteNum; i++) {
                var high = orderValue.substr(i * 2, 1);
                var low = orderValue.substr(i * 2 + 1, 1);
                var num = parseInt(high + '' + low, 16);
                dataView.setUint8(i, num);
              }
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
                  that.closeTest(0)
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
                  that.closeTest(0)
                  console.log("读取失败：", err)
                }
              })
            } else {
              console.log('分配字节长度' + buf.byteLength + '过长失败');
              that.closeTest(0)
            }
          },
          fail: function (res) {
            that.closeTest(0)
            console.log('开启notify通知失败：', res);
          }

        })
      })
      return p
    }
  },
  // 数据增长
  addData: function (lowData, highData, fnback) {
    var that = this;
    var p = new Promise(function (resovle, reject) {
      var addTimer = setInterval(function () {
        lowData++;
        that.setData({
          nowData: lowData
        })
        console.log(lowData)
        if (lowData == highData) {
          that.setData({
            nowData: lowData
          })
          console.log('如果' + lowData + '=' + highData, that.data.nowData)
          clearInterval(addTimer)
          if (that.data.nowData == 100) {
            // 测试完成
            that.setData({
              nowStatus: ''
            })
            console.log('当前连接的connectedDeviceId', that.data.connectedDeviceId)
            that.closeBLEConnection(that.data.connectedDeviceId);
            that.connectionStateChange();
            // if(that.data.finish){
            console.log('跳转页面')
            that.toInstallGfit()
            // }

            // wx.showModal({
            //   title: '提示',
            //   showCancel: false,
            //   content: '哇，跑步机没任何问题！',
            //   success: function (res) {
            //     if (res.confirm) {
            //       that.setData({
            //         nowStatus: ''
            //       })
            //       console.log('当前连接的connectedDeviceId', that.data.connectedDeviceId)
            //       that.closeBLEConnection(that.data.connectedDeviceId);
            //       that.connectionStateChange();
            //       // that.createBLEConnection(devicesRort[0].deviceId);
            //     }
            //   }
            // })
          }
          resovle(that.data.nowData);
          if (typeof fnback == "function") {
            fnback()
          }
        }
      }, 60)
    })
    return p
  },
  // 16进制转文字字符串
  hexCharCodeToStr: function (hexCharCodeStr) {
    var trimedStr = hexCharCodeStr.trim();
    　　var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
    　　var len = rawStr.length;
    　　if (len % 2 !== 0) {
      　　　　alert("Illegal Format ASCII Code!");
      　　　　return "";
    　　}
    　　var curCharCode;
    　　var resultStr = [];
    　　for (var i = 0; i < len; i = i + 2) {
      　　　　curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
      　　　　resultStr.push(String.fromCharCode(curCharCode));
    　　}
    　　return resultStr.join("");
  },
  // json值转化16进制并合并 新协议
  getHexString: function (json, setSerialNumber, commendsOld) {
    var that = this
    var B5 = 0, B6 = 0;
    if (that.data.protocol == '2.0') {
      // 2.0协议
      console.log('新协议', that.data.protocol)
      if (json.length < 1) {
        return that.sethex(json.instruction) + that.sethex(json.length) + that.sethex(setSerialNumber)
      } else {
        if (json.name == 'start') {
          console.log('长度大于0且是开启命令')
          // 开启：速度50(0.1km/h),坡度1
          return that.sethex(json.instruction) + that.sethex(json.length) + that.sethex(json.control) + that.sethex(10) + that.sethex(1) + that.sethex(setSerialNumber)
        } else if (json.name == 'speed') {
          // 加速 速度加到100 坡度为2
          return that.sethex(json.instruction) + that.sethex(json.length) + that.sethex(json.control) + that.sethex(50) + that.sethex(3) + that.sethex(setSerialNumber)
        } else {
          console.log('长度大于0且不是开启命令')
          return that.sethex(json.instruction) + that.sethex(json.length) + that.sethex(json.control) + that.sethex(setSerialNumber)
        }
      }
    } else {
      console.log('老协议', that.data.protocol)
      if (json.name == 'start') {
        console.log('长度大于0且是开启命令')
        // 开启：速度10(0.1km/h),坡度1
        commendsOld.B1 = 10;
        commendsOld.B2 = 2;
      } else if (json.name == 'speed') {
        commendsOld.B1 = 50;
        commendsOld.B2 = 0;
      } else {
        console.log('长度大于0且不是开启命令')
        commendsOld.B1 = 0;
        commendsOld.B2 = 0;
      }
      B5 = ((json.instruction * 1 + commendsOld.B1 * 1) ^ commendsOld.B2 * 1 + commendsOld.B3 * 1) + 37
      B6 = (json.instruction * 1 ^ commendsOld.B1 * 1) + commendsOld.B2 * 1 + commendsOld.B3 * 1 + 2
      console.log(B5, B6)
      var commendsHexOld = that.sethex(json.instruction) + that.sethex(commendsOld.B1 * 1) + that.sethex(commendsOld.B2 * 1) + that.sethex(commendsOld.B3 * 1) + that.sethex(commendsOld.B4 * 1) + that.sethex(B5) + that.sethex(B6)
      return commendsHexOld.toUpperCase();
    }

  },
  // 十进制转16进制
  sethex: function (num) {
    var hexNum = num.toString(16) + ''
    var hexNumLen = hexNum.length / 2
    if (parseInt(hexNumLen) == hexNumLen) {
      return hexNum
    } else {
      return '0' + hexNum
    }
  },
  // 蓝牙出错-提示-首页
  setErr: function () {
    var that = this;
    app.showModal('提示', '当前服务器繁忙，请稍后再试')
    that.closeBLEConnection(that.data.connectedDeviceId);
    clearInterval(that.data.timer);
    that.setData({
      stepId: 10,
      isCheck: false
    })
  },
  // stepId: 10终止程序-首页,stepId: 0连接中没有通过检测-没通过检测(结果页),404没搜索到跑步机-没搜索到跑步机(结果页)
  closeTest: function (stepId) {
    var that = this;
    var stepMove = {
      stepMoveId: 0,
      stepImg: '../pic/icon2.png',
      stepP: '正在搜索跑步机',
      stepBtn: '停止搜索',
      stepText: '搜索到跑步机',
    };
    console.log('当前stepId', stepId)
    that.closeBLEConnection(that.data.connectedDeviceId);
    clearInterval(that.data.timer);
    that.setData({
      stepId: stepId,
      isCheck: false,
      stepMove: stepMove
    });
    try {
      wx.clearStorageSync()
    } catch (e) {
      // Do something when catch error
    }
  },
  closeTest2: function (event) {
    var that = this;
    console.log('当前event', event)
    that.closeBLEConnection(that.data.connectedDeviceId);
    clearInterval(that.data.timer);
    that.setData({
      stepId: event.target.dataset.index,
      isCheck: false
    })
    try {
      wx.clearStorageSync()
    } catch (e) {
      // Do something when catch error
    }
  },
  setAction: function (action, actionResult) {
    var that = this
    var timestamp = that.getTimestamp();
    // 获取action-id
    var actionData = {
      action: action,
      timestamp: timestamp,
      result: actionResult
    }
    that.request('wxpro/record/action', 'post', actionData, that.data.wxpro_token, function (res) {
      that.setData({
        action_id: res.data.data.action_id
      })
    });
  },
  // 记序列号0-255循环
  setSerialNumber: function (num) {
    var that = this;
    num++;
    if (num > 255) {
      num = 0;
    }
    console.log('num++后的值', num)
    that.setData({
      setSerialNumber: num
    })
    return num;
  },
  // 去除空格
  trim: function (str) {
    return str.replace(/^\s+|\s+$/gm, '')
  },
  // 接口封装
  request: function (path, method, data, wxproToken, doSuccess) {
    var that = this;
    wx.request({
      url: 'https://wxpro.gfitgo.com/dev/gfit-app-inf/' + path,
      data: data,
      method: method,
      header: {
        'content-type': 'application/json',
        'wxpro_token': wxproToken
      },
      success: function (res) {
        console.log(path + '后台返回值:', res)
        if (wxproToken) {
          console.log("wxproToken不为空就要判断登录是否过期：", wxproToken)
          if (res.statusCode == '200') {
            if (res.data.resultCode == '400400') {
              console.log('登录令牌过期', res.data.resultCode)
              // 登录令牌过期
              wx.request({
                url: 'https://wxpro.gfitgo.com/dev/gfit-app-inf/wxpro/refresh_token',
                data: that.data.refresh_token,
                method: 'get',
                header: {
                  'content-type': 'application/json',
                },
                success: function (res) {
                  //刷新令牌过期
                  if (res.data.resultCode == '400401') {
                    console.log('刷新令牌过期', res.data.resultCode)
                    that.getLogin();
                  } else {
                    that.setData({
                      wxpro_token: res.data.data.wxpro_token,
                    })
                  }
                },
                fail: function (err) {
                  console.log('wxpro/refresh_token：', err)
                }
              })
            }
          } else {
            app.showModal('提示', '当前服务器繁忙，请稍后再试')
            that.closeBLEConnection(that.data.connectedDeviceId);
            clearInterval(that.data.timer);
          }
        }
        if (typeof doSuccess == "function") {
          doSuccess(res)
        }
      },
      fail: function (err) {
        app.showModal('提示', '当前服务器繁忙，请稍后再试')
        clearInterval(that.data.timer);
      },
    })
  },
  // 蓝牙操作流水步骤记录
  getBleJournal: function (recordBleJson, instruction, err) {
    var that = this, timestamp = that.getTimestamp();
    recordBleJson.action_id = that.data.action_id;
    recordBleJson.journal.push({ instruction: instruction, timestamp: timestamp, err: err })
    console.log('流水记录', recordBleJson)
  },
  // get timestamp
  getTimestamp: function () {
    var timestamp = Math.round(new Date().getTime() / 1000);
    return timestamp;
  },
  // 查找runner蓝牙设备并按照RSSI排序
  sortRSSI: function (arr, sortAttr) {
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
  // 查找数组中（可写列表）含有指定的（57）特征值的uuid
  getUUid: function (arr, target) {
    for (var i = 0, len = arr.length; i < len; i++) {
      if (arr[i].indexOf(target) > -1) {
        return arr[i];
      }
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
