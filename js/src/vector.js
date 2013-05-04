(function(){
/*
* 二维运动类
*/
var Vector = Elf.Vector = function(xx, yy){
	this.x = xx;
	this.y = yy;
};
var p = Vector.prototype;
//重置
p.reset = function(xx, yy){
	this.x=xx;
	this.y=yy;
};
//复制
p.getClone = function(){
	return new Vector(this.x,this.y);
};
//比较是否相等
p.equals = function(v){
	return (this.x==v.x && this.y==v.y);
};
//加法,改变当前对象
p.add = function(v){
	this.x += v.x;
	this.y += v.y;	
};
//求和,返回新对象
p.addNew = function(v){
	return new Vector(this.x+v.x,this.y+v.y);
};
//减法,改变当前对象
p.minus = function(v){
	this.x -= v.x;
	this.y -= v.y;
};
//求差,返回新对象
p.minusNew = function(v){
	return new Vector(this.x-v.x,this.y-v.y);
};
//求逆,改变当前对象
p.negate = function(){
	this.x = - this.x;
	this.y = - this.y;
};
//求逆,返回新对象
p.negateNew = function(){
	return new Vector(-this.x,-this.y);
};
//缩放,改变当前对象
p.scale = function(s){
	this.x *= s;
	this.y *= s;
};
//缩放,返回新对象
p.scaleNew = function(s){
	return new Vector(this.x * s, this.y * s);
};
//获取向量长度
p.getLength = function(){
	return Math.sqrt(this.x*this.x + this.y*this.y);
};
//设置向量长度
p.setLength = function(len){
	var r = this.getLength();
	if (r) this.scale (len / r);
	else this.x = len;
};
//获取向量角度
p.getAngle = function(){
	return Math.atan2(this.y, this.x);
};
//设置向量角度
p.setAngle = function(ang){
	var r = this.getLength();
	this.x = r * Math.cos (ang);
	this.y = r * Math.sin (ang);
};
//向量旋转，改变当前对象
p.rotate = function(ang){  
	var ca = Math.cos (ang);
	var sa = Math.sin (ang);     
	var rx = this.x * ca - this.y * sa;
	var ry = this.x * sa + this.y * ca;
	this.x = rx;
	this.y = ry;
};
p.multiply = function(f) {
	return new Vector(this.x * f, this.y * f);
};
//向量旋转，返回新对象
p.rotateNew = function(ang){
	var v=new Vector(this.x,this.y);
	v.rotate(ang);
	return v;
};
//点积
p.dot = function(v){
	return this.x * v.x + this.y * v.y;
};
//法向量
p.getNormal = function(){
	return new Vector(-this.y,this.x);
};
//垂直验证
p.isPerpTo = function(v){
	return (this.dot (v) == 0);
};
//向量的夹角
p.angleBetween = function(v){
	var dp = this.dot (v); 
	var cosAngle = dp / (this.getLength() * v.getLength());
	return Math.acos (cosAngle); 
};
//取整
p.floor=function(){
	this.x = Math.round(this.x);
	this.y = Math.round(this.y);
	return this;
};
Vector.zero = new Vector(0,0);

})();