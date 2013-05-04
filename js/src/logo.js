(function(){

Elf.logo = function(stage,delay,callback){
	
	//底图
	var ground = new E.Bitmap({image:E.IMG.get('res/logo.png')});
	//ground.x = (stage.width-599)*.5;
	//ground.y = (stage.height-303)*.3;
	ground.x = (stage.width-480)*.5;
	ground.y = 0;
	ground.alpha = 0;
	
	E.Tween.to(ground, {alpha:1}, {time:1000});
	
	/*//风车
	var fengche = new E.Bitmap({image:E.IMG.get('res/logo.png'), rect:[274,405,37,37]});
	fengche.x = ground.x + 133;
	fengche.y = ground.y + 69;
	fengche.regX = fengche.regY = 19;
	fengche.rotation = 0;
	
	fengche.update = function(stepTime){
		this.rotation += 0.02;
		return this;
	};

	
	//云1
	var cloud1 = new E.Bitmap({image:E.IMG.get('res/logo.png'), rect:[116,425,66,20]});
	cloud1.x = ground.x + 420;
	cloud1.y = ground.y+20;
	cloud1.alpha = 0;
	E.Tween.to(cloud1, {x:cloud1.x-50 ,y:cloud1.y+20, alpha:1}, {time:7000,reverse:true,loop:true});
	
	
	var cloud2 = new E.Bitmap({image:E.IMG.get('res/logo.png'), rect:[197,427,54,16]});
	cloud2.x = ground.x + 320;
	cloud2.y = ground.y + 20;
	E.Tween.to(cloud2, {x:cloud2.x-30}, {time:7000,reverse:true,loop:true});
	
	stage.addChild(ground,fengche,cloud1,cloud2);*/
	
	stage.addChild(ground);
	
	setTimeout(function(){
		E.Tween.to(ground, {alpha:0}, {time:1000,onComplete:function(){
			ground.kill();
			/*cloud1.kill();
			cloud2.kill();
			fengche.kill();*/
			callback && callback();	
		}});
	},delay);
};


})();