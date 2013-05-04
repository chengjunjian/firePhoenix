(function(win){

win.touchstart = 'touchstart';
win.touchmove = 'touchmove';
win.touchend = 'touchend';
win.tap = 'tap';
	
var Elf = win.Elf = win.Elf || {
	global: win
};

/**
 * 把props参数指定的属性或方法复制到obj对象上。
 */
Elf.merge = function(obj, props, strict){
	for(var key in props){
		if(!strict || obj.hasOwnProperty(key) || obj[key] !== undefined){
			obj[key] = props[key];
		}
	}
	return obj;
};

/**
 * 根据id获得DOM对象。
 */
Elf.$ = function(id){
	return document.getElementById(id);
};

/**
 * 创建一个指定类型type和属性props的DOM对象。
 */
Elf.createDOM = function(type, props){
	var dom = document.createElement(type);
	for(var p in props) {
		var val = props[p];
		if(p == "style"){
			for(var s in val) dom.style[s] = val[s];
		}else{
			dom[p] = val;
		}
	}
	return dom;
};

/**
 * Constants
 */
Elf.DEG_TO_RAD = Math.PI / 180;
Elf.RAD_TO_DEG = 180 / Math.PI;

/**
 * 根据id获得DOM对象。
 */
Elf.int = function(n){
	return parseInt(n,10);
};

//获取当前设备的信息
Elf.Device = (function() {
	var a = navigator.userAgent.toLowerCase();
	return a.indexOf("iphone") != -1 || a.indexOf("ipod") != -1 ? {
		name: "iphone",
		touch: true,
		standalone:window.navigator.standalone //IOS特有属性，判断是否从桌面进入
	}: a.indexOf("ipad") != -1 ? {
		name: "ipad",
		touch: true,
		standalone:window.navigator.standalone //IOS特有属性，判断是否从桌面进入
	}: a.indexOf("opera mobi") != -1 ? {
		name: "operamobile",
		touch: true,
	}: a.indexOf("android") != -1 ? {
		name: "android",
		touch: true,
	}: a.indexOf("iemobile") != -1 ? {
		name: "iemobile",
		touch: false,
	}: a.indexOf("j2me") != -1 ? {
		name: "j2me",
		touch: false,
	}: a.indexOf("symbian v5") != -1 ? {
		name: "symbian5",
		touch: true,
	}: a.indexOf("symbian v3") != -1 ? {
		name: "symbian3",
		touch: false,
	}: a.indexOf("chrome") != -1 ? {
		name: "chrome",
		touch: false,
	}: a.indexOf("msie") != -1 ? {
		name: "ie",
		touch: false,
	}: a.indexOf("safari") != -1 ? {
		name: "safari",
		touch: false,
	}: a.indexOf("opera") != -1 ? {
		name: "opera",
		touch: false,
	}: a.indexOf("gecko") != -1 ? {
		name: "firefox",
		touch: false,
	}: {
		name: "",
		touch: false,
	}
})();

if(!('ontouchstart' in window)){
	win.touchstart = 'mousedown';
	win.touchmove = 'mousemove';
	win.touchend = 'mouseup';
	win.tap = 'click';
}
	
/**
 * 简单的log方法，同console.log作用相同。
 */
Elf.log = function(){
	window['ELFDEBUG'] && ELFDEBUG==true && console && console.log && console.log(arguments);
};
/**
 * 生成随机数。
 */
win.rand = function(under, over){ 
	switch(arguments.length){ 
		case 1: return parseInt(Math.random()*under+1); 
		case 2: return parseInt(Math.random()*(over-under+1) + under); 
		default: return 0; 
	} 
};
String.prototype.left = function(len) { 
	return this.substring(0,len);
};
String.prototype.right = function(len) { 
	return this.substring(this.length-len,this.length);
};
String.prototype.trim = function(){
    return this.replace(/(^\s*)|(\s*$)/g, "");
};
/*Array.prototype.max = function(){   //最大值
	return Math.max.apply({},this) ;
};
Array.prototype.min = function(){   //最小值
	return Math.min.apply({},this) ;
};*/
Array.prototype.indexOf = function(v){   //查找
	for(var i=0,l=this.length;i<l;i++){
		if(this[i] === v){
			return i;	
		}
	}
	return -1;
};

Elf.tips = {
	timer : null,
	show : function(str,timeout,parent){
		if($('#elf_toast').size()==0){
			if(!parent)parent='body';
			$(parent).append('<style>.toastClass{font-family:"Microsoft YaHei",微软雅黑,"Microsoft JhengHei","黑体";position:absolute; z-index:10000; border:1px solid #fff; left:50%; top:-1000px; margin-top:-50px; background:rgba(0,0,0,0.5); color:#fff; padding:10px;border-radius:8px; font-size:1.2em;}</style><div id="elf_toast" class="toastClass"></div>');
		}
		$('#elf_toast').html(str).css('top','-1000px').show();
		setTimeout(function(){
			$('#elf_toast').css({'top':'50%','margin-left':Elf.int($('#elf_toast').width()*-.5)+'px'});//.css('margin-top',Elf.int($('#elf_toast').height()*-.5)+'px');
		},10);
		
		if(this.timer){
			clearTimeout(this.timer);	
			this.timer = null;
		}
		
		if(timeout && timeout>0){
			var me = this;
			me.timer = setTimeout(function(){
				me.hide();
			},timeout);	
		}
	},
	hide : function(){
		$('#elf_toast').hide();	
	}
};

//从数组中随机获取一个值
win.array_rand = function (arr){
	return arr[rand(0,arr.length-1)];
};

var _stopEvent = function(e){
	//e.preventDefault();
	//e.stopPropagation(); 该项会导致iscroll失效
	var target = e.target;
	while (target.nodeType != 1) target = target.parentNode;
	if (target.tagName != 'EMBED' && target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA'){
		e.preventDefault();
	}
};
win.stopEvent = function(){
	$(document.body).bind(touchstart,function(e){
		_stopEvent(e);
	}).bind(touchmove,function(e){
		_stopEvent(e);
	}).bind(touchend,function(e){
		_stopEvent(e);
	});
};
win.getevt = function(e){
	return (e.changedTouches && e.changedTouches[0]) || e ;
};

//HorV 横屏(0)还是纵屏(1)，默认为横屏
Elf.HD = function(maxWidth,HorV){
	var element = Elf.$("viewport"),content,width;
	if(!element)return;
	
	var hv = (HorV?HorV:0),SCSize={
		'ipad':[1024,768],
		'iphone':[960,640],
		'else':[800,480]
	};
	
	if(SCSize[Elf.Device.name]){
		width = SCSize[Elf.Device.name][hv];
	}else{
		width = $(window).width();
		width = width<SCSize['else'][hv]?SCSize['else'][hv]:width;
	}
	if(maxWidth)width=(width>maxWidth?maxWidth:width);
	content = "user-scalable=no,width="+ width +",target-densitydpi=high-dpi";
	Elf.log('切换至高清模式',width,content);
	element.content = content;
};
Elf.isWin32=(navigator.platform.toLowerCase()=='win32' || navigator.platform.toLowerCase()=='windows' );
/**
 * 获取某个DOM元素在页面中的位置偏移量。
 */
Elf.getElementOffset = function(elem){
	var left = elem.offsetLeft, top = elem.offsetTop;
	while((elem = elem.offsetParent) && elem != document.body && elem != document)
	{
		left += elem.offsetLeft;
		top += elem.offsetTop;
	}
	return {left:left, top:top};
};

/**
 * 返回Elf的字符串表示形式。
 */
Elf.toString = function(){
	return "Elf";
};

/**
 * 检测显示对象obj是否与点x，y发生了碰撞。
 */
Elf.hitTestPoint = function(obj, x, y, usePolyCollision){
	var b = obj.getBounds();
	if (obj.r) {
		var cx = b.x + obj.r, cy= b.y + obj.r;
		var x1 = x-cx,y1 = y-cy;

		return (Math.abs(x1*x1)+Math.abs(y1*y1) > obj.r*obj.r) ? -1 : 1 ;
	}
	var hit = x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
	return hit ? 1 : -1;
};

Elf.base64 = new Base64();
//COOKIE操作
Elf.setCookie = function(name,value){  
    var Days = 300;  
    var exp  = new Date();  
    exp.setTime(exp.getTime() + Days*24*60*60*1000);  
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();  
}; 
  
Elf.getCookie = function(name){  
    var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));   
    if(arr != null){  
        return unescape(arr[2]);  
    }else{  
        return "";  
    }  
}; 
  
Elf.delCookie = function(name){  
    var exp = new Date();   
    exp.setTime(exp.getTime() - 1);  
    var cval=getCookie(name);  
    if(cval!=null) document.cookie= name + "="+cval+";expires="+exp.toGMTString();  
};

//数据加密类，和PHP端对应
var ELFKEY=0x0f;
Elf.encodeFun = function(str){
    var r = [];
    for(var i = 0; i < str.length; i++){
        r.push(String.fromCharCode(str.charCodeAt(i) ^ ELFKEY));
    }
    return r.join('');
};
Elf.encode = function(data){
	var str = '';
	if(typeof data!='string'){
		str = JSON.stringify(data)	
	}
	str = Elf.base64.encode(str);
	str = Elf.encodeFun(str);
	str += hex_md5(str+ELFKEY);
	return Elf.base64.encode(str);
};
Elf.decode = function(data){
	data = Elf.base64.decode(data);
	var len=data.length;
	if(len<32)return false;
	var realdata = data.substr(0,len-32),
	key = data.substr(len-32,32);
	if(key!=hex_md5(realdata+ELFKEY))return false;
	str = Elf.encodeFun(realdata);
	return Elf.base64.decode(str);
}; 
/**
 * 默认的全局namespace为Elf或E（当E没有被占据的情况下）。
 */
if(win.E == undefined) win.E = Elf;
if(win.trace == undefined) win.trace = Elf.trace;

})(window);
