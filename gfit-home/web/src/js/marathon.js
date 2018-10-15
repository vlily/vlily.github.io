$(function(){
	if(window.location.href.indexOf('marathon.html') > -1 && !localStorage.getItem('inputName')){
		window.location.href = "./index.html";
		return;
	}
	var chinReg = /^[\u4e00-\u9fa5]+$/;
	$('.input-name').on('input propertychange',function(){
		if(chinReg.test($(this).val())){//汉字6，英语8
			console.log('汉字')
			$(this).attr('maxlength',6)
		}else{
			$(this).attr('maxlength',8)
		}
	})
	$('body').css({'height':$(window).height()})
	$('.input-name').on('focus',function(){
		$(this).attr('placeholder','')
	})
	$('.toMatathon-btn').click(function(){
		var inputName = $('.input-name').val();
		if(!inputName){
			// alert('请输入姓名!')
			$('.input-name').attr('placeholder','请输入姓名！')
			$('.input-name').addClass('input-err')
		}else{
			$('.input-name').removeClass('input-err')
			$(this).html("海报生成中...")
			//保存到本地localStorage
			localStorage.setItem('inputName',inputName);
			window.location.href = "./marathon.html";
		}
	})
	if(window.location.href.indexOf('marathon.html')>-1 && localStorage.getItem('inputName')){
		var customText = [
			'自己报的马，含着泪也要跑完',
			'不要怂，就是跑',
			'不管怎样，一生总要跑完一次',
			'过去是一个人跑，现在是和一群人跑',
			'报名费100块，新鞋800块，我的首马无价',
			'还有42公里，我先发个朋友圈',
			'我跑过最长的路，就是你的套路',
			'跑过风景，跑过你',
			'我，潜在跑马人口',
			'我老了，只能跑跑马拉松了',
			'越跑，越自由',
			'跑跑马拉松，二胎更轻松',
			'人生那么长，马拉松那么短，着什么急',
			'时刻保持微笑，因为我是花钱来跑的',
			'跑的了马，买的起房',
			'因为马拉松，吃到了最正宗的兰州拉面',
			'每一步，都向前',
			'迈出的每一步，只为离目标更近',
			'马场得意，人生得意'
		]
		var placeName = [
			{'title':'国际会展中心','name':'bg-center'},
			{'title':'甘肃农业大学','name':'bg-gans'},
			{'title':'兰州体育公园','name':'bg-lanz'},
			{'title':'南河滨中路','name':'bg-nanbcenter'},
			{'title':'南滨河东路','name':'bg-nanbeast'},
			{'title':'七里河黄河大桥','name':'bg-qili'},
			{'title':'小西湖立交桥','name':'bg-xihu'},
			{'title':'雁滩黄河大桥','name':'bg-yant'},
			{'title':'银滩黄河大桥','name':'bg-yint'},
			{'title':'中山铁桥','name':'bg-zhongs'},
		]
		console.log('海报页！')
		var bodyWidth = document.body.clientWidth;
		var bodyHeight = document.body.clientHeight;
		var customName=localStorage.getItem('inputName');
		var customTextI = Math.floor(Math.random()*19);
		var placeNameI = Math.floor(Math.random()*9);
		$('title').html('我是'+customName+'，我在兰州跑马')
		console.log(customTextI,placeNameI)
		console.log(customName)
		var c=document.getElementById('capture');
		var ctx=c.getContext('2d');
		var canvasWidth=bodyWidth;
		var canvasHeight=bodyHeight;
		var scaleBy = DPR();
			c.width=canvasWidth*scaleBy;
			c.height=canvasHeight*scaleBy;
    		c.style.width = canvasWidth+'px';
    		c.style.height = canvasHeight+'px';
    		ctx.scale(scaleBy, scaleBy);
		var oImg = new Image();
		var imgSrcBg = '../../src/img/marathon/'+placeName[placeNameI].name+'.jpg';
		// 画背景图
		oImg.src = imgSrcBg;
		oImg.onload = function(){
			ctx.drawImage(this,0,0,canvasWidth,canvasHeight); 
			ctx.fillStyle = '#fff';  
			ctx.font="500 9px 微软雅黑";  
			ctx.fillText('2018 Lanzhou Marathon',25,40);  
			ctx.font="500 15px 微软雅黑";  
			ctx.fillText('2018兰州马拉松',23,60); 

			ctx.font="500 23px 微软雅黑"; 
			ctx.textAlign='center'; //居中对齐，基准线在fillText中的位置，而fillText又可以用wrapText（自定义）来替代
			ctx.wrapText('“'+customText[customTextI]+'”', canvasWidth/2,200, 310, 34)

			// 画定位icon
			var oImgPo = new Image();
			var imgSrcPo = '../../src/img/marathon/icon-position.png';
			oImgPo.src = imgSrcPo;
			oImgPo.onload = function(){
				ctx.drawImage(this,canvasWidth/2+10,265,15,18); 
				ctx.font="400 15px 微软雅黑";  
				ctx.textAlign='left';//设置地点名字随着定位icon向后扩展，方法以定位icon以基准线左对齐就好
				ctx.fillText(placeName[placeNameI].title,canvasWidth/2+30,280); 
				ctx.font="500 18px PingFangSC-Regular, sans-serif ";  
				ctx.textAlign='left';
				ctx.fillText(customName,canvasWidth/2+30,306); 
				// 画广告图
				var oImgAd = new Image();
				var imgSrcAd = '../../src/img/marathon/ad.png';
				oImgAd.src = imgSrcAd;
				oImgAd.onload = function(){
					ctx.drawImage(this,0,canvasHeight-80,canvasWidth,80); 
					var dataURL = c.toDataURL('image/jpeg'); 
					$('.getImg').html('<img class="getImg" src="'+dataURL+'">')
					// console.log('canvas转dataURL：',dataURL)
					// 清除缓存
					// localStorage.removeItem('inputName');
					// $(document).on("touchstart",function(e){
				 //        if(!$(e.target).hasClass('getImg')){
				 //            e.preventDefault();
				 //        }
				 //    })	
				}
			}	
			
		}
		// 绘制自动换行的字符串maxWidth是最大宽度，lineHeight是行高，这两个可以省略
		CanvasRenderingContext2D.prototype.wrapText = function (text, x, y, maxWidth, lineHeight) {
		    if (typeof text != 'string' || typeof x != 'number' || typeof y != 'number') {
		        return;
		    }
		    var context = this;
		    var canvas = context.canvas;
		    if (typeof maxWidth == 'undefined') {
		        maxWidth = (canvas && canvas.width) || 300;
		    }
		    if (typeof lineHeight == 'undefined') {
		        lineHeight = (canvas && parseInt(window.getComputedStyle(canvas).lineHeight)) || parseInt(window.getComputedStyle(document.body).lineHeight);
		    }
		    // 字符分隔为数组
		    var arrText = text.split('');
		    var line = '';
		    
		    for (var n = 0; n < arrText.length; n++) {
		        var testLine = line + arrText[n];
		        var metrics = context.measureText(testLine);
		        var testWidth = metrics.width;
		        if (testWidth > maxWidth && n > 0) {
		            context.fillText(line, x, y);
		            line = arrText[n];
		            y += lineHeight;
		        } else {
		            line = testLine;
		        }
		    }
		    context.fillText(line, x, y);
		};
	}
	
    $('.handle-btn').on('click',function(){
    	console.log('点击按钮!')
    	var ua = window.navigator.userAgent.toLowerCase();  
	    console.log(ua)
	    if(ua.match(/MicroMessenger/i) == 'micromessenger'){  
	    	console.log('是微信浏览器')
	    	window.location.href = window.location.href+"?id="+10000*Math.random();
	        return true;  
	    }else{ 
	    	window.location.reload() 
	        return false;  
	    }
    	
    })	
    // 如果是微信浏览器
    function isWeiXin(){  
	    var ua = window.navigator.userAgent.toLowerCase();  
	    console.log(ua)
	    if(ua.match(/MicroMessenger/i) == 'micromessenger'){  
	    	console.log('是微信浏览器')
	        return true;  
	    }else{  
	        return false;  
	    }  
	} 
	/**
	 * 根据window.devicePixelRatio获取像素比
	 */
	function DPR() {
	    if (window.devicePixelRatio && window.devicePixelRatio > 1) {
	        return window.devicePixelRatio;
	    }
	    return 1;
	}
	/**
	 *  将传入值转为整数
	 */
	function parseValue(value) {
	    return parseInt(value, 10);
	};
	/**
	 * 绘制canvas
	 */
	// function drawCanvas(selector) {
	//     // 获取想要转换的 DOM 节点
	//     const dom = document.querySelector(selector);
	//     const box = window.getComputedStyle(dom);
	//     // DOM 节点计算后宽高
	//     const width = parseValue(box.width);
	//     const height = parseValue(box.height);
	//     // 获取像素比
	//     const scaleBy = DPR();
	//     // 创建自定义 canvas 元素
	//     const canvas = document.createElement('canvas');

	//     // 设定 canvas 元素属性宽高为 DOM 节点宽高 * 像素比
	//     canvas.width = width * scaleBy;
	//     canvas.height = height * scaleBy;
	//     // 设定 canvas css宽高为 DOM 节点宽高
	//     canvas.style.width = `${width}px`;
	//     canvas.style.height = `${height}px`;
	//     // 获取画笔
	//     const context = canvas.getContext('2d');

	//     // 将所有绘制内容放大像素比倍
	//     context.scale(scaleBy, scaleBy);

	//     // 将自定义 canvas 作为配置项传入，开始绘制
	//     return await html2canvas(dom, {canvas});
	// }
})