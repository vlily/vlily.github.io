<template>
	<div>
		<ul class="mui-table-view mui-grid-view mui-grid-9">
			<li class="mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-3">
				<router-link to="/orderCure">
					<span class="mui-icon mui-icon-home"></span>
					<div class="mui-media-body">预约治疗</div>
				</router-link>
			</li>
			<li class="mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-3">
				<router-link to="/recordCure">
					<span class="mui-icon mui-icon-email">
					</span>
					<div class="mui-media-body">治疗记录</div>
				</router-link>
			</li>
			<li class="mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-3">
				<router-link to="/inviteFriends">
					<span class="mui-icon mui-icon-chatbubble"></span>
					<div class="mui-media-body">邀请好友</div>
				</router-link>
			</li>
			<li class="mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-3">
				<router-link to="/cityPartner">
					<span class="mui-icon mui-icon-location"></span>
					<div class="mui-media-body">城市合伙人</div>
				</router-link>
			</li>
			<li class="mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-3">
				<router-link to="/messageBoard">
					<span class="mui-icon mui-icon-search"></span>
					<div class="mui-media-body">医养留言板</div>
				</router-link>
			</li>
		</ul>
	</div>
</template>
<script>
	import {Swipe,SwipeItem} from 'mint-ui';
	export default {
		data() {
				return {
				}
			},
			created() {
				//	 	this.$http.get('http://172.16.0.205:9090/api/getlunbo')
				////	 	this.$http.get('http://czdm.ittun.com/api/getlunbo')
				//	 	.then((res)=>{
				//	 		this.list = res.body;
				//	 	});
			},
			components: {
				Swipe,
				SwipeItem
			}
	}
</script>

<style scoped>
	.my-swipe {
		height: 250px;
		color: #fff;
		font-size: 30px;
		text-align: center;
	}
	.slide1 a,
	.slide1 img {
		display: block;
		width: 100%;
		height: 250px;
	}
	
	.mint-swipe-indicator {
		opacity: 1;
		background: rgba(239, 239, 239, 0.8);
	}
	
	.mint-swipe-indicator.is-active {
		opacity: 1;
		background: rgba(250, 250, 10, 0.8)
	}
	
	.mui-icon {
		width: 50px;
		height: 50px;
	}
	
	.mui-icon-home {
		background-image: url(../../../statics/images/menu3.png);
		background-repeat: round;
	}
	
	.mui-icon-email {
		background-image: url(../../../statics/images/menu4.png);
		background-repeat: round;
	}
	
	.mui-icon-chatbubble {
		background-image: url(../../../statics/images/menu5.png);
		background-repeat: round;
	}
	
	.mui-icon-location {
		background-image: url(../../../statics/images/menu6.png);
		background-repeat: round;
	}
	
	.mui-icon-search {
		background-image: url(../../../statics/images/menu9.png);
		background-repeat: round;
	}
	
	.mui-icon-phone {
		background-image: url(../../../statics/images/menu10.png);
		background-repeat: round;
	}
	
	.mui-icon-home:before,
	.mui-icon-email:before,
	.mui-icon-chatbubble:before,
	.mui-icon-location:before,
	.mui-icon-search:before,
	.mui-icon-phone:before {
		content: '';
	}
	
	.mui-grid-view.mui-grid-9 {
		background-color: white;
	}
	
	.mui-grid-view.mui-grid-9 .mui-table-view-cell {
		border: none;
	}
</style>