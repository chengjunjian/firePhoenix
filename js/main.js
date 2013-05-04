//主界面逻辑

///////////////////全局变量//////////////////////
var LONG_TAP_TIME = 500;
var LONG_TAP_SLOP = 8;

//画布长宽
var ww,hh;
//画布中心坐标，环绕x轴半径、y轴半径
var cx,cy,cxr,cyr,btn_cr;

//场景、画布对象
var stage;

Elf.HD(1024);
E.IMG.load(['btns.png','girl.png']);

$(document).ready(function() {
	//setTimeout(scrollTo, 200, 0, 1);
	ww = $(window).width(),hh = $(window).height();
	ww = 480;
	hh = 800;

	$('body').append('<canvas id="gameCanvas" width="'
	+ ww + '" height="'+ hh
	+'" style="text-align:center;background:#444"></canvas>');

	stage = new E.Stage({id:'gameCanvas'});
	stage.showFPS().run();

	cx = stage.width / 2;
	cy = stage.height / 2;

	//椭圆环绕
	cyr = cy - 50;
	cxr = cx - 50;

	//正圆形环绕
	//cxr = cx > cy ? cy - 20 : cx-20;
	//cyr = cx > cy ? cy - 20 : cx-20;

	//开始监听事件，只有注册了事件，所有canvas的子事件才会开始派发
	E.eventManager.registerStage(stage);

	var btnConf = {
		id:"btn_center",
		visible:true,
		image:E.IMG.get('btns.png'), 
		x:cx - 32, y:cy - 32,width:64, height:64,states: [ 
			{state:'up',frames:{rect:[0,0,64,64]}},
			{state:'over',frames:{rect:[64,0,64,64,70,70]}},
			{state:'down',frames:{rect:[128,0,64,64]}},
			{state:'disabled',frames:{rect:[192,0,64,64]}},
			{state:'shodwn',frames:{rect:[192,0,64,64]}},
			{state:fp.atom.EState.SELECTED,frames:[
				{rect:[192,0,64,64]},
				{rect:[192,3,64,64]},
				{rect:[195,3,64,64]},
				{rect:[195,0,64,64]}
				]
			}
		]
	};

	btnConf.name = '';
	var btn_center = new fp.atom(btnConf);
	btn_center.visible = true;
	stage.addChild(btn_center);
	btn_cr = 32;

	var itemdata = new fp.itemData();
	var items = itemdata.load(0,0);
	var il = items ? items.length : 0;
	for (var i=0;i<il;i++) {
		var it = items[i];

		btnConf.name = it.title;
		btnConf.image = E.IMG.get(it.pic);
		var btn_centersub1 = new fp.atom(btnConf);
		btn_centersub1.zIndex = 2;
		stage.addChild(btn_centersub1);
		btn_center.addSubAtom(btn_centersub1);

		btnConf.name = it.title;
		btnConf.image = E.IMG.get(it.pic);
		var btn_centersub2 = new fp.atom(btnConf);
		btn_centersub2.changeState(fp.atom.EState.SHODWN);
		btn_centersub2.zIndex = 1;
		stage.addChild(btn_centersub2);
		btn_centersub1.shodwn = btn_centersub2;

		btn_centersub1.bind(touchstart,function(e) {
			E.log('touchstart');
			if (this.etype) return ;
			this.etype = 1;
			var b = this.getBounds();
			this.sourceX = b.x;
			this.sourceY = b.y;
			this.eOffset=[e.x-b.x, e.y-b.y];
			this.changeState(fp.atom.EState.SELECTED);

			this.tempxy = [e.x,e.y];
			this.delaytime = LONG_TAP_TIME;
			this.lasttime = getTimestamp();

			fp.selectedItems[e.index] = this;
		});
	}

	btn_center.setSubR(cxr,cyr);
	btn_center.calcSubAtom();

	stage.bind(touchend,function(e){
		if (!fp.selectedItems[e.index] 
			|| !fp.selectedItems[e.index].etype) 
		return;

		var sel = fp.selectedItems[e.index];

		E.log(stage);
		E.log('e.index',e.index,sel.name);
		sel.etype = 0;
		sel.changeState(fp.atom.EState.UP);
		delete fp.selectedItems[e.index];
		
		E.Tween.to(sel, {x:sel.sourceX,y:sel.sourceY, alpha1:0}, {time:500,reverse:false,loop:false, onStart:function(){
				
			},onUpdate:function(){
				
			},onComplete:function(tween){
		
			}
		});
	});

	function getTimestamp() {
		return (new Date()).getTime();
	}
	function item_selected(item) {
		E.log('can move');
		
	}

	function finishitem(item) {
		btn_center.changeState(fp.atom.EState.OVER);
		stage.removeChild(item);
	}

	//$('#gameCanvas').
	stage.bind(touchmove,function(e) {
		if (!fp.selectedItems[e.index] 
			|| !fp.selectedItems[e.index].etype ) 
		return;

		var sel = fp.selectedItems[e.index];
		//E.log('etype:',sel.etype);
		if (sel.etype == 1) {
			nowtime = getTimestamp();
			//E.log('time:',nowtime - sel.lasttime);
			if (nowtime - sel.lasttime < LONG_TAP_TIME )
				return;

			if (Math.abs(sel.tempxy[0] - e.x) < LONG_TAP_SLOP 
				&& Math.abs(sel.tempxy[1] - e.y) < LONG_TAP_SLOP) {

				sel.etype = 2;
				sel.changeState(fp.atom.EState.SELECTED);

				sel.delaytime = LONG_TAP_TIME;

				item_selected(sel);
			}
			else {
				sel.etype = 0;
				delete fp.selectedItems[e.index];
				sel.changeState(fp.atom.EState.UP);
				E.log('sel is moved,dont selected!');
			}
			return;
		}

		sel.changeState(fp.atom.EState.MOVE);
		sel.x = e.x - sel.eOffset[0];
		sel.y = e.y - sel.eOffset[1];

		var x1 = sel.x + sel.r;
		var y1 = sel.y + sel.r;
		if (Math.abs((x1-cx)*(x1-cx)) + Math.abs((y1-cy)*(y1-cy)) 
			< btn_cr*btn_cr) {
			//到达了中心，删除
			E.log('is in center');

			sel.etype = 0;
			delete fp.selectedItems[e.index];

			finishitem(sel);
		}

	});

});
