'use strict';

var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var Menu = electron.Menu;

const storage = require('electron-json-storage');

//require('crash-reporter').start();

var mainWindow = null;

// メインプロセス（受信側）
const {ipcMain} = require('electron'); // ipc通信を読み込む

app.on('window-all-closed', function() {
    if (process.platform != 'darwin') app.quit();
});

app.on('ready', function() {
	// メニューをアプリケーションに追加
	Menu.setApplicationMenu(menu);

	// ブラウザ(Chromium)の起動, 初期画面のロード
	// node-integrationをfalseにしないと
	mainWindow = new BrowserWindow({width: 800, height: 600, 'node-integration': false});
	mainWindow.loadURL('file://' + __dirname + '/view/index.html');

	// htmlの読み込みが終わったら
	mainWindow.webContents.on('did-finish-load', function() {
		// テスト用
	});

	// フロントエラー情報
	ipcMain.on('error', function(event, arg) {
		console.log('エラーが発生しました\n' + arg.message + '\nin:' + arg.file + '\nat: line' + arg.line + ':' + arg.col);
	});

	// 送信された情報
	ipcMain.on('input', function(event, arg) { // イベントバインディング
		// 過去のデータを読み出す
		storage.get('tipsData', function(error, data) {
			if (error) throw error;
			if(!data) data = {};
			// ロードしてid更新したら
			loadId(function(id) {
				var nextId = +id + 1;
				updateId(function(newId) {
					data[newId] = arg;
					// 新しいidでデータを書き込む！
					storage.set('tipsData', data, function (error) {
						if (error) throw error;
					});
				}, nextId);
			});
		});
	});

	// ページ遷移時
	ipcMain.on('pageChange', function(event, arg) {
		mainWindow.loadURL('file://' + __dirname + '/view/' + arg + '.html');
	});

	// データ取得
	ipcMain.on('getData', function(event, arg) {
		storage.get('tipsData', function (error, data) {
			if (error) throw error;

			if(arg) {
				var resultData = [];

				for(var i in data) {
					for(var category in data[i].category) {
						if(arg.category === data[i].category[category]) {
							resultData.push(data[i]);
						}
					}
				}
				data = resultData;
			}
			console.log('データ取得中' + data);
			// データをレンダラープロセスに送る
			mainWindow.webContents.send('returnData', data);
		});
	});

		ipcMain.on('deleteData', function(e, args) {
			storage.get('tipsData', function(error, data) {
				if(error) throw error;
				if(data) {
					delete data[args.id];
					storage.set('tipsData', data, function (error) {
						if (error) throw error;
						mainWindow.webContents.send('deleteComplete', data);
					});
				}
			})
		});

     // 終了
    mainWindow.on('closed', function() {
        mainWindow = null;
    });

});

function loadId(cb) {
	var id = 0;
	storage.get('id', function (error, data) {
		if (error) throw error;
		if(data.id) id = +data.id;
		cb(id);
	});
};

function updateId(cb, newId) {
	var data = {};
	data.id = newId;
	storage.set('id', data ,function (error) {
		if (error) throw error;
		cb(newId);
	});
};


// メニュー情報の作成
var template = [
	{
		label: 'ReadUs',
		submenu: [
			{label: 'Quit', accelerator: 'Command+Q', click: function () {app.quit();}}
		]
	}, {
		label: 'File',
		submenu: [
			{label: 'Open', accelerator: 'Command+O', click: function() {
				// 「ファイルを開く」ダイアログの呼び出し
				require('dialog').showOpenDialog({ properties: ['openDirectory']}, function (baseDir){
					if(baseDir && baseDir[0]) {
						openWindow(baseDir[0]);
					}
				});
			}}
		]
	}, {
		label: 'View',
		submenu: [
			{ label: 'Reload', accelerator: 'Command+R', click: function() { BrowserWindow.getFocusedWindow().reloadIgnoringCache(); } },
			{ label: 'Toggle DevTools', accelerator: 'Alt+Command+I', click: function() { BrowserWindow.getFocusedWindow().toggleDevTools(); } }
		]
	}
];

var menu = Menu.buildFromTemplate(template);
