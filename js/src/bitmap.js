(function(){
/**
@argument props 参数JSON格式为：{image:imgElem, rect:[0,0,100,100]} 其中image是Image对象，rect指定Image区域。
*/
var Bitmap = Elf.Bitmap = function(props){
	this.image = null;
	this.props = props || {};
	this.id = (props && props.id) || Elf.UID.create("Bitmap");

	Elf.merge(this, props, true);	
	Elf.DisplayObject.call(this,props);
};
Bitmap.prototype = new Elf.DisplayObject();

Bitmap.prototype.setRect=function(rect){
	this.rectX = rect[0];
	this.rectY = rect[1];
	this.rectWidth = this.width = rect[2];
	this.rectHeight = this.height = rect[3];
	this.drawWidth = (rect[4]||this.rectWidth);
	this.drawHeight = (rect[5]||this.rectHeight);
};
Bitmap.prototype.draw = function(context){
	if(this.rectWidth==null)
		this.setRect(this.props.rect || [0, 0, this.image.width, this.image.height]);	
		
	context.drawImage(this.image,this.rectX,this.rectY,this.rectWidth,this.rectHeight,0,0,this.drawWidth,this.drawHeight);
};


})();