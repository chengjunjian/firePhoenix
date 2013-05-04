(function(){
/**
 props 参数JSON格式为：{image:imgElem, up:[0,0,50,50], over:[50,0,50,50], down:[100,0,50,50], disabled:[150,0,50,50]}。
 */
var atom = fp.atom = function(props){
	this.state = atom.EState.UP;
	this.enabled = true;

	this.name = '';
	this.xr = 0;
	this.yr = 0;
	this.r = 0;
    
	this.props = props || {};
	this.id = props.id || Elf.UID.create("atom");
	Elf.merge(this, props, true);
	Elf.DisplayObject.call(this,props);

	this.xr = props.xr || props.r || props.width /2;
	this.yr = props.yr || props.r || props.height /2 ;
	this.r = ((props.width > props.height) ? 
		props.width / 2 : props.height / 2) ;

	this.subs = [];
	this.etype = 0; //1 为tap或click ，2为longtap canmove
	
	this.onInit();
};

atom.prototype = new Elf.DisplayObject();
atom.prototype.onInit = function(){
	var props = this.props;
	this._skin = new Elf.MovieClip({id:"skin", image:props.image,interval:props.interval || 1000});
	this.addChild(this._skin);
	this._skin.stop();

	if (this.name) {
		this._label = new E.Text({text:this.name,font:"12px arial",color:'#fdd',align:"right"});

		this._label.y = -20;
		this.addChild(this._label);
	}

	if(props.useHandCursor === undefined) this.useHandCursor = true;
	if (props.states)
		this.setStates(props.states);
	else {
		if(props.up) this.setUpState(props.up);
		if(props.over) this.setOverState(props.over);
		if(props.down) this.setDownState(props.down);
		if(props.disabled) this.setDisabledState(props.disabled);
	}
	
	if (props.subAtom)
		this.addSubAtom(props.subAtom);

	this.bind(touchstart,this.onDispatchEvent).bind(touchend,this.onDispatchEvent);
};

/*
 * 定位子原子
 */
atom.prototype.setSubR = function(menuxr,menuyr) {
	this.menuxr = menuxr;
	this.menuyr = menuyr;
}

atom.prototype.addSubAtom = function(subs) {
	if(!(subs instanceof Array)) {
		this.subs.push(subs);
	}
	else {
		for(var i in subs) 
			this.subs.push(subs[i]);
	}
	//this.calcSubAtom(false);
}

atom.prototype.calcSubAtom = function(isshow) {	
	var x0 = this.x + this.xr;
	var y0 = this.y + this.yr;
	var ro = 45 * Math.PI / 180;
	var sl = 1;
	var roate = Math.PI / 180;

	isshow = !!isshow;
	var subs = this.subs;

	this.space = fp.RadSpace(x0,y0,this.menuxr,subs[0].xr,window.ww,window.hh);
	this.space.startRad = 2 * Math.PI - this.space.startRad;
	Elf.log(this.space.startRad /roate,this.space.radSpace /roate,this.space.fangxiang);

	sl = subs.length;
	if (this.space.radSpace == Math.PI * 2)
		ro = this.space.radSpace / sl;
	else
		ro = this.space.radSpace / (sl-1);

	var xr = this.menuxr,yr=this.menuyr;

	var sumRoate = this.space.startRad;
	var fangxiang = 0 - this.space.fangxiang;
	for (var i=0;i< subs.length;i++ ) {
		var sub = subs[i];
		var wpos = sub.xr, hpos = sub.yr;

		E.log(xr,yr,sumRoate / roate,ro,Math.cos(sumRoate),sub.xr,sub.yr,x0,wpos);
		var xn = parseInt(xr * Math.cos(sumRoate) + x0 - sub.xr);
		var yn = parseInt(xr * Math.sin(sumRoate) + y0 - sub.xr);
		E.log('sub pos:',xn,yn);
		sub.x = xn;
		sub.y = yn;
		//this.parent.addChild(sub);
		//this.addChild(sub);
		//todo:生成一个影子
		//sub.shodwn.x = xn;
		//sub.shodwn.y = yn;

		sumRoate += ro * fangxiang;
	}
};

atom.EState = {};
atom.EState.DISABLED= 'disabled';
atom.EState.HIDE = 'hide';
atom.EState.NOINIT = 'noinit';
atom.EState.FINISH = 'finish';
atom.EState.LOSE = 'lose';
atom.EState.SELECTED = 'selected';
atom.EState.DOWN = 'down';
atom.EState.UP = 'up';
atom.EState.MOVE = 'move';
atom.EState.OVER = "over";
atom.EState.SHODWN = "shodwn";

atom.prototype.setStates = function(states)
{
	this.states = [];
	var il = states.length;
	for (var i=0;i<il;i++) {
		var state = states[i];
		E.log('init state',state.state);
		var frames = state.frames;
			
		if(frames instanceof Array) {
			frames[0].label = state.state;
			frames[frames.length-1].jump = state.state;
			E.log(frames);
			this._skin.addFrame(frames);
			this.states[state.state] = frames.length;
		}
		else {
			frames.label = state.state;
			this._skin.setFrame(frames);
			this.states[state.state] = 1;
		}

	}
	return this;
};

/**
 * 设置按钮是否启用。
 */
atom.prototype.setEnabled = function(enabled)
{
	if(this.enabled == enabled) return this;
	this.eventEnabled = this.enabled = enabled;	 

	E.log('button state:',this.states[atom.EState.DISABLED]);
	if(!enabled){
		if(this.states[atom.EState.DISABLED]){
			this._skin.gotoAndStop(atom.EState.DISABLED);
		}else{
			this._skin.gotoAndStop(atom.EState.UP);
		}
	}else{
		E.log(this._skin.currentFrame,this._skin._frames[this._skin.currentFrame].label);
		if(this._skin._frames[this._skin.currentFrame].label == atom.EState.DISABLED) 
			this._skin.gotoAndStop(atom.EState.UP);
	}
	return this;
};

/**
 * 改变按钮的状态。
 */
atom.prototype.changeState = function(state){
	if(this.state == state) return;
	this.state = state;

	switch(state){
		case atom.EState.DISABLED:
			this.setEnabled(false);
			break;
		default:

		//case atom.EState.OVER:
		//case atom.EState.DOWN:
		//case atom.EState.UP:
			if(!this.enabled) this.eventEnabled = this.enabled = true;

			E.log(this.name,state,this.states[state]);
			if (!this.states[state]) {
				this._skin.gotoAndStop(atom.EState.UP);
				return;
			}

			if (this.states[state]>1)
				this._skin.gotoAndPlay(state);
			else
				this._skin.gotoAndStop(state);

			break;
	}
	return this;
};

/**
 * 按钮的默认事件处理行为。
 * @private
 */
atom.prototype.onDispatchEvent = function(e){
	if(!this.enabled) return;
	
	E.log(e.type);
	switch(e.type){
		case "mousemove":
			if(this.overState) this.changeState(atom.EState.OVER);		
			break;
		case "mousedown":
		case "touchstart":
		case "touchmove":
			//if(this.states[atom.EState.DOWN]) this.changeState(atom.EState.DOWN);
			break;
		case "mouseup":
			if(this.overState) this.changeState(atom.EState.OVER);
			else this.changeState(atom.EState.UP);
			break;
		case "mouseout":
		case "touchout":
		case "touchend":
			if(this.upState) this.changeState(atom.EState.UP);
			break;
	}
};

})();
ELFDEBUG = window['ELFDEBUG'] = true;

