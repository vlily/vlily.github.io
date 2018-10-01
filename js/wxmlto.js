$(function(){
	if($(".px-input")){
		$(".px-input").on("input propertychange",function(){
            var num=parseInt($(this).val()*2)+"rpx";
            $(".rpx-input").val(num);
        })
        $(".px-input-rem").on("input propertychange",function(){
            var num=Math.round($(this).val()/50*100)/100+"rem";
            $(".rem-input").val(num);
        })
        $(".rem-input-rpx").on("input propertychange",function(){
            var num=parseInt($(this).val()*100)+"rpx";
            $(".torpx-input").val(num);
        })
        $(".return_page").click(function(){
            history.go(-1);
        })
        changeKey();
	}
	
    function changeKey(){
        $('meta[name="keywords"]').attr("content",$("title").html());
        $('meta[name="description"]').attr("content",$("title").html());
    }
    // wxmlto
    $(".topBtn button").on("click",function(){
        $(this).addClass("active").siblings().removeClass("active")
        $(".change-result").html("");
        $(".change-infor").html("");
    })
    $(".inputText").on("input propertychange focus",function(e){
        var inputValue=$(this).val(); 
        
        if($(".active").attr("id")=="htmlToWxml"){
            console.log("把html转化成WXML")
            inputValue = inputValue.replace(/<div |<p |<table |<tr |<ul |<dl |<h1 |<h2 |<h3 |<h4 |<h5 |<h6 |<nav |<head |<header |<footer |<article |<aside /ig, '<view ')
            inputValue = inputValue.replace(/<div>|<p>|<table>|<tr>|<ul>|<dl>|<h1>|<h2>|<h3>|<h4>|<h5>|<h6>|<nav>|<head>|<header>|<footer>|<article>|<aside>/ig, '<view>')
            inputValue = inputValue.replace(/<\/div>|<\/p>|<\/table>|<\/tr>|<\/ul>|<\/dl>|<\/h1>|<\/h2>|<\/h3>|<\/h4>|<\/h6>|<\/h6>|<\/nav>|<\/head>|<\/header>|<\/footer>|<\/article>|<\/aside>/ig, '</view>')

            inputValue = inputValue.replace(/textarea/ig, 'rich-text')

            inputValue = inputValue.replace(/<span |<th |<td |<li |<dt /ig, '<text ')
            inputValue = inputValue.replace(/<span>|<\/span>|<th>|<td>|<li>|<dt>/ig, '<text>')
            inputValue = inputValue.replace(/<\/span>|<\/th>|<\/td>|<\/li>|<\/dt>/ig, '</text>')

            inputValue = inputValue.replace(/<img /ig, '<image ')
            inputValue = inputValue.replace(/<img>/ig, '<image>')
            inputValue = inputValue.replace(/<\/img>/ig, '</image>')

            inputValue = inputValue.replace(/onclick/ig, 'bindsubmit')
            // 标签里面含有样式rpx
            var reg1=/-?\d+(\.\d+)?px/ig;
            var reg2=/-?\d+px/ig;
            var reg3=/-?\d+(\.\d+)?rem/ig;
            var reg4=/-?\d+rem/ig;
            inputValue=replaceAll(reg1,inputValue,2,"rpx")
            inputValue=replaceAll(reg2,inputValue,2,"rpx")
            inputValue=replaceAll(reg3,inputValue,100,"rpx")
            inputValue=replaceAll(reg4,inputValue,100,"rpx")
            
            $(".change-infor").html("html转化为WXML时，页面中可能含有超链接和swiper轮播图等标签，请手动修改")
        }
        if($(".active").attr("id")=="wxmlToHtml"){
            console.log("把WXML转化成html")
            inputValue = inputValue.replace(/<view |<scroll-view |<cover-view |<swiper |<swiper-item |<checkbox-group |<radio-group /ig, '<div ')
            inputValue = inputValue.replace(/<view>|<scroll-view>|<cover-view>|<swiper>|<swiper-item>|<checkbox-group>|<radio-group>/ig, '<div>')
            inputValue = inputValue.replace(/<\/view>|<\/scroll-view>|<\/cover-view>|<\/swiper>|<\/swiper-item>|<\/checkbox-group>|<\/radio-group>/ig, '</div>')

            inputValue = inputValue.replace(/<text /ig, '<span ')
            inputValue = inputValue.replace(/<text>/ig, '<span>')
            inputValue = inputValue.replace(/<\/text>/ig, '</span>')

            inputValue = inputValue.replace(/<checkbox /ig, '<input type="checkbox" ')
            inputValue = inputValue.replace(/<checkbox>/ig, '<input type="checkbox"> ')
            inputValue = inputValue.replace(/<\/checkbox>/ig, '')
            inputValue = inputValue.replace(/<radio /ig, '<input type="radio" ')
            inputValue = inputValue.replace(/<radio>/ig, '<input type="radio"> ')
            inputValue = inputValue.replace(/<\/radio>/ig, '')

            inputValue = inputValue.replace(/<image |<cover-image /ig, '<img ')
            inputValue = inputValue.replace(/<image>|<cover-image>/ig, '<img>')
            inputValue = inputValue.replace(/<\/image>|<\/cover-image>/ig, '')

            inputValue = inputValue.replace(/bindsubmit/ig, 'onclick')

            inputValue = inputValue.replace(/rich-text/ig, 'textarea')

            // 标签里面含有样式px
            var reg1=/-?\d+(\.\d+)?rpx/ig;
            var reg2=/-?\d+rpx/ig;
            inputValue=replaceAll(reg1,inputValue,0.5,"px")
            inputValue=replaceAll(reg2,inputValue,0.5,"px")
            $(".change-infor").html("WXML转化为html时，页面中可能含有wx-for等类似小程序语法和数据类（{{}}）还有一些无法替换的标签（如icon），请手动修改")
        }
        if($(".active").attr("id")=="wxssToCss"){
            $(".change-infor").html("Wxss转化为css规则是rpx->px")
            var reg1=/-?\d+(\.\d+)?rpx/ig;
            var reg2=/-?\d+rpx/ig;
            inputValue=replaceAll(reg1,inputValue,0.5,"px")
            inputValue=replaceAll(reg2,inputValue,0.5,"px")
        }
        if($(".active").attr("id")=="cssToWxss"){
            $(".change-infor").html("css转化为Wxss规则是px->rpx；rem->rpx")
            var reg1=/-?\d+(\.\d+)?px/ig;
            var reg2=/-?\d+px/ig;
            var reg3=/-?\d+(\.\d+)?rem/ig;
            var reg4=/-?\d+rem/ig;
            inputValue=replaceAll(reg1,inputValue,2,"rpx")
            inputValue=replaceAll(reg2,inputValue,2,"rpx")
            inputValue=replaceAll(reg3,inputValue,100,"rpx")
            inputValue=replaceAll(reg4,inputValue,100,"rpx")
        }
        if($(".active").attr("id")=="pxToRem"){
            $(".change-infor").html("")
            var reg1=/-?\d+(\.\d+)?px/ig;
            var reg2=/-?\d+px/ig;
            inputValue=replaceAll(reg1,inputValue,0.02,"rem")
            inputValue=replaceAll(reg2,inputValue,0.02,"rem")
        }
        $(".change-result").html(inputValue);  
    })
    $(".return_page").click(function(){
        history.go(-1);
    })
    // 按照正则reg把target找出并用replace按照scale（和unit单位）批量替换掉
    function replaceAll(reg,target,scale,unit){
        var result = target.match(reg);
        for(var i in result){
            target = target.replace(result[i],parseFloat(result[i])*scale+unit)
            console.log(result[i],parseFloat(result[i])*scale+unit)
            console.log(target)
        }
        return target; 
    }
})