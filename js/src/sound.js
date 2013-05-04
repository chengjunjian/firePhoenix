(function(){

var SOUND = Elf.SOUND = {
	cache : {},
	load : function(sound){
		var me = this,tmp;
		me.sound = sound;
		try{
			if(Elf.isAppCan){
				uexAudio.openSoundPool();
			}
			for(var i=0,l=sound.length;i<l;i++) {
				var url = sound[i];
				//如果是appcan中运行的
				if(Elf.isAppCan){
					url = url.replace('wgtRes/','res://');
					me.cache[url] = (i+1).toString();
					uexAudio.addSound(me.cache[url],url);

				}else if(Elf.isWin32){
					tmp = new Image();				
					tmp.src=url;
				}
			}
		}catch(e){}
	},
	//播放音效，多声道
	playEff : function(url){
		try{
			
			if(Elf.isAppCan){
				url = url.replace('wgtRes/','res://');
				if(this.cache[url]==null)return;
				uexAudio.playFromSoundPool(this.cache[url]);
			}else if(Elf.isWin32){
				if(this.cache[url]){
					this.cache[url].play();
					return;	
				}
				
				this.soundEffID = (this.soundEffID||0)+1;
				var id = 'soundEffID'+this.soundEffID;
				$('body').append('<audio id="'+ id +'" preload="auto" style="position:absolute; display:none">' +
					'<source src="'+ url +'"></source>' +
				'</audio>');
				this.cache[url] = $('#'+id).get(0);
				this.cache[url].play();
			}
		
		}catch(e){}
	},
	//播放背景音乐
	play : function(url){
		//alert('播放背景音乐：'+url);
		if(Elf.isAppCan){
			url = url.replace('wgtRes/','res://');
			uexAudio.stop();
			uexAudio.open(url);
　　		uexAudio.play(-1);
		}else if(Elf.isWin32){
			if(!this.bgsound){
				$('body').append('<audio id="soundBGMusic" preload="auto" loop="true" style="position:absolute; display:none">' +
					'<source src="'+ url +'"></source>' +
				'</audio>');
				this.bgsound = $('#soundBGMusic').get(0);
			}
			this.bgsound.src=url;
			this.bgsound.play();
		}
	}
};

})();