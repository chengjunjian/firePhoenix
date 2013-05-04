(function(){

var IMG = Elf.IMG = {
	cache : {},loaded:0,
	get : function(url){
		if(this.cache[url])
			return this.cache[url];
		else{
			this.cache[url] = new Image();
			this.cache[url].src = url;
			return this.cache[url];
		}
	},
	//delayTime = 每张图片加载后延时ms
	load : function(aImages,callback,delayTime,_index){
		var self = this;
		if(_index==null)_index=0;
		if(delayTime==null)delayTime=0;
		
		if(_index<aImages.length){
			self._loadStart(aImages[_index],function(o){
				callback && callback(_index,self);
				setTimeout(function(){
					_index++;
					self.load(aImages,callback,delayTime,_index);
				},delayTime);
			});
		}
	},
	_loadStart : function(url,onload){
		var self = this;
		self.cache[url] = new Image();
		self.cache[url].onload = function() {
			self.cache[url].onload = null;
			onload && onload(self.cache[url]);
		};
		self.cache[url].src=url;
	}/*,
	___load : function(aImages,callback){
		var self = this;
		for(var i=0,l=aImages.length;i<l;i++) {
			var url = aImages[i];
			self.cache[url] = new Image();				
			(self.cache[url].onload = function() {
				self.loaded++;
				self.cache[url].onload = null;
				callback && callback(i,self);
			})(i);
			self.cache[url].src=url;
		}
	}*/
}

})();