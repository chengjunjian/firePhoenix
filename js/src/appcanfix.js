(function(win){
//是否是在appcan打包中运行的
Elf.isAppCan = false;

//ready封装，解决uexOnload只能赋值一次的问题
var _appCanReady = [],_doFun=false;
Elf.ready = function(callback){
	_appCanReady.push(callback);
};
Elf._clearReady = function(){
	_appCanReady=[];
};
window.uexOnload = function(type){
	if (!type){
		Elf.isAppCan = true;
		_doFunction();
	}
};

$(document).ready(function(){
	if(!Elf.isAppCan){
		setTimeout(function(){
			_doFunction();	
		},200);	
	}
});

function _doFunction(){
	if(_doFun)return;
	for(fn in _appCanReady)
		_appCanReady[fn].call(window);
	_doFun=true;
}


})(window);