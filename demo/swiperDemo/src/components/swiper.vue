
<!-- home.vue -->
<template>
    <div class="swiperRow">
      <div class="list-title">
        <h1>美食诱惑</h1>
      </div>
      <swiper :options="swiperOption" ref="mySwiper">
        <swiper-slide v-for="item in swiperSlides">
          <a :href="item.url" target="_blank"><img :src=item.imageURL /></a>
          <!-- <img :src="{{item.imageURL}}"> -->
        </swiper-slide>
      </swiper>
    </div>
</template>
<style type="text/css">
	.swiperRow{width: 100%;height: 100%;}
	.list-title{padding:30px 40px}
	.list-title h1{font-size: 0.6rem;text-align: left;}
	.swiper-container{width: 100%;height: 32%;}
	@media screen and (min-width:375px) {
	    .swiper-slide img{width: 100%;border-radius: 10%;}
	}
	@media screen and (min-width:1024px) {
	    .swiper-slide img{width: 50%;border-radius: 10%;}
	}
</style>

<script>
import { swiper, swiperSlide } from 'vue-awesome-swiper'
export default {
  name: 'swiper-row',
  data () {
    return {
        swiperOption: { 
          notNextTick: true,
          autoplay: 5000,
          freeMode : true,
          slidesPerView: 2.5,
          spaceBetween: 20,
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
        },
        swiperSlides: [
          {
            "title":"商品名称",
            "imageURL":require("../assets/imgs/swiper1.png"),
            "url":"https://www.baidu.com/"
          },
          {
            "title":"2",
            "imageURL":require("../assets/imgs/swiper2.png"),
            "url":"https://www.baidu.com/"
          },
          {
            "title":"3",
            "imageURL":require("../assets/imgs/swiper3.png"),
            "url":"https://www.baidu.com/"
          },
          {
            "title":"4",
            "imageURL":require("../assets/imgs/swiper1.png"),
            "url":"https://www.baidu.com/"
          },
          {
            "title":"5",
            "imageURL":require("../assets/imgs/swiper3.png"),
            "url":"https://www.baidu.com/"
          },
          {
            "title":"6",
            "imageURL":require("../assets/imgs/swiper2.png"),
            "url":"https://www.baidu.com/"
          },
          {
            "title":"7",
            "imageURL":require("../assets/imgs/swiper1.png"),
            "url":"https://www.baidu.com/"
          },
          {
            "title":"8",
            "imageURL":require("../assets/imgs/swiper2.png"),
            "url":"https://www.baidu.com/"
          }
        ]
    }
  },
  components: {
    swiper,
    swiperSlide
  },
  methods:{
    eClick(){
        console.log(9999);
    }
  }
}
</script>
