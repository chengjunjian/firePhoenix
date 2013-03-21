var
touchstart = 'touchstart',
touchmove = 'touchmove',
touchend = 'touchend';

//处理手机和电脑浏览器event不一样的问题
function getevt(e){
	return (e.changedTouches && e.changedTouches[0]) || e ;
}
//输出调试信息
function debug(){
	console && console.log('engine：',arguments);
}
//从数组中随机获取一个值
function array_rand(arr){
	return arr[rand(0,arr.length-1)];
}
//获取一个随机数，左右闭区间
function rand(under, over){ 
	switch(arguments.length){ 
		case 1: return parseInt(Math.random()*under+1); 
		case 2: return parseInt(Math.random()*(over-under+1) + under); 
		default: return 0; 
	} 
}

/*
* ===============================================================
* CANVAS 2D游戏主引擎
*/
function Engine(){
	this.sprites = [];//所有动画精灵列表
	this.start = false;//引擎是否已启动
	this.debug = false;
	this.device = this.getDeviceConfig();
	
	if(!this.device.touch){
		touchstart = 'mousedown';
		touchmove = 'mousemove';
		touchend = 'mouseup';	
	}
}
Engine.prototype = {
	/*
	* 获取当前设备信息
	*/
	getDeviceConfig:function() {
		var a = navigator.userAgent.toLowerCase();
		return a.indexOf("iphone") != -1 || a.indexOf("ipod") != -1 ? {
			name: "iphone",
			touch: true,
		}: a.indexOf("ipad") != -1 ? {
			name: "ipad",
			touch: true,
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
	},
	/*
	* 阻止事件传递
	*/
	stopEvent : function(){
		var self = this;
		$(document.body).bind(touchstart,function(e){
			self._stopEvent(e);
		}).bind(touchmove,function(e){
			self._stopEvent(e);
		}).bind(touchend,function(e){
			self._stopEvent(e);
		});
		return self;
	},
	_stopEvent : function(e){
		e.preventDefault();
		e.stopPropagation();
	},
	
	/*
	** 初始化 
	** fps：帧频，默认为20帧
	*/
	init:function(canvasID,fps){
		//主画布
		this.canvas = document.getElementById(canvasID);
		this.context = this.canvas.getContext("2d");
		this.canvasInfo = {width:this.canvas.width,height:this.canvas.height};
				
		this.FPS = fps || 24;	
		//帧长，每一帧消耗的时间
		this.stepTime = parseInt(1000/this.FPS,10);
		this.onInit();
		debug('引擎初始化 FPS',this.FPS,'帧长',this.stepTime);
		return this;
	}
	/*
	* 抽象方法，初始化完成
	*/
	,onInit:function(func){ }
	/*
	**渲染画布
	*/
	,render:function(){
		this.clearCanvas();
		this.update();
		this.draw();
		return this;
	}
	/*
	**清理画布
	*/
	,clearCanvas:function(){
		var height = this.canvasInfo.height;
		this.canvas.height=0;
		this.canvas.height=height;
		//this.context.clearRect(0,0,this.canvasInfo.width,this.canvasInfo.height);
		return this;
	}
	/*
	**逐个更新精灵
	*/
	,update:function(){
		for(var i=0,l=this.sprites.length;i<l;i++){
			//sprite还存活,就调用下层方法,否则,移除
			var sprite=this.sprites[i];			
			if(true == sprite.isLive){
				//如果sprite有Anim，则调用update方法
				if(sprite.currentAnim)
					sprite.update(this.stepTime);
			}else{
				this.removeSprite(i);
				l--;
			}
		}
	}
	/*
	** 逐个更新绘画
	*/
	,draw:function(){
		for(var i=0,l=this.sprites.length;i<l;i++){
			if(this.sprites[i].draw)
				this.sprites[i].draw(this.context);
		}
		return this;
	}
	/*
	** 添加动画元素
	*/
	,addSprite:function(sprite){
		this.sprites.push(sprite);
		debug('新增精灵',sprite);
		sprite.init();
		return this;
	}
	/*
	** 删除动画元素
	** 将最后一个元素移动到index的位置，并pop去除掉最后一个。
	*/
	,removeSprite:function(index){
		this.sprites[index]=this.sprites[this.sprites.length-1];
		this.sprites.pop();
		debug('销毁精灵',index);
		return this;
	}
	/*
	** 启动引擎
	*/
	,run : function(){
		var _this = this;
		this.mainTimer = setInterval(function(){
			_this.render();
		},this.stepTime);
		this.start = true;
		debug('启动引擎 开始渲染画布');
		return this;
	}
};

/*
* ===============================================================
* 精灵类
*/
function Sprite(){
	this.isLive = true;	
	this.position = Vector.zero; //位置
	this.anims = []; //动作命令配置
	this.loc = {}; //该精灵的位置和尺寸信息
}
var spritePro = Sprite.prototype;

spritePro.onInit = function(){};
spritePro.init = function(){
	this.onInit();
	//创建所有的动作方法
	for (var key in this.anims){
		var anim=this.anims[key];
		anim.id=key;
		anim.img=anim.img||this.img;
		this.anims[key]=new Animation(anim);
		this.anims[key].init(this);
	}
	//初始化当前动作
	if(this.currentAnim)this.setAnim(this.currentAnim);
	//增加默认运动方式
	//this.addMotionWay(this.defaultWay);
};
//设置该精灵当前动作
spritePro.setAnim = function(anim){
	if(typeof anim == "string"){
		anim = this.anims[anim];
	}
	if(anim instanceof Animation) {
		this.currentAnim=anim;
	}
};
/*
*默认运动方式
*/
spritePro.defaultWay = function(steptime){		
	/*this.position = this.position.plus(this.speed.multiply(steptime).floor());		
	this.speed= this.speed.plus(this.acceleration.multiply(steptime));*/
};
/*
**添加运动方式
*/
spritePro.addMotionWay = function(fun){
	/*if(!this.motionFunc)
		this.motionFunc=[];
	this.motionFunc.push(fun);*/
};
/*
**删除运动方式
*/
spritePro.removeMotionWay = function(){
	/*this.motionFunc.pop();*/
};
/*
* 设置sprite死亡
*/
spritePro.kill = function(){
	this.isLive = false;
};
/*
* 定时刷新Sprite
*/
spritePro.onUpdate=function(stepTime){};
spritePro.update = function(stepTime){
	/*if(this.motionFunc && this.motionFunc.length!=0){
		for(var i=this.motionFunc.length;i--; ){
			this.motionFunc[i].call(this,stepTime);
		}
	}*/
	this.onUpdate(stepTime);
	this.currentAnim.update(stepTime);
	
};
/*
* 定时重绘Sprite
*/
spritePro.draw = function(ctx){
	if (this.currentAnim){
		this.currentAnim.draw(ctx,this.position);
	}
};
/*
* 根据cfg配置自动生成frames
* cfg = {w:宽度,h:高度,hn:横向图片张数,vn:纵向图片张数,s:取出图片的起始索引,e:取出图片的终止索引}
*/
spritePro.creatFrame = function(cfg){
	var _w = parseInt(cfg.w/cfg.hn,10),
	_h = parseInt(cfg.h/cfg.vn,10),
	arr = [];
	
	for(var i=0;i<cfg.hn*cfg.vn;i++){
		//该图片在第几行，0开始
		var hang = parseInt(i/cfg.hn,10),
		lie = i - hang*cfg.hn,
		data = {x:lie*_w,y:hang*_h,w:_w,h:_h};
		if(cfg.d)data.d = cfg.d;
		arr.push(data);
	}
	
	if(cfg.s!=null && cfg.e!=null){
		arr2 = [];
		for(var i=cfg.s;i<=cfg.e;i++){
			arr2.push(arr[i]);	
		}
		arr = arr2;
	}
	return arr;
};
/*
* ===============================================================
* 图片缓存类
*/
var IMG = {
	cache : {},
	get : function(url){
		if(this.cache[url])
			return this.cache[url];
		else{
			this.cache[url] = new Image();
			this.cache[url].src = url;
			return this.cache[url];
		}
	}
};

/*
* ===============================================================
* 动画类
*/	
function Animation(cfg){	
	this.cfg = cfg;
	if(cfg.img)
		this.image = IMG.get(cfg.img);
};
Animation.prototype={
	loop : -1,
	init:function(sprite){
		//上一层调用的sprite
		this.sprite = sprite;
		
		this.frames=this.frames||[];
		this._frameCount=this.cfg.frames.length;
		for(var i=0;i<this._frameCount;i++){
			var frame=this.cfg.frames[i];
			this.frames[i]=frame;
		}
		this._loopCount=0;
		this.activeFrame(this.currentFrame || 0);
				
		this.onInit(sprite);
	}
	
	//设置当前帧
	,activeFrame : function(index){
		this._frameIndex=index;
		//已经经过时间
		this._framePlayedDuration=0;
		//当前帧数
		this.currentFrame=this.frames[index];

	}
	
	,onInit:function(){
		
	}
	,onFinish:function(){
		
	}
	
	//下一个帧
	,getNextFrame:function(){
		if (this._frameIndex<this._frameCount-1){
			this._frameIndex++;
		}else if (this.loop <0){ // loop forever 
			this._frameIndex=0;
		}else{
			this._loopCount++;
			if (this._loopCount<this.loop){
				this._frameIndex=0;
			}else{
				this._loopCount=this.loop;
				this._frameIndex=this._frameCount-1;
				this.onFinish();
			}
		}
		this.activeFrame(this._frameIndex);
	}
	
	,update:function(stepTime){	
		if(this._framePlayedDuration>= (this.currentFrame.d||0) ){
			this.getNextFrame();
		}else{
			this._framePlayedDuration += stepTime;
		}
	}
	,draw:function(ctx,position){
		if(this.image.width==0)return;
		var f = this.currentFrame;
		ctx.save();
		//position = position.floor();
		ctx.translate(position.x,position.y);

		if(position.angle){
			//向量角度旋转
			rotateCenter = this.cfg.rotateCenter;
			if(rotateCenter)ctx.translate(rotateCenter.x,rotateCenter.y);
			ctx.rotate(position.angle);
			if(rotateCenter)ctx.translate(-rotateCenter.x,-rotateCenter.y);
		}		
		this.sprite.loc = position;
		this.sprite.loc.width = f.w;
		this.sprite.loc.height = f.h;
		ctx.drawImage(this.image,f.x,f.y,f.w,f.h,0,0,f.w,f.h);
		
		this.sprite.onDraw && this.sprite.onDraw(ctx,position);
		ctx.restore();
	} 
};

/*
* ===============================================================
* 二维运动类
*/
function Vector(xx, yy){
	this.x = xx;
	this.y = yy;
}
//重置
Vector.prototype.reset = function(xx, yy){
	this.x=xx;
	this.y=yy;
};
//复制
Vector.prototype.getClone = function(){
	return new Vector(this.x,this.y);
};
//比较是否相等
Vector.prototype.equals = function(v){
	return (this.x==v.x && this.y==v.y);
};
//加法,改变当前对象
Vector.prototype.plus = function(v){
	this.x += v.x;
	this.y += v.y;	
};
//求和,返回新对象
Vector.prototype.plusNew = function(v){
	return new Vector(this.x+v.x,this.y+v.y);
};
//减法,改变当前对象
Vector.prototype.minus = function(v){
	this.x -= v.x;
	this.y -= v.y;
};
//求差,返回新对象
Vector.prototype.minusNew = function(v){
	return new Vector(this.x-v.x,this.y-v.y);
};
//求逆,改变当前对象
Vector.prototype.negate = function(){
	this.x = - this.x;
	this.y = - this.y;
};
//求逆,返回新对象
Vector.prototype.negateNew = function(){
	return new Vector(-this.x,-this.y);
};
//缩放,改变当前对象
Vector.prototype.scale = function(s){
	this.x *= s;
	this.y *= s;
};
//缩放,返回新对象
Vector.prototype.scaleNew = function(s){
	return new Vector(this.x * s, this.y * s);
};
//获取向量长度
Vector.prototype.getLength = function(){
	return Math.sqrt(this.x*this.x + this.y*this.y);
};
//设置向量长度
Vector.prototype.setLength = function(len){
	var r = this.getLength();
	if (r) this.scale (len / r);
	else this.x = len;
};
//获取向量角度
Vector.prototype.getAngle = function(){
	return Math.atan2(this.y, this.x);
};
//设置向量角度
Vector.prototype.setAngle = function(ang){
	var r = this.getLength();
	this.x = r * Math.cos (ang);
	this.y = r * Math.sin (ang);
};
//向量旋转，改变当前对象
Vector.prototype.rotate = function(ang){  
	var ca = Math.cos (ang);
	var sa = Math.sin (ang);     
	var rx = this.x * ca - this.y * sa;
	var ry = this.x * sa + this.y * ca;
	this.x = rx;
	this.y = ry;
};
//向量旋转，返回新对象
Vector.prototype.rotateNew = function(ang){
	var v=new Vector(this.x,this.y);
	v.rotate(ang);
	return v;
};
//点积
Vector.prototype.dot = function(v){
	return this.x * v.x + this.y * v.y;
};
//法向量
Vector.prototype.getNormal = function(){
	return new Vector(-this.y,this.x);
};
//垂直验证
Vector.prototype.isPerpTo = function(v){
	return (this.dot (v) == 0);
};
//向量的夹角
Vector.prototype.angleBetween = function(v){
	var dp = this.dot (v); 
	var cosAngle = dp / (this.getLength() * v.getLength());
	return Math.acos (cosAngle); 
};
//取整
Vector.prototype.floor=function(){
	this.x = Math.round(this.x);
	this.y = Math.round(this.y);
	return this;
};
Vector.zero = new Vector(0,0);
/*
* ========================================================
* 箭
*/
(function(TD){
	TD.arrow = function(bow){
		Sprite.apply(this);
		
		this.img = 'img/game2.png';
		this.currentAnim="lv1";
		this.anims = {
			'lv1':{
				frames:[{x : 119, y : 0, w : 99, h : 23}],
				rotateCenter:{x:0,y:12} //可选：旋转中心点
			}
		};
		this.bow = bow;
		pos = new Vector(0,220); //箭的初始坐标
		pos.angle = bow.position.angle; //箭的角度设置为弓的角度
		this.position = pos;
		this.vectorAngle = {x:Math.cos(pos.angle),y:Math.sin(pos.angle)};
	};
	TD.arrow.prototype = new Sprite();
	var prototype = TD.arrow.prototype;
	
	prototype.onUpdate = function(stepTime){
		//计算新的坐标位置，并判断是否已离开屏幕需要销毁
		var position = this.position;
		position.plus({x:this.vectorAngle.x*30,y:this.vectorAngle.y*30});
		
		//箭头所在坐标，用于碰撞检测
		if(this.loc.x){
			this.head = {x:this.loc.x+this.vectorAngle.x*this.loc.width,y:this.loc.y+this.vectorAngle.y*this.loc.width+this.loc.height*.5};
			this.hitTest();
		}
		
		//如果已离开屏幕范围，则销毁
		if(position.x>TD.engine.canvasInfo.width || position.y<0 || position.y>TD.engine.canvasInfo.height)
			this.kill();
	};
	
	prototype.hitTest = function(){
		//碰撞检查，是否命中了怪物
		if(!this.head || !TD.enemy)return;
		for(var i=0,l=TD.enemy.enemyList.length;i<l;i++){
			var _enemy = TD.enemy.enemyList[i];
			if(!_enemy || !_enemy.loc.x)continue; //若该怪物还没有loc值
			
			//if(this.head.x > _enemy.loc.x+_enemy.loc.width)continue; //如果箭已经超过了该怪物
			
			if(this.head.x > _enemy.loc.x + 10 &&
			this.head.x < _enemy.loc.x + _enemy.loc.width-10 &&
			this.head.y>_enemy.loc.y+10 &&
			this.head.y < _enemy.loc.y + _enemy.loc.height-10){
				_enemy.hit(i);
				this.kill();//销毁箭
				break;
			}
		}
	};
	
	prototype.onDraw = function(ctx,position){
		//标示箭头碰撞位置
		if(!this.head)return;
		return;
		
		//ctx.translate(0,0);
		/*ctx.strokeStyle = "#000000";
		ctx.fillStyle = "#FF0000";
		ctx.beginPath();
		ctx.arc(this.head.x,this.head.y,3, 0, Math.PI*2, true); 
		ctx.closePath();
		ctx.fill();
		ctx.stroke();*/
	};
})(TD);
/*
* ========================================================
* 弓
*/
(function(TD){
	TD.Bow = function(){
		Sprite.apply(this);
		this.img = 'img/game2.png';
		this.currentAnim="lv2";
		this.anims = {
			'lv1':{
				frames:[{x : 0, y : 0, w : 114, h : 178}],
				rotateCenter:{x:50,y:90} //可选：旋转中心点
			},
			'lv2':{
				frames:[{x : 0, y : 184, w : 95, h : 161}],
				rotateCenter:{x:42,y:80} //可选：旋转中心点
			}
		};
		this.position = new Vector(0,150);  //初始位置
		this.fireing = false; //是否开火中
		this.nowXY = {}; //当前鼠标所在位置
		this.CD = 100; //发射频率
	};
	TD.Bow.prototype = new Sprite();
	var prototype = TD.Bow.prototype;
	
	prototype.onInit = function(){
		var self = this,parent=TD;
		//初始化弓时绑定事件
		$('#'+CANVASID).bind(touchstart,function(e){
			debug('开火状态',self.fireing);
			self.saveXY(e,this);
			self.fireing = true;
		}).bind(touchmove,function(e){
			if(self.fireing)self.saveXY(e,this);
		}).bind(touchend,function(e){
			self.fireing = false;
			debug('开火状态',self.fireing);
		});
	};
	prototype.saveXY = function(e,obj){
		evt = getevt(e);
		this.nowXY = {x:evt.pageX-TD.loc.offsetLeft,y:evt.pageY-TD.loc.offsetTop}
	};
	
	prototype.onUpdate = function(stepTime){
		var self = this;
		this.leftcd = (this.leftcd || 0) + stepTime;
		if(self.fireing){
			var change = 1;
			if(self.lastXY && self.lastXY.x==self.nowXY.x && self.lastXY.y==self.nowXY.y) change=0;
			
			if(change==1){
				//0,238为弓中心固定点的坐标
				self.position.angle = new Vector(self.nowXY.x-0,self.nowXY.y-238).getAngle();;
				self.lastXY = {x:self.nowXY.x,y:self.nowXY.y};
			}
			
			//发射箭
			if(this.leftcd>=this.CD && self.position.angle)
				self.fire();	
				
		}
	};
	
	prototype.fire = function(){
		//重置CD时间
		this.leftcd = 0;
		TD.engine.addSprite(new TD.arrow(this));
		
		//document.getElementById('bbb').play();
	};
})(TD);
/*
* 怪物管理类
*/
(function(){
	TD.enemy = function(){
		this.names = [];
		this.enemyList = []; //当前屏幕内怪物列表
		this.wayList = [
			//七条怪物轨道
			{x:800,y:15},
			{x:800,y:15+50},
			{x:800,y:15+50*2},
			{x:800,y:15+50*3},
			{x:800,y:15+50*4},
			{x:800,y:15+50*5},
			{x:800,y:15+50*6}
		];
	};
	prototype = TD.enemy.prototype;
	prototype.add = function(name,wayIndex){
		if(!name) name=array_rand(this.names);
		if(!wayIndex) wayIndex=rand(0,this.wayList.length-1);
		debug('增加怪物',name,wayIndex);
		
		var enemy = new TD.enemyConf[name](),
		way = this.wayList[wayIndex];
		
		enemy.position = new Vector(way.x,way.y);
		enemy.listIndex = this.enemyList.length;
		
		this.enemyList.push(enemy);
		
		debug(this.enemyList);
		
		TD.engine.addSprite(enemy);
	};

	prototype.del=function(index){
		var last = this.enemyList[this.enemyList.length-1];
		last.listIndex = index;
		this.enemyList[index]=last;
		this.enemyList.pop();
		//this.enemyList[index]=null;
		
		//debug(this.enemyList);
		return this;
	};
	
	
	TD.enemy = new TD.enemy();

	/*setTimeout(function(){
		TD.enemy.add();	
	},1000);*/
	setInterval(function(){
		TD.enemy.add();	
	},3000);
	/*
	* 怪物基类
	*/
	TD.EnemyBase = function(){
		Sprite.apply(this);		
	};
	TD.EnemyBase.prototype = new Sprite();
	var prototype = TD.EnemyBase.prototype;
	
	prototype.onUpdate = function(stepTime){
		
		//debug(this.position);
		if(this.position.x>100){
			this.position.minus({x:this.speed,y:0});
		}
		
		if(this.showhp && this.showhp>0)
			this.showhp--;
		//alert(this.position);
	};
	prototype.hit = function(){
		//alert('被击中');
		this.hp = this.hp - rand(1,3);
		
		this.showhp = 20;
		
		
		if(this.hp<=0){
			this.kill();
			TD.enemy.del(this.listIndex);
		}
	};
	prototype.onDraw = function(ctx,position){
		//ctx.save();
		//ctx.translate(position.x,position.y);	
		/*if(this.hp){
			ctx.font = "bold 12px 黑体";
			ctx.fillStyle = "rgba(255, 0, 0,1)";
			ctx.fillText(this.hp + "/8",40,0);
		}*/
		
		if(!this.loc.x || !this.showhp || this.showhp<=0)return;
		
		var _width = (this.hp/8)*50;
		_width = _width<0?0:_width;
		
		var x = this.loc.width/2 - 25;
		
		ctx.fillStyle='#cc0000';
		ctx.fillRect(x,0,_width,5);
		
		ctx.fillStyle='#ffffff';
		ctx.fillRect(x+_width,0,50-_width,5);
		
		ctx.strokeRect(x,0.5,50,5);
		
		ctx.lineWidth=1;
		
		//ctx.restore();
	};
	
/*	if(this.sprite.hp){
			ctx.font = "bold 12px 黑体";
			ctx.fillStyle = "rgba(255, 0, 0,1)";
			ctx.fillText(this.sprite.hp + "/8",0,0);
		}*/
	
	/*
	* 怪物配置
	*/
	TD.enemyConf = {
		'youling' : function(){
			TD.EnemyBase.apply(this);	
			this.currentAnim="walk";
			this.anims = {
				'walk':{
					img:'img/ll.png',
					frames:this.creatFrame({w:696,h:80,hn:8,vn:1,s:0,e:7,d:85})
				}
			};
			this.speed = 2; //移动速度
			this.hp = 8;
		},
		'kulou' : function(){
			TD.EnemyBase.apply(this);	
			this.currentAnim="walk";
			this.anims = {
				'walk':{
					img:'img/enemy23.png',
					frames:this.creatFrame({w:675,h:108,hn:5,vn:1,s:0,e:4,d:90})
				}
			};
			this.speed = 2;
			this.hp = 8;
		},
		'niutou' : function(){
			TD.EnemyBase.apply(this);	
			this.currentAnim="walk";
			this.anims = {
				'walk':{
					img:'img/22.png',
					frames:this.creatFrame({w:764,h:322,hn:4,vn:2,s:0,e:7,d:90})
				}
			};
			this.speed = 1.8;
			this.hp = 8;
		},
		'yuren' : function(){
			TD.EnemyBase.apply(this);	
			this.currentAnim="walk";
			this.anims = {
				'walk':{
					img:'img/33.png',
					frames:this.creatFrame({w:231,h:126,hn:3,vn:2,s:0,e:5,d:90})
				}
			};
			this.speed = 2.2;
			this.hp = 8;
		},
		'feilong' : function(){
			TD.EnemyBase.apply(this);	
			this.currentAnim="walk";
			this.anims = {
				'walk':{
					img:'img/44.png',
					frames:this.creatFrame({w:1040,h:570,hn:4,vn:2,s:0,e:7,d:90})
				}
			};
			this.speed = 2.2;
			this.hp = 8;
		}
	};
	for(k in TD.enemyConf){
		TD.enemyConf[k].prototype = new TD.EnemyBase();
		TD.enemy.names.push(k);
	}
})(TD);
var CANVASID = 'gameCanvas';

//游戏初始化
TD.init = function(){
	this.engine = new Engine();
	this.engine.debug = true;
	this.engine.init(CANVASID).stopEvent().run();
	
	this.bow = new this.Bow();
	this.engine.addSprite(this.bow);
	
	//this.engine.addSprite(new TD.mofata());
	//this.engine.addSprite(new TD.mofata2());
	
	//this.engine.addSprite(new TD.enemyConf['youling']());
	/*this.engine.addSprite(new TD.enemy['kulou']());
	this.engine.addSprite(new TD.enemy['niutou']());
	this.engine.addSprite(new TD.enemy['yuren']());*/
};

/*
* ========================================================
* 魔法球
*/
TD.mofata = function(){
	Sprite.apply(this);	
	this.img = 'img/2.png';
	this.currentAnim="normal";
	this.anims = {
		'normal':{
			frames:this.creatFrame({w:528,h:94,hn:4,vn:1,s:0,e:3})
		}
	};
	this.position = new Vector(28,-25);//初始位置
};
TD.mofata.prototype = new Sprite();

TD.mofata2 = function(){
	TD.mofata.apply(this);
	this.position = new Vector(28,250);//初始位置
};
TD.mofata2.prototype = new TD.mofata();


function getCanvasLoc(){
	//var obj = document.getElementById('main');
	
	var offset = $('#main').offset();
	debug(offset);
	
	TD.loc = {width:TD.engine.canvasInfo.width,
			height:TD.engine.canvasInfo.height,
			offsetLeft:offset.left,
			offsetTop:offset.top};
}

function resetui(){
	var bodyWidth = $('body').width(),bodyHeight=$('body').height();
	if(bodyWidth>800)
		$('#main').css('left',parseInt((bodyWidth-800)*.5,10));
	
	if(bodyHeight>455){
		var mainHeight = bodyHeight>530?530:bodyHeight;
		
		$('#main').css({'top':parseInt((bodyHeight-mainHeight)*.5,10),'height':mainHeight});
	}
}

/*
* ========================================================
*/
$(document).ready(function(){
	TD.init();
	window.scroll(0,1);
	resetui();
	getCanvasLoc();
});

var resize = function(){
	resetui();
	getCanvasLoc();	
};