Vue.filter('toFix',function(value){
	var num = parseFloat(value)
    return num.toFixed(2)
})

var userToken = userToken || '';
console.log('userToken',userToken)
// line:'https://gotochitu.com/gfit-app-inf/app/',
// line小程序专用:'https://gotochitu.com/gfit-app-inf/web/',
// test:https://test.gfitgo.com/gfit-app-inf/app/
var vm = new Vue({
  	el: '#app',
  	data:{
	    isBody: true,
	    more: false,
	    moreFinish: false,
	    reFresh: false,
	    reFreshFinish:false,
	    isclick: true,
	    overDom:false,
	    isErr:false,
	    isDev:false,
	    wx:false,
	    finishOffset: 0,
	    runnerAll:0,
	    imgWidth:0,
	    imgHeight:0,
	    timesInit:0,
	    currentTab: 0,
	    runnerTimer: '',
	    user_id:'',
	    mescroll: null,
	    nowuserToken:'',
	    loadmoreText:'加载更多',
	    playgroundUserP: '当前跑步人数',
	    ossBucket:'',
	    nav: ['跑步中', '已完成'],
	    playground: '../pic/index/playground.png',
	    nobody: '../pic/index/nobody.png',
	    urlAvator: 'this.src="../src/img/runTogether/urlAvator.png"',
	    baseUrl:'https://gotochitu.com/gfit-app-inf/web/',
	    userList: [],
	    userListShow:[],
	    userListFinish: []
	},
	methods:{
		DPR:function(){
			if (window.devicePixelRatio && window.devicePixelRatio > 1) {
				return window.devicePixelRatio;
			}
			return 1;
		},
		// 已完成的下拉加载更多
		loadmore:function(){
		    var that = this;
		    that.moreFinish = true;
		    that.loadmoreText = '加载中...';
		    console.log({
		      '触发': '触发下拉加载更多！',
		      'more': that.moreFinish,
		    })
		    that.getFinishRunnerInit();
		},
		// 获取ios传来的user_id
		getUserid:function(){
			var that = this
			console.log(window.location.href)
			that.$http.get(window.location.href).then(function (res) {
    			console.log(res.headers)
    			var a=JSON.stringify(res.headers)
    			that.testdata = a
    			alert(a)
    			console.log(res.headers.map['content-type'][0])
    			if(res.headers.map['user_id']){
    				that.user_id = res.headers.map['user_id'][0]
    			}
    			
		    })
		},
		// 正在跑初始化
		getRunTogetherInit: function () {
			var that = this; 
			var client = that.getImgFromOss();
			if (that.reFresh){
		      that.userList = [];
		  	}
			if(that.currentTab == 0){
				if(that.$refs.playgroundTrack){
					var myCanvas = that.$refs.myCanvas;
					var ctx = myCanvas.getContext('2d');	
					scaleBy = that.DPR();
					var canvasWidth=that.$refs.playgroundTrack.offsetWidth;
					var canvasHeight=that.$refs.playgroundTrack.offsetHeight;
					myCanvas.width=canvasWidth*1.02*scaleBy;
					myCanvas.height=canvasHeight*1.02*scaleBy;
					that.imgWidth = canvasWidth*1.02*scaleBy;
					that.imgHeight = canvasHeight*1.02*scaleBy;
					ctx.scale(scaleBy, scaleBy);
					console.log(canvasWidth,canvasHeight)
				}
			}		
			console.log('userToken2',userToken)
	    	that.$http.get(that.baseUrl+'run_together/doing_no_pagination').then(function (res) {
	    		console.log(res.data)
		      if (res.data.data) {
		        var userListnow = {}, userAvatarnow = [], data = {};
		          that.runnerAll = res.data.data.length
		        var len = res.data.data.length
		        if (res.data.data.length > 30) {
		          len = 30; 
		        }
		        for (var i = 0; i < len; i++) {
		          userListnow = {
		            nickname: res.data.data[i].nickname,
		            distance: (res.data.data[i].distance / 1000).toFixed(2),
		            duration: that.secsToTime(res.data.data[i].duration),
		            speed: (res.data.data[i].speed / 1000).toFixed(1),
		            praise_count: res.data.data[i].praise_count,
		            img: client.signatureUrl("profile_img/"+res.data.data[i].user_id+"/preview"),
		            user_id: res.data.data[i].user_id,
		            run_journal_id: res.data.data[i].run_journal_id,
		            run_start_time: res.data.data[i].run_start_time,
		            position_x: res.data.data[i].position_x,
		            position_y: res.data.data[i].position_y,
		            isclick: false,
		            is_praise: res.data.data[i].is_praise
		          }
		          that.userList.push(userListnow);
		        }
		        that.playgroundUserP = '当前跑步人数'
		        if (that.reFresh){
		          //下拉刷新
		          that.canvasRunner(ctx, that. userList,0)
		          that.reFresh = false;
		        }else{
		          that.getRunning(ctx);
		        }
		      } else {
		      	that.playgroundUserP = '当前没人跑步';
		      	that.isBody = false
		      }
		    })
		},
		// 虚拟运动：每1s的变动
		getRunning: function (ctx) {
			var that = this;
			var len = that.userList.length;
			var timeRunner = 0;
			var timeH = (1 / 3600);
			clearInterval(that.runnerTimer)
			for (var i = 0; i < len; i++) {
				(function (index) {
				    that.runnerTimer = setInterval(function () {
				      // 时间的走动
				      if (that.userList.length > 0) {
				        if (that.userList[index]){
				        var nowTime = that.chronoTimer(that.userList[index].duration, index);
				        that.canvasRunner(ctx, that.userList)
				        }
				      }
				      timeRunner++;
				    }, 1000)
				})(i)
			}
		},
		// canvas跑步
		canvasRunner: function (ctx, dataList) {
		    var that = this;
		    // canvas上画人
		    var resultPosition = [];
		    var timeH = (1 / 3600);
		    ctx.clearRect(0,0,that.imgWidth,that.imgHeight);
		    for (var i = 0; i < dataList.length; i++) {
		    	var dis = (dataList[i].distance * 1 + timeH * dataList[i].speed) * 1000;
		      	resultPosition[i] = that.runTogetherUtils(dis, dataList[i].position_x, dataList[i].position_y, dataList[i].user_id)
		    	if (resultPosition.length>0){
					if (dataList[i].isclick) {
						that.moveImage( resultPosition[i].x, resultPosition[i].y, dataList[i].user_id,i)
					} else {
					  that.drawCircle(ctx, resultPosition[i].x, resultPosition[i].y, dataList[i].user_id);
					}
				} 
		    }
		},
		// 画圆
		drawCircle: function (ctx, x, y, userId) {
		    var that = this;
		    ctx.save();
		    ctx.beginPath();
		    ctx.fillStyle = '#A6FFFF';
		    ctx.arc(x/scaleBy, y/scaleBy, 2, 0, 2 * Math.PI);
		    ctx.fill();
		    ctx.restore();
		    ctx.closePath();
		},
		moveImage:function(x, y, userId,i){
			var that = this;
			that.$refs.trackImg[i].style.display = 'block'
			that.$refs.trackImg[i].style.top = y*1/scaleBy-20 + 'px'
			that.$refs.trackImg[i].style.left = x*1/scaleBy-20 + 'px'
		},
		// 废除
		drawImageOrg: function (ctx, x, y, userId,img,localImage) {
		    var that = this;
		    ctx.save();
		    ctx.beginPath();
		    ctx.strokeStyle = '#A6FFFF';
		    ctx.lineWidth = 3;
		    ctx.arc(x, y, 20, 0, 2 * Math.PI);
		    ctx.stroke();
		    ctx.clip();
		    ctx.drawImage(img, x - 20, y - 20, 40, 40);
	   		ctx.restore();
		},
		// 一起跑点赞
		getParise: function (event) {
			var that = this,indexTarget = '';
			if(event.target.className.indexOf('itemRight')<0){
				// 点击图片
				indexTarget = event.target.parentNode.getAttribute('id');
			}else{
				indexTarget = event.target.getAttribute('id');
			}
			that.userList[indexTarget].isclick = true;
			that.userList[indexTarget].praise_count++;
			that.userList[indexTarget].is_praise = 1;
			// praise 特效
			// if(that.userList[indexTarget].is_praise = 1){
			// 	that.$refs.praise[indexTarget].classList.add("heartAnimation");
			// 	that.$refs.praise[indexTarget].classList.add("activePraise");
			// }
			// setTimeout(function () {
			//   that.$refs.praise[indexTarget].classList.remove("heartAnimation");
			// }, 800)
			
			// 10s后头像消失
			setTimeout(function () {
			  that.userList[indexTarget].isclick = false;
			  that.$refs.trackImg[indexTarget].style.display = 'none'
			}, 10000)
			var data = {
			  'module': 1,
			  'target_id': event.currentTarget.dataset.runjournalid,
			  'target_user_id': event.currentTarget.dataset.userid,
			  'run_start_time': event.currentTarget.dataset.runstarttime,
			  'user_id':that.user_id
			}
			
			that.$http.post(that.baseUrl+'run_together/insert',data,{emulateJAON:true}).then(function (res) {
			})
		},
		// 正在跑 记录模块流水
		getModule: function (e) {
			var that = this;
			var data = {
			  'module': 2,
			  'target_id': e.currentTarget.dataset.runJournalid,
			  'target_user_id': e.currentTarget.dataset.userid,
			  'run_start_time': e.currentTarget.dataset.runstarttime,
			  'user_id':that.user_id
			}
			that.$http.post(that.baseUrl+'run_together/insert',data,{emulateJAON:true}).then(function (res) {
			})
		},
		// 已完成
		getFinishRunnerInit: function () {
			var that = this;
			var client = that.getImgFromOss();
			if (that.reFreshFinish){
		      that.userListFinish = [];
		      that.finishOffset = 0;
		      that.reFreshFinish = false;
		    }
			var timestamp = that.getTimestamp();
			var userListFinishnow = {}, userListFinish = [];
			var finishData = {
			  timestamp: timestamp,
			  offset: that.finishOffset,
			  pageSize: 10
			};
			that.$http.get(that.baseUrl+'run_together/finish',{
				params:finishData
			}).then(function (res) {
			  var len = res.data.data.length;      
			  for (var i = 0; i < len; i++) {
			    userListFinishnow = {
			      nickname: res.data.data[i].nickname,
			      plan_name: res.data.data[i].plan_name,
			      distance: (res.data.data[i].distance / 1000).toFixed(2),
			      duration: that.secsToTime(res.data.data[i].duration),
			      endToNowTime: that.timeToBefore(res.data.data[i].end_start_time),
			      user_addr: res.data.data[i].user_addr,
			      user_id: res.data.data[i].user_id,
			      is_praise: res.data.data[i].is_praise,
			      plan_type: res.data.data[i].plan_type,
			      order: res.data.data[i].order + 1,
			      praise_count: res.data.data[i].praise_count,
			      img: client.signatureUrl("profile_img/"+res.data.data[i].user_id+"/preview"),
			      record_id: res.data.data[i].record_id,
			      run_start_time: res.data.data[i].run_start_time,
			    }
			    userListFinish.push(userListFinishnow);
			  }
			  // 如果是下拉加载更多
			  if (that.moreFinish) {
			    that.userListFinish.push.apply(that.userListFinish, userListFinish);
			    that.loadmoreText = '加载更多';
			    console.log('加载后的',that.userListFinish)
			  } else {
			    that.userListFinish = userListFinish
			  }
			  that.$nextTick(function(){
			  	that.refreshFinishMore();
			  	that.moreFinish = false;
		  		})
			})
			that.finishOffset = that.finishOffset + finishData.pageSize;
			console.log('偏移量666', that.finishOffset)
		},
		// 已完成点赞
		getPariseFinish: function (e) {
			var that = this,indexTarget = '';
			console.log(e.target.className)
			if(e.target.className.indexOf('itemRight')<0){
				// 点击图片
				indexTarget = e.target.parentNode.getAttribute('id');
			}else{
				indexTarget = e.target.getAttribute('id');
			}
			that.userListFinish[indexTarget].praise_count++;
			that.userListFinish[indexTarget].is_praise = 1;
			var data = {
			  'module': 1,
			  'target_id': e.currentTarget.dataset.recordid,
			  'target_user_id': e.currentTarget.dataset.userid,
			  'run_start_time': e.currentTarget.dataset.runstarttime,
			  'user_id':that.user_id
			}
			that.$http.post(that.baseUrl+'run_together/insert',data,{emulateJAON:true}).then(function (res) {
			  
			})	
		},
		// 已完成 记录模块流水
		getModuleFinish: function (e) {
			var that = this;
			console.log('已完成记录模块',e.currentTarget.dataset)
			var data = {
			  'module': 2,
			  'target_id': e.currentTarget.dataset.recordid,
			  'target_user_id': e.currentTarget.dataset.userid,
			  'run_start_time': e.currentTarget.dataset.runstarttime,
			  'user_id':that.user_id
			}
			that.$http.post(that.baseUrl+'run_together/insert',data,{emulateJAON:true}).then(function (res) {
			})
		},
		// distance=初始distance+time*速度，rand初始坐标
		runTogetherUtils: function (distance, randX, randY, userId) {
		    var that = this;
		    var length = 100.0, d = 20, r = length / Math.PI, MAX_X = 2 * r + 2 * d + length, MAX_Y = 2 * r + 2 * d;
		    // var width = that.imgWidth/1.02, height = that.imgHeight/1.02;
		    var width = that.imgWidth/1.02, height = that.imgHeight/1.02;
		    var dis = (distance + randX) % 400, x = 0, y = 0, d2 = d * randY / 100, r2 = r + d2;
		    if (0 <= dis && dis <= 100) {
		      //0-100 左半圆逆时针
		      x = dis;
		      y = -d2;
		    } else if (100 < dis && dis < 200) {
		      //100-200 
		      var alpha = that.degreesToRadians((dis - 100) * 180 / length);
		      x = (Math.sin(alpha) * r2 + length)*1.01;
		      y = (r - Math.cos(alpha) * r2)/1.02;
		    } else if (200 <= dis && dis < 300) {
		      //200-300
		      x = 300 - dis;
		      y = (2 * r + d2)/1.02;
		    } else if (300 <= dis && dis <= 400) {
		      //300-400
		      var alpha = that.degreesToRadians((dis - 300) * 180 / length);
		      x = -(Math.sin(alpha) * r2)/1.05;
		      y = (r + Math.cos(alpha) * r2)/1.02;
		    } else {
		      //error
		      // app.showModal('提示', '服务器加载失败，请稍后重试！')
		      console.log(distance + ':',distance)
		    }
		    var getPosition = that.setPosition(x, y, d, r, width, height, MAX_X, MAX_Y);
		    return getPosition;
		},
		// 转化成实际坐标
		setPosition: function (x, y, d, r, width, height, MAX_X, MAX_Y) {
		    //1,把起点坐标 从(0,0)移到(d+r,d) 保证图片右下角为坐标零点,y-2保证运动圆点在红色操场上
		    var actualPosition = {
		      x: x + d + r,
		      y: y + d
		    }
		    //2,坐标镜像，起点从跑道左上角改到左下角
		    actualPosition.y = MAX_Y - actualPosition.y;
		    //3,基于图片长宽，给出图片中坐标
		    actualPosition.x = actualPosition.x * (width / MAX_X)
		    actualPosition.y = actualPosition.y * (height / MAX_Y)
		    return actualPosition
		},
		// angle 角
		// degress 角度
		// radians 弧度
		degreesToRadians: function (degrees) {
		    return Math.PI * degrees / 180.0;
		},
		// 定时器时间
		chronoTimer: function (timeBox, index) {
			var that = this;
			// 00:40:32
			var timeArr = timeBox.split(':'),
			  h = parseInt(timeArr[0]),
			  m = parseInt(timeArr[1]),
			  s = parseInt(timeArr[2]);
			s++;
			if (s > 59) {
			  m++; s = 0;
			}
			if (m > 59) {
			  h++; m = 0;
			}
			if (h > 99) {
			  m = 0; h = 0; s = 0
			}
			var newTime = that.toDouble(h) + ":" + that.toDouble(m) + ":" + that.toDouble(s);
			timeBox = newTime;
			// 时间
			that.userList[index].duration = timeBox;
			var time = (1 / 3600);
			var userLisNow = [];
			// 路程
			var dis = (that.userList[index].distance * 1 + time * that.userList[index].speed * 1)
			that.userList[index].distance = dis
			return newTime;
		},
		// 秒转化为00：02：40
		secsToTime: function (secs) {
			var that = this;
			var h = Math.floor(secs / 3600),
			  m = Math.floor((secs / 60) % 60),
			  s = Math.floor(secs % 60);
			return that.toDouble(h) + ":" + that.toDouble(m) + ":" + that.toDouble(s);
		},
		// 00:40:32转化为秒-小时
		timeToSecs: function (time) {
			var that = this;
			// 00:40:32
			var timeArr = time.split(':'),
			  h = parseInt(timeArr[0]),
			  m = parseInt(timeArr[1]),
			  s = parseInt(timeArr[2]);
			var hs = h * 1 + (m / 60).toFixed(2) * 1 + (s / 3600).toFixed(2) * 1;
			return hs;
		},
		toDouble: function (num) {
			return num > 9 ? num : "0" + num;
		},
		// 1529372045(秒)转化为几小时前
		timeToBefore: function (dateTimeStamp) {
			// 课程完成时间戳（s转为ms）
			var dateTimeStampMs = dateTimeStamp * 1000;
			var dateTime = new Date(dateTimeStampMs);
			var m = dateTime.getMonth() + 1;
			var d = dateTime.getDate();
			var minute = 1000 * 60;
			var hour = minute * 60;
			// 现在的时间戳
			var nowTime = new Date().getTime();
			//今天凌晨的时间戳
			var todaySmall = new Date(new Date().setHours(0, 0, 0, 0));
			var todaySmallStr = Date.parse(todaySmall.toDateString());
			var milliseconds = 0;
			var timesStr;
			// 与凌晨对比
			var dateInterval = dateTimeStampMs - todaySmallStr;
			// 与现在对比
			var timeInterval = nowTime - dateTimeStampMs;
			var hours = timeInterval / hour;
			var mins = timeInterval / minute;
			// 与未来相比
			if (dateInterval >= 0 && timeInterval >= 0){
			  if(hours >= 1 && hours <= 23) {
			    return timesStr = parseInt(hours) + "小时前"
			  } else if (mins <= 59) {
			    return timesStr = parseInt(mins) + "分钟前"
			  }
			} else{
			  return timesStr = m + '月' + d + '日';
			}
		},
		// 获取时间戳
		getTimestamp: function () {
		   var timestamp = Math.round(new Date().getTime() / 1000);
		   return timestamp;
		},
		// tab切换
		swichNav:function(index){
			var that = this;
			that.currentTab = index;
			// if (that.currentTab == 1) {
				
		 //    }
		},
		// 一起跑加载更多
		refreshMore:function(){
			var that = this;
			var tabContentScroll = that.$refs.tabContentScroll
			var scroll = new window.BScroll(tabContentScroll, {
			    probeType: 1,
			    click: true
			});
			scroll.on('scroll', function (position) {
			    if(position.y > 50) {
			    	that.reFresh = true;
			    	that.more = false;
			    }else if(position.y < (this.maxScrollY - 50)) {
			    	that.more = true;
			    }
			});
			// 一起跑刷新
			scroll.on('touchEnd', function (position) {
				console.log(position,this.maxScrollY)
			    if (position.y > 50) {
			    console.log('你正在下拉刷新')
			    that.reFresh = true;
			    that.more = false;
			   	that.getRunTogetherInit();
			    }else if(position.y < (this.maxScrollY - 50)) {
			    	that.more = true;
			    	console.log('你正在上拉加载更多')
			    }
			});
		},
		// 已完成加载更多
		refreshFinishMore:function(){
			var that = this;
			if(that.scroll1){
				that.scroll1.refresh()
			}else{
				that.scroll1 = new BScroll(that.$refs.tabContentScroll1, {
				    probeType: 1,
				    click: true
				});
			}
			that.scroll1.on('scroll', function (position) {
			    if(position.y > 50) {
			    	that.reFreshFinish = true;
			    }else if(position.y < (this.maxScrollY - 50)) {
			    	// that.moreFinish = true;
			    }
			});
			// 已完成页面刷新
			that.scroll1.on('touchEnd', function (position) {
			    if (position.y > 50) {
			    	console.log('你正在下拉刷新')
			    	that.reFreshFinish = true;
			    	that.moreFinish = false;
			    	that.getFinishRunnerInit();
			    	// && !that.moreFinish
			    }else if(position.y < (this.maxScrollY - 50) && !that.moreFinish) {
			    	that.moreFinish = true;
			    	console.log('你正在上拉加载更多')
			    	that.getFinishRunnerInit();
			    }
			});
		},
		getImgFromOss:function(){
			var that = this;
			// gfit-test gfit-app
			var client = new OSS({
			    region: "oss-cn-hangzhou",
			    accessKeyId:  "WMD6uv73gL0qNAyL",
			    accessKeySecret:  "QQ2aiWUNixcOnueKnxKdk0hDOJhJU6",
			    bucket: that.ossBucket
			  });
			return client;
		},
		isDevFn:function(){
			var that = this
			var URLId=window.location.hash[1];
			console.log('当前url参数',window.location.hash)
			if(window.location.href.indexOf("g.gfitgo")<0){
				// 开发
				that.isDev = true;
				that.baseUrl = 'https://test.gfitgo.com/gfit-app-inf/app/';
				that.ossBucket = 'gfit-test';
			}else{
				that.ossBucket = 'gfit-app';
				//生产
				if(URLId == 'w'){
					that.wx = true;
					//微信小程序专用接口，无需TOKEN
					that.baseUrl = 'https://gotochitu.com/gfit-app-inf/web/';
				}else{
					//其他
					that.baseUrl = 'https://gotochitu.com/gfit-app-inf/app/';
				}
			}
			if(URLId == 1){
				// ios->index.html#1->已完成页面
				that.currentTab = URLId;
			}
		},
		pagesInit:function(){
			var that = this;
			that.isDevFn();
			console.log('现在是什么环境',that.isDev)
			if(!that.isDev && !that.wx){
				// 生产环境
				var timerInit = setInterval(function(){
					that.timesInit++;
					console.log('启动次数',that.timesInit)
					if(userToken){
						console.log('userToken存在',userToken)
						clearInterval(timerInit)
						that.nowuserToken = userToken
						Vue.http.headers.common['X-TOKEN']=userToken
						// 一起跑初始化
						that.getRunTogetherInit();
						// 已完成初始化
						that.getFinishRunnerInit();
						console.log('加载后的2',that.userListFinish)
						that.refreshMore();
					}
					if(that.timesInit >= 8){
						// 3s
						console.log('网络超时，请稍后重试')
						clearInterval(timerInit)
						that.isErr = true;
					}
				},500)
			}else{
				// 测试环境，小程序环境都不需要登录验证
				Vue.http.headers.common['X-TOKEN']=userToken
				// 一起跑初始化
				that.getRunTogetherInit();
				// 已完成初始化
				that.getFinishRunnerInit();
				console.log('加载后的2',that.userListFinish)
				that.refreshMore();
			}
		},
		test:function(){
			var that = this
			setTimeout(function () {
			  userToken='364229e31304454ba524771fae0e8715981aadda';
			  console.log('我来了',userToken)
			}, 2000)
		}
	},
	// 挂载后
	mounted:function(){
		var that = this;
		that.pagesInit();
		// that.test();
		
		// 算法测试start
		// var myCanvas = that.$refs.myCanvas;
		// var ctx = myCanvas.getContext('2d');
		// that.drawCircle(ctx, 50, 50, 0)
		// for(var i=0;i<400;i=i+4){
		// 	var a = that.runTogetherUtils(0, i, 100, 0)
		// 	console.log(a)
		// 	that.drawCircle(ctx, a.x, a.y, 0)
		// }	
		// 算法测试over
		
	},
	updated:function(){
		var that = this;
		// that.canvasScale();
		// that.getRunTogetherInit();
	}
})