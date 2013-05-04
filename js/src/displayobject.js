(function(props){
/*
DisplayObject类是可放在舞台上的所有显示对象的基类。DisplayObject类定义了若干显示对象的基本属性。
*/
var DisplayObject = Elf.DisplayObject = function(props){
	this.isLive = true;
	this.visible = true;
	this.x = 0;
	this.y = 0;
	this.regX = 0;
	this.regY = 0;
	this.scaleX = 1;
	this.scaleY = 1;
	this.width = 0;
	this.height = 0;
	this.rotation = 0;
	this.alpha = 1;
	this.children = [];
	this.parent = null;
	
	Elf.merge(this, props, true);
	Elf.EventDispatcher.call(this);
};
DisplayObject.prototype = new Elf.EventDispatcher();

Elf.merge(DisplayObject.prototype, {
//DisplayObject.prototype = {
	/**
	 * 对象数据更新接口，仅供框架内部或组件开发者使用。用户通常应该重写update方法。
	 */
	_update : function(stepTime){ 
		//先更新容器本身的数据，再更新子元素的数据
		this.update(stepTime);
		for(var i = 0, len = this.getNumChildren(); i < len; i++){
			this.children[i]._update(stepTime);
		}
	},
	/**
	 * 对象数据更新接口，可通过覆盖此方法实现对象的数据更新。
	 */
	update : function(stepTime){
		return this;
	},
	/**
	 * 对象渲染接口，仅供框架内部或组件开发者使用。用户通常应该重写render方法。
	 */
	_draw : function(stage){
		
		//是否在屏幕中
		if(!this.maxWidthOrHeight) this.maxWidthOrHeight = Math.max(this.width,this.height);
		
		var drawX=this.x-this.regX,drawY=this.y-this.regY;
		if(drawX > stage.width || drawY > stage.height ||
		   drawX + this.maxWidthOrHeight < 0 || drawY + this.maxWidthOrHeight < 0
		){return;}

		var ctx = stage.context;
		if(!this.visible || this.alpha <= 0){
			return;
		}		
		ctx.save();
		stage.transform(this);
		this.draw(ctx);
		//绘制所有子元素
		for(var i = 0, len = this.getNumChildren(); i < len; i++){
			this.children[i]._draw(stage);
		}
		ctx.restore();
	},
	/**
	 * DisplayObject对象渲染接口，可通过覆盖此方法实现对象的渲染。
	 */
	draw : function(context){
		return true;
	},
	
	//杀死该对象
	kill : function(){
		this.isLive = false;	
	},
	
	free : function(){
		this.unbind();
		
		for(k in this.prototype)
			delete this.prototype[k];
		delete this.prototype;

		for(k in this)
			delete this[k];
		delete this;
	},
	/**
	 * 返回DisplayObject对象在舞台全局坐标系内的矩形区域以及所有顶点。
	 */
	getBounds : function(){
		return {x:this.x,y:this.y,width:this.width,height:this.height}
	},
	/*
	** 添加动画精灵
	** addChild (child) OR addChild(child1, child2, ...)
	*/
	addChild : function(){
		var _needRezIndex = 0;
		for(var i=0,l=arguments.length;i<l;i++){
			arguments[i].parent = this;
			this.children.push(arguments[i]);	
			arguments[i].init && arguments[i].init();
			if(_needRezIndex==0 && arguments[i].zIndex!=0)_needRezIndex=1;
			Elf.log((this.id || 'DisplayObject') + '新增子元素',arguments[i]);
		}
		
		if(_needRezIndex==1) this.rezIndex();			
		delete i;delete l;delete _needRezIndex;
		return this;
	},	
	/*
	* 重新排序所有精灵的zIndex
	*/
	rezIndex : function(){
		this.sortChildren(function(objA,objB){
			return  objA.zIndex - objB.zIndex; 	
		});
	},
	/*
	** 通过索引删除一个动画精灵
	*/
	removeChildAt:function(index){
		this.children[index].free && this.children[index].free();
		this.children.splice(index,1);
		Elf.log(this.id,'销毁元素',index);
		return this;
	},	
	/*
	**删除一个动画精灵
	*/
	removeChild:function(child){
		for(var i=0,l=this.getNumChildren();i<l;i++){
			if(this.getChildAt(i)==child){
				this.removeChildAt(i);
				break;	
			}
		}
		return this;
	},
	/*
	* 精灵排序
	*/
	sortChildren:function(sortFunction){
		this.children.sort(sortFunction);
	},
	//获取精灵数量
	getNumChildren:function(){
		return this.children.length;
	},
	/*
	** 通过索引获取一个动画精灵
	*/
	getChildAt:function(index){
		return this.children[index];
	}
},false);


})();