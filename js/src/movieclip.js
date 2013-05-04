(function(){

var MovieClip = Elf.MovieClip = function(props){
	this.interval = 0;	
	this.paused = false;
	this.currentFrame = 0; //read-only
	
	this._frames = [];
	this._frameLabels = {};	
	this._frameDisObj = null;
	this._displayedCount = 0;
	this.props = props || {};
	this.id = this.props.id || Elf.UID.create("MovieClip");
	
	Elf.Bitmap.call(this,props);
	Elf.merge(this, props, true);
	
	if(props.frames) this.addFrame(props.frames);
};

MovieClip.prototype = new Elf.Bitmap();

/**
 * 向MovieClip中添加帧frame，可以是单个帧或多帧的数组。
 */
MovieClip.prototype.addFrame = function(frame)
{
	var start = this._frames.length;
	if(frame instanceof Array){
		 for(var i = 0; i < frame.length; i++)
		 	this.setFrame(frame[i], start + i);
	}else{
		this.setFrame(frame, start);
	}
	return this;
};
/**
 * 指定帧frame在MovieClip的播放序列中的位置（从0开始）。
 */
MovieClip.prototype.setFrame = function(frame, index){
	if(index == undefined || index > this._frames.length) index = this._frames.length;
	else if(index < 0) index = 0;	
	this._frames[index] = frame;
	if(frame.label) this._frameLabels[frame.label] = frame;
	if(frame.interval == undefined) frame.interval = this.interval;
	if(index == 0 && this.currentFrame == 0)this.setRect(frame.rect);
	return this;
};


/**
 * 获得指定位置或标签的帧frame。
 */
MovieClip.prototype.getFrame = function(indexOrLabel)
{
	if(typeof(indexOrLabel) == "number") return this._frames[indexOrLabel];
	return this._frameLabels[indexOrLabel];
};

/**
 * 从当前位置开始播放动画序列。
 */
MovieClip.prototype.play = function(){
	this.paused = false;
	return this;
};

/**
 * 停止播放动画序列。
 */
MovieClip.prototype.stop = function(){
	this.paused = true;
	return this;
};

/**
 * 跳转到指定位置或标签的帧，并停止播放动画序列。
 */
MovieClip.prototype.gotoAndStop = function(indexOrLabel,callback){
	this.currentLable = indexOrLabel;
	this.currentFrame = this.getFrameIndex(indexOrLabel);
	this.paused = true;
	if(callback) this._playComplete = callback;
	return this;
};

/**
 * 跳转到指定位置或标签的帧，并继续播放动画序列。
 */
MovieClip.prototype.gotoAndPlay = function(indexOrLabel,callback){
	this.currentLable = indexOrLabel;
	this.currentFrame = this.getFrameIndex(indexOrLabel);
	this.paused = false;
	if(callback) this._playComplete = callback;
	return this;
};

/**
 * 获得指定参数对应的帧的位置。
 */
MovieClip.prototype.getFrameIndex = function(indexOrLabel){
	if(typeof(indexOrLabel) == "number") return indexOrLabel;
	var frame = this._frameLabels[indexOrLabel], frames = this._frames;	
	for(var i = 0; i < frames.length; i++){
		if(frame == frames[i]) return i;
	}
	return -1;
};

/**
 * 播放动画序列的下一帧。
 */
MovieClip.prototype.nextFrame = function(displayedDelta){	
	var frame = this._frames[this.currentFrame];
	
	if(frame.interval > 0){
		var count = this._displayedCount + displayedDelta;
		this._displayedCount = frame.interval > count ? count : 0;
	}
	
	if(frame.jump >= 0 || typeof(frame.jump) == "string"){
		if(this._displayedCount == 0 || !frame.interval){
			return this.currentFrame = this.getFrameIndex(frame.jump);
		}
	}
	
	if(frame.interval > 0 && this._displayedCount > 0) return this.currentFrame;
	else if(this.currentFrame >= this._frames.length - 1) return this.currentFrame = 0;
	else return ++this.currentFrame;
};

/*
* 实时显示碰撞区域
*/
MovieClip.prototype.debugImpact = function(){
	this._debugImpact = new E.Bitmap({image:E.IMG.get('res/test.png'), rect:[0,0,0,0]});
	this.addChild(this._debugImpact);
	return this;
};

/*
* 重写碰撞区域的检测
* 主要用于帧配置中设置了 impact 属性
*/
MovieClip.prototype.getBounds = function(){
	var frame = this._frames[this.currentFrame];
	if(frame.impact){
		var _b = {x:this.x-this.regX+frame.impact[0],y:this.y-this.regY+frame.impact[1],width:frame.impact[2],height:frame.impact[3]};
	}else{
		var _b = {x:this.x,y:this.y,width:this.width,height:this.height};
	}
	return _b;
};

/**
 * 返回MovieClip的帧数。
 */
MovieClip.prototype.getNumFrames = function(){
	return this._frames.length;
};

/**
 * 更新MovieClip对象的属性。
 */
MovieClip.prototype._update = function(stepTime){
	var frame = this._frames[this.currentFrame];
	
	//设置碰撞区域的位置
	if(this._debugImpact && frame.impact){
		this._debugImpact.setRect([0,0,frame.impact[2],frame.impact[3]]);
		this._debugImpact.x = frame.impact[0];
		this._debugImpact.y = frame.impact[1];
	}
	
	if(frame.stop){
		this.stop();
		this.checkPlayComplete();
		return this;
	}
	
	this._onUpdate && this._onUpdate(stepTime);
	if(!this.paused) {
		this.nextFrame(stepTime);
		this.update && this.update(stepTime);
		this.setRect(this._frames[this.currentFrame].rect);
	}else{
		this.checkPlayComplete();	
	}
	return this;
};

MovieClip.prototype.checkPlayComplete = function(){
	if(this._playComplete){
		this._playComplete();
		delete this._playComplete;	
	}
	return this;
};

/**
 * 渲染当前帧到舞台。
 */
MovieClip.prototype.draw = function(context){
	var frame = this._frames[this.currentFrame], rect = frame.rect;
	context.drawImage(this.image,rect[0], rect[1], rect[2], rect[3],0,0,(rect[4]||rect[2]),(rect[5]||rect[3]));
	try {
	} 
	catch(e) {
		Elf.log('draw is error',context,this.currentFrame,rect[0]);
	}
	this.onDraw && this.onDraw(context,rect);
};

//自动输出frame
window.fmtFrame = function(startX,startY,width,height,frameNum,lable,jump,stop){
	var res = [];
	for(var i=0;i<frameNum;i++){
		var d = {rect:[startX+i*width,startY,width,height]};
		if(i==0)d.label=lable;
		if(i==frameNum-1){
			if(jump)d.jump = jump;
			if(stop)d.stop = 1;
		}
		res.push(d);
	}
	return res;
};

})();
