(function(){

/*画布对象
props：画布属性
id,width,height,fps,style{}
*/
var Stage = Elf.Stage = function(props){
	Elf.DisplayObject.call(this,props);
	
	this.stageX = 0;
	this.stageY = 0;
	this.paused = false;
	this.FPS = (props.fps || 24);
	this.children = []; //所有动画精灵列表
	
	if(props.id){
		this.id = props.id;
	}else{
		this.id = Elf.UID.create('stage');
		props.id = this.id;
		var dom = Elf.createDOM('canvas',props);
		document.body.appendChild(dom);
	}
	
	this._eventTarget = null;
	this.canvas = Elf.$(this.id);
	this.context = this.canvas.getContext("2d");
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	this.stepTime = Elf.int(1000/this.FPS);
	this.lastFrameTime=(new Date()).getTime();
	
	this.autoClear = true;
	this.lastTime = +new Date();

	Elf.merge(this, props, true);
	this.onInit();
	Elf.log('canvas初始化',this.id,this.FPS,this);
	return this;
};
Stage.prototype = new Elf.DisplayObject();

Stage.prototype.onInit = function(){
	this.updatePosition();
};

Elf.merge(Stage.prototype, {
	//重新获取stage的位置偏移
	updatePosition : function(){
		var offset = Elf.getElementOffset(this.canvas);
		this.stageX = offset.left;
		this.stageY = offset.top;
		return this;
	},
	free : function(){
		for(var i=0,l=this.getNumChildren();i<l;i++){
			this.children[i].kill && this.children[i].kill();
		}
		this.children=[];
		
		delete this.FPSText;
		var me = this;
		setTimeout(function(){
			me._clear();
		},100);
		return this;
	},
	//清理画布
	_clear:function(){
		this.canvas.height= this.canvas.height;
		//this.context.clearRect(0, 0, this.width, this.height);
		return this;
	},
	_update:function(){
		this.onUpdate && this.onUpdate(this.stepTime);
		var sprite;
		for(var i=0,l=this.getNumChildren();i<l;i++){
			//sprite还存活,就调用下层方法,否则,移除
			sprite=this.children[i];
			if(!this.autoClear){
				//如果采用非自动刷新模式，则逐个精灵脏矩形清空
				sprite.clear(this.context);
			}
			if(true == sprite.isLive){
				//如果sprite有update，则调用update方法
				sprite._update && sprite._update(this.stepTime);
			}else{
				this.removeChildAt(i);
				l--;
			}
		}
		delete i;delete l;delete sprite;
		return this;
	},
	
	_draw:function(){
		for(var i=0,l=this.getNumChildren();i<l;i++){
			this.children[i]._draw && this.children[i]._draw(this);
		}
		delete i;delete l;
		return this;
	},
	
	//主循环
	_mainloop : function(){
		this._clear()._update()._draw();
		if(this.showfps){
			this._displayFPS();
		}
		return this;
	},
	//显示及统计计算FPS
	showFPS : function(show){
		this.showfps = (show!=null?show:true);
		return this;
	},
	//将FPS的值显示在画布上
	_displayFPS : function(){
		var countFPSframeNum = 30; // 每30帧计算一次
		this.durationFrame = (this.durationFrame==null?1:this.durationFrame+1);	
		
		if(!this.FPSText){
			this.FPSText = new E.Text({text:'FPS：'+ this.FPS,font:"12px arial",color:'#f00'});
			this.FPSText.x = this.FPSText.y = 15;
			this.addChild(this.FPSText);
		}
					
		if(this.durationFrame>countFPSframeNum){
			var t = (new Date()).getTime();
			this.runFPS = Math.round((countFPSframeNum*10000)/ (t - this.lastFrameTime)) / 10;
			this.lastFrameTime = t;
			this.durationFrame = 0;	
		}	
		
		if(this.FPSText && this.runFPS)
			this.FPSText.text = 'FPS：'+(this.runFPS+1);
		
		return this;
	},
	//开始循环
	run : function(){
		var self = this;
		if(self.mainTimer==null){
			self.mainTimer = setInterval(function(){
				self._mainloop();
				self.lastTime = +new Date();
				Elf.Tween.step();
			},self.stepTime);
		}
		return self;
	},
	//停止
	stop : function(){
		clearInterval(this.mainTimer);
		this.mainTimer=null;
		return this;
	},
	/**
	 * 对指定的显示对象进行context属性设置或变换。 target = displayobject
	 */
	transform : function(target){
		var ctx = this.context;
		if(target.x != 0 || target.y != 0) ctx.translate(target.x, target.y);
		if(target.regX != 0 || target.regY != 0) ctx.translate(-target.regX, -target.regY);

		if(target.rotation != 0){
			if(target.regX!=0 || target.regY!=0) ctx.translate(target.regX,target.regY);
			ctx.rotate(target.rotation);
			//ctx.rotate(target.rotation%360*Elf.DEG_TO_RAD);
			if(target.regX!=0 || target.regY!=0) ctx.translate(-target.regX,-target.regY);
		}
		if(target.scaleX != 1 || target.scaleY != 1) ctx.scale(target.scaleX, target.scaleY);
		if(target.alpha > 0) ctx.globalAlpha *= target.alpha;
	}
	/*,
	dispatchEvent : function(e){		
		var x = e.pageX || e.clientX, y = e.pageY || e.clientY;
		x = (x - this.stageX) / this.scaleX;
		y = (y - this.stageY) / this.scaleY;
		
		var obj = this.getObjectUnderPoint(x, y, true), target = this._eventTarget;
		E.log('stage.dispatchEvent is run');
	}*/
}, false);
	
})();
