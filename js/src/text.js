(function(){
/**
 * @property text The text to display.
 * @property font  The font style to use.
 * @property color The color to use.
 * @property align The text alignment. Can be any of "start", "end", "left", "right", and "center".
 * @property outline Determine whether stroke or fill text.
 * @property maxWidth The maximum width to draw the text, For canvas use.
 * @property lineWidth The maximum width for a line of text.
 * @property lineSpacing The space between two lines, in pixel.
 * @property fontMetrics The font metrics. You don't need to care it in most cases, can be passed in for performance optimization.
*/
var Text = Elf.Text = function(props){
	this.text = "";
	this.font = "12px arial";
	this.color = "#000";
	this.align = "start";
	this.outline = false;
	this.maxWidth = 10000;
	this.lineWidth = null;
	this.lineHeight = 0;
	
	this.props = props || {};
	this.id = props.id || Elf.UID.create("Text");
	
	Elf.merge(this, props, true);
	Elf.DisplayObject.call(this,props);
};
Text.prototype = new Elf.DisplayObject();

Elf.merge(Text.prototype, {
	_draw : function(stage){
				
		if(!this.text || this.text.length == 0) return;
		
		var context = stage.context;

		context.font = this.font;
		context.textAlign = this.align;
		context.textBaseline = "top";
		if(this.outline) context.strokeStyle = this.color;
		else context.fillStyle = this.color;
	
		var lines = this.text.split(/\r\n|\r|\n|<br(?:[ \/])*>/);
		var y = this.y, lineHeight = this.lineHeight;
		this.width = this.lineWidth || 0;
	
		for(var i = 0, len = lines.length; i < len; i++){
			var line = lines[i], width = context.measureText(line).width;
	
			if(this.lineWidth == null || width < this.lineWidth){
				if(width > this.width) this.width = width;
				this._drawTextLine(context, line, y);
				y += lineHeight;
				continue;
			}
	
			var words = line.split(/([^\x00-\xff]|\b)/), str = words[0];
			for(var j = 1, wlen = words.length; j < wlen; j++){
				var word = words[j];
				if(!word || word.length == 0) continue;
	
				var newWidth = context.measureText(str + word).width;
				if(newWidth > this.lineWidth){
					this._drawTextLine(context, str, y);
					y += lineHeight;
					str = word;
				}else{
					str += word;
				}
			}

			this._drawTextLine(context, str, y);
			y += lineHeight;
		}
	
		this.height = y;
	},
	_drawTextLine : function(context,text, y){
		var x = this.x;
		switch(this.align){
			case "center":
				x = this.width*0.5;
				break;
			case "right":
			case "end":
				x = this.width;
				break;
		};
		if(this.outline) context.strokeText(text, x, y, this.maxWidth);
		else context.fillText(text, x, y, this.maxWidth);
	}
}, false);


})();
