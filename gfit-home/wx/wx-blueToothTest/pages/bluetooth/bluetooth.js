//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  // 蓝牙适配：
  startConnect: function(){
    var that = this;
    wx.showLoading({
      title: '开启蓝牙适配'
    });
    // 1,初始化蓝牙适配器
    wx.openBluetoothAdapter({
      success: function(res) {
        console.log("初始化蓝牙适配器");
        console.log(res);
        //如果成功，则获取其状态
        that.getBluetoothAdapterState();
      },
      fail: function(err){
        console.log(err);
        wx.showToast({
          title: '蓝牙初始化失败',
          icon: "success",
          duration: 2000
        })
        setTimeout(function(){
          wx.hideToast()
        },2000)
      }
    });
    // 监听蓝牙适配器状态变化
    wx.onBluetoothAdapterStateChange(function(res){
      var available = res.available;
      if(available){//如果可用，则获取其状态   
        that.getBluetoothAdapterState();
      }
      
    })
  },
  // 2，检查蓝牙是适配器是否可用
  getBluetoothAdapterState: function(){
    var that = this;
    wx.getBluetoothAdapterState({
      success: function(res) {
        var available = res.available,
          discovering = res.discovering;
        if(!available){//蓝牙未开启
          wx.showToast({
            title: '设备无法开启蓝牙连接',
            icon: "success",
            duration: 2000
          })
          setTimeout(function(){
            wx.hideToast()
          },2000)
        }else{
          if (!discovering) {//程序还未搜索设备
            // 开始扫描附近蓝牙
            that.startBluetoothDevicesDiscovery();
            // 获取本机已配对（处于已连接状态）的蓝牙设备
            that.getConnectedBluetoothDevices();
          }
        }
      },
    })
  },
  startBluetoothDevicesDiscovery: function(){
    var that = this;
    wx.showLoading({
      title:"蓝牙搜索ing"
    });
    // 搜索附近蓝牙(费资源)
    wx.startBluetoothDevicesDiscovery({
      services: [],
      allowDuplicatesKey: false,
      success: function(res) {
        if(!res.isDiscovering){//未发现
          that.getBluetoothAdapterState();
        } else {//开启发现附近蓝牙设备事件监听
          that.onBluetoothDeviceFound();
        }
      },
      fail:function(err){
        console.log(err);
      }
    })
  },
  getConnectedBluetoothDevices: function(){
    var that = this;
    wx.getConnectedBluetoothDevices({
      services: [that.serviceId],
      success: function(res) {
        console.log("获取处于连接状态的设备",res);
        var devices = res["devices"], flag = false, index = 0, conDevList = [];
        devices.forEach(function(val,index,array){
          if (val['name'].indexOf('zlili5') != -1 ){//搜索到目标设备
            flag = true;
            index +=1;
            conDevList.push(val['deviceId']);
            that.deviceId = val['deviceId'];
            return;
          }
        });
        if(flag){
          this.connectDeviceIndex = 0;
          that.loopConnect(conDevList);
        }else{
          if(!this.getConnectedTimer){
            that.getConnectedTimer = setTimeout(function(){
              that.getConnectedBluetoothDevices();
            },5000);
          }
        }
      },
      fail: function(err){
        if(!this.getConnectedTimer){
          that.getConnectedTimer = setTimeout(function () {
            that.getConnectedBluetoothDevices();
          }, 5000);
        }
      }
    })
  },
  // 开启发现附近蓝牙设备事件监听
  onBluetoothDeviceFound: function(){
    var that = this;
    console.log('onBluetoothDeviceFound');
    wx.onBluetoothDeviceFound(function(res){
      console.log('new device list has founded：' + res);
      if (res.devices[0]){
        var name = res.devices[0]['name'];
        if (name != ''){//过滤设备
          if (name.indexOf('zlili5') != -1){
            var deviceId = res.devices[0]['deviceId'];
            that.deviceId = deviceId;
            console.log(that.deviceId);
            // 发现想配对的设备
            that.startConnectDevices();
          }
        }
      }
    })
  }, 
  startConnectDevices: function(){
    var that = this;
    clearTimeout(that.getConnectedTimer);
    that.getConnectedTimer = null;
    clearTimeout(that.discoveryDevicesTimer);
    that.stopBluetoothDevicesDiscovery();
    this.isConnectting = true;
    wx.createBLEConnection({
      deviceId: that.deviceId,
      success: function(res) {
        if (res.errCode == 0){
          setTimeout(function(){
            that.getService(that.deviceId);
          },5000)
        }
      },
      fail: function(err){
        console.log('连接失败：',err);
        if (ltype == 'loop'){
          that.connectDeviceIndex += 1;
          that.loopConnect(array);
        } else {
          that.startBluetoothDevicesDiscovery();
          that.getConnectedBluetoothDevices();
        }
      },
      complete:function(){
        console.log('complete connect devices');
        this.isConnectting = false;
      }
    })
  },
  onLoad: function () {
    // startConnect();
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
