(function(){
	var fp = window.fp = window.fp || {
		selectedItems : {}
	};
})();


//计算给定的原子核在画布上的子原子可用的角度空间
(function(){
var RadSpace= fp.RadSpace = function(
	x0,y0,r,subr,contrainerWidth,contrainerHeight) {

	var lpadding = subr + 5;
	var ww = contrainerWidth - subr - 5,hh=contrainerHeight - subr - 5;
	var pi2 = Math.PI * 2;
	var ro = Math.PI / 180;

	//如果不贴边，则可以360度部署子原子
	if (x0+r < ww && x0-r > lpadding && y0+r < hh && y0-r > lpadding) {
		return {startRad:0,radSpace:pi2,fangxiang:1}
	}

	var b,A,A1,A2,fantxiang=1;

	//右贴边
	if (x0 + r > ww && y0+r < hh && y0 - r >0) {
		b = ww - x0 - lpadding;
		A1 = Math.acos(b/r);
		AA = pi2 - A1 * 2;
		return {startRad:A1,radSpace:AA,fangxiang:1};
	}

	//右上贴角
	if (x0 + r > ww && y0 - r < lpadding) {
		b = y0 ;
		A = Math.acos(b/r);
		A1 = A + 90 * ro;

		b = ww - x0 ;
		AA = pi2 - A1 - Math.acos(b/r);

		return {startRad:A1,radSpace:AA,fangxiang:1};
	}

	//上贴边
	if (x0 + r < ww && x0 - r > lpadding && y0 - r < lpadding) {
		b = y0  - lpadding;
		A = Math.acos(b/r);
		A1 = A + 90 * ro;
		AA = pi2 - A * 2;
		return {startRad:A1,radSpace:AA,fangxiang:1};
	} 
	//右下贴角
	if (x0 + r > ww && y0 + r > hh) {
		b = ww - x0 ;
		A1 = Math.acos(b/r);

		b = hh - y0 ;
		AA = pi2 - A1 - Math.acos(b/r) - 90*ro;

		return {startRad:A1,radSpace:AA,fangxiang:1};
	}

	fangxiang = -1;
	//左上
	if (x0 - r < lpadding && y0 - r < lpadding) {
		b = y0 - lpadding;
		A = Math.acos(b/r);
		A1 = 90 * ro - A;

		b = x0 - lpadding;
		AA = pi2 - A - 90 * ro - Math.acos(b/r);

		return {startRad:A1,radSpace:AA,fangxiang:-1};
	}
	
	//左贴边
	if (x0 - r < lpadding && y0 - r > lpadding && y0+r < hh) {
		b = x0 - lpadding;
		A = Math.acos(b/r);
		A1 = 180 * ro - A; 


		AA = pi2 - A * 2;
		return {startRad:A1,radSpace:AA,fangxiang:-1};
	}

	//左下
	if (x0 - r < lpadding && y0 + r > hh) {
		b = x0 - lpadding;
		A = Math.acos(b/r);
		A1 = 180 * ro - A;

		b = hh - y0 -lpadding;
		AA = pi2 - A - 90 * ro - Math.acos(b/r);

		return {startRad:A1,radSpace:AA,fangxiang:-1};
	}

	//下贴边
	if (x0 + r < ww && x0 - r > lpadding && y0 + r > hh) {
		b = hh - y0 - lpadding;
		A = Math.acos(b/r);
		A1 = 270 * ro - A;
		AA = pi2 - A * 2;

		return {startRad:A1,radSpace:AA,fangxiang:-1};
	}
}
})();
