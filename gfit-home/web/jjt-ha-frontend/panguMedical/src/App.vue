<template>
  	<div id="content" class="routerview">
			<transition name="fade" mode="out-in">
				<router-view></router-view>
			</transition>
		</div>
</template>

<script>

export default {
  name: 'app',
  data () {
    return {
      
    }
  },
  components:{
  	
  }
  ,
  created (){
  	//当app.vue创建完成以后，自动加载Home.vue模块
		// window.location='/#/Home';
  }
}
</script>

<style>
  @import '../statics/css/muihead.css';
body{
	background-color:white;
}
.mint-tab-item-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 5px
}
.routerview{
	/* margin-top: 45px; */
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .2s
}
.fade-enter, .fade-leave-active {
  opacity: 0
}

</style>
