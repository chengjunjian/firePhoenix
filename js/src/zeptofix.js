$(document).ready(function(){
	//CSS切换效果 增加ac CLASS，并增加 data-ac属性
	var ac = $('.ac'),timer=null;
	ac.live(touchstart,function(){
		var css = $(this).data('ac'),self=this;
		if(!css || css=='')return;
		if(css)$(this).addClass(css);
		timer = setTimeout(function(){
			$(self).removeClass(css);
		},600);
	}).live(touchend,function(){
		var css = $(this).data('ac');
		if(css)$(this).removeClass(css);		
		if(timer)clearTimeout(timer);
	});
	
	//input获得焦点时自动全选
	$('.autoSelect').live('focus',function(){
		E.log('input自动选择');
		var me = this;
		setTimeout(function(){
			me.select();
		},0);
	});

});