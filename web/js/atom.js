var merge = function(obj, props, strict){
	for(var key in props){
		if(!strict || obj.hasOwnProperty(key) || obj[key] !== undefined){
			obj[key] = props[key];
		}
	}
	return obj;
};

(function(){
var atom = function(props) {

	this.name = '';
	this.notes = '';
	this.image = '';

	this.x = 0;
	this.y = 0;
	this.r = 0;
	this.visible = true;
	this.disable = false;

	E.merge(this,props);

	this.parentObject = $('body');
	this.contextAtoms = [];
};

//atom.prototype = new Elf.MovieClip();

atom.prototype.appendContextAtoms = function(subatom) {
	this.contextAtoms.append(subatom);
};

atom.prototype.show = function(pos) {
	if (pos) {
		this.x= pos[0];
		this.y = pos[1];
	}

	if(this._init) {
		this.style.display = '';
		return;
	}

	//第一次显示需要初始化对象
	
	
}

atom.prototype.showContextAtoms = function() { if (!this._contextAtomsPos)
		this.calcContextAtomsPos();

	for (var i in this._contextAtomsPos) {
		var catompos = this._contextAtomsPos[i];
		this.contextAtomsPos[i].show(catompos);
	}
}

atom.prototype.tap = function(callback) {
};
atom.prototype.longtap = function(callback) {
};

});
