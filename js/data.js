(function(){
/**
 props 参数JSON格式为：{image:imgElem, up:[0,0,50,50], over:[50,0,50,50], down:[100,0,50,50], disabled:[150,0,50,50]}。
 */
var itemDataStruct = {
	//项目唯一ID
	id:0,
	//项目名称
	title:'俯卧撑',
	//图标
	pic:'btns.png',
	//类型，0为必须做，1为拒绝做
	type:0,
	//周期，单位天数
	period:1,

	//状态，0为还没有做，1为已经达成
	state:0,
	lasttime:0
};

var itemData = fp.itemData = function(props){
	this._data = [];
	
	//用户唯一身份ID
	this.uid = 0;
	this.url = 'local';
};

itemData.prototype.load = function(startdate,enddate){
	if (!startdate && !enddate) {
		//测试数据
		var items = [{
			id:1,
			title:'俯卧撑',
			pic:'btns.png',
			type:0,
			period:1,
			state:0,
			lasttime:0
		},{
			id:2,
			title:'11点睡觉',
			pic:'btns.png',
			type:0,
			period:1,
			state:0,
			lasttime:0
		},{
			id:3,
			title:'喝八杯水',
			pic:'btns.png',
			type:0,
			period:1,
			state:0,
			lasttime:0
		},{
			id:4,
			title:'出门擦鞋',
			pic:'btns.png',
			type:0,
			period:1,
			state:0,
			lasttime:0
		},{
			id:5,
			title:'阅读一小时',
			pic:'btns.png',
			type:0,
			period:1,
			state:0,
			lasttime:0
		},{
			id:6,
			title:'踮脚走路',
			pic:'btns.png',
			type:0,
			period:1,
			state:0,
			lasttime:0
		},{
			id:7,
			title:'7:00前吃饭',
			pic:'btns.png',
			type:0,
			period:1,
			state:0,
			lasttime:0
		},{
			id:8,
			title:'不说恶语',
			pic:'btns.png',
			type:1,
			period:1,
			state:0,
			lasttime:0
		}];
		return items;
	}
};

})();



var tweetEl = document.getElementById('tweets');
var db;

var callback = saveTweets;

function getTweets() {
	var script = document.createElement('script');
	script.src = 'http://search.twitter.com/search.json?q=html5 -RT&rpp=100&callback=saveTweets';
	document.body.appendChild(script);
}

// our Twitter API callback function
function saveTweets(tweets) {
	for (var i = 0; i < tweets.results.length; i++) {
		(function (tweet) {
			db.transaction(function (tx) {
				tx.executeSql('INSERT INTO tweets VALUES (?, ?, ?, ?)', [tweet.id, tweet.from_user, (new Date(Date.parse(tweet.created_at))).getTime() / 1000, tweet.text]); // div 1000 to get to seconds
			}
		);
		})(tweets.results[i]);
	}

	show('all');
}

function show(amount) {
	db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM tweets' + (amount != 'all' ? ' WHERE date > strftime("%s", "now", "-' + amount + ' minutes")' : ''), [], function (tx, results) {
			var html = [];
			tweetEl.innerHTML = '';
			document.querySelector('#found').innerHTML = ' (found: ' + results.rows.length + ')';
			if (results.rows && results.rows.length) {
				for (var i = 0; i < results.rows.length; i++) {
					html.push('<li>' + ify.clean(results.rows.item(i).text) + ' [posted ' + relative_time(results.rows.item(i).date*1000) + ']</li>');
				}
				tweetEl.innerHTML = html.join('');
			}
		});
	});
}

function setupDatabase() {
	if (!window.openDatabase) {
		tweetEl.innerHTML = '<li>Web SQL Database API is not available in this browser, please try nightly Opera, Webkit or Chrome.</li>';
		return;
	}
	db = openDatabase('firephoenix', '1.0', 'db of firephoenix', 2 * 1024 * 1024);
	db.transaction(function (tx) {
		tx.executeSql('DROP TABLE IF EXISTS tweets');
		tx.executeSql('CREATE TABLE IF NOT EXISTS items (id unique,uid, title, pic, type integer, period integer, state integer lasttime integer)');
	});
	getTweets();
}

setupDatabase();

