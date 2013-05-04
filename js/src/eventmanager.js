(function(){

/**
 * @class EventManager是一个简单的系统事件管理器。
 */
Elf.eventManager = {
	//obj对象注册了type类型的事件
	_eventMap : {},
	stage : null,
	
	bind : function(type,obj){
		var map = this._eventMap[type];
    	if(map == null) map = this._eventMap[type] = [];
		
		if(map.indexOf(obj) == -1){
			map.push(obj);
			this.bindStage(type);
		}
	},
	
	unbind : function(type,obj){
		var map = this._eventMap;
		if(!map || !map[type] || map[type].length==0) return;
		for(i in map[type]){
			if(map[type][i] == obj){
				map[type].splice(i, 1);
				if(map[type].length == 0) delete this._eventMap[type];	
			}
		}
	},	
	
	_stageBind : {},
	bindStage : function(type){
		//在stage注册前绑定的事件，仅记录无法处理
		if(this.stage==null)return;
		
		if(!this._stageBind[type]){
			var me = this;
			this._stageBind[type] = true;

			$(stage.canvas).bind(type,function(e){
				me.callback(e);	
			});
		}
	},
	
	registerStage : function(stage){
		if(this.stage==null){
			this.stage = stage;
			for(type in this._eventMap){
				//检查之前已经绑定的事件
				this.bindStage(type);
			}
		}
	},
	
	callback : function(e){
		var type = e.type,map=this._eventMap,isTouch = e.type.indexOf("touch") != -1;

		if(!map || !map[type] || map[type].length==0) return;
		
		var es = [];
		if(isTouch){
			//e = (e.touches && e.touches.length > 0) ? e.touches[0] : 
			//	(e.changedTouches && e.changedTouches.length > 0) ? e.changedTouches[0] : e;

			es = (e.touches && e.touches.length > 0) ? e.touches : 
				(e.changedTouches && e.changedTouches.length > 0) ? e.changedTouches : [e];

		}else {
			es = [e];
		}

		var el = es.length;
		for( var i=0;i<el && i < 2;i++) {
			e = es[i];
			e.type = type;
			e.index = i;
			
			var x = e.pageX || e.clientX, y = e.pageY || e.clientY;
			x = (x - this.stage.stageX) / this.stage.scaleX;
			y = (y - this.stage.stageY) / this.stage.scaleY;
			
			e.eventX = x;
			e.eventY = y;		
			for(i in map[type]){
				var obj = map[type][i];
				if(Elf.hitTestPoint(obj,x,y)==1){
					obj.dispatchEvent(e);
				}	
			}		
		}
	}
};
	
})();
