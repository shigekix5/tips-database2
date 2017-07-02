var $ = jQuery = require("jquery/dist/jquery.js");

// サーバ？側からデータを受け取る
const ipcRenderer = require('electron').ipcRenderer;

function UpdateContents(event, data) {
	var $resultView = $('.prt-result-table tbody');
	$resultView.html('');
	//TODO テンプレートに作り変えたい
	$.each(data, function(i, el) {
			var html = '<tr tip-id="' + i + '"><td>' + el.time.year + '.' + el.time.month + '.' + el.time.date
			+ '</td><td class="description">' + el.description + '</td><td>';
			$.each(el.category, function(j, c) {
					html += '<span class="category">' + c + '</span>';
			});
			html += '</td><td>';
			html += '<form onsubmit="return false;"><input type="submit" value="削除" class="btn-delete"></form>';
			html += '</td></tr>';
			$resultView.append(html);
	});

	 $('span').click(function() {
			var type = $(this).attr('class');
			ipcRenderer.send('getData', {'category': $(this).text()});
	});

	$('.btn-delete').click(function() {
		var $tip = $(this).parents('tr');
		var tipId = $tip.attr('tip-id');
		var description = $tip.find('td.description').text();

		 if(window.confirm('Tip 「' + description + '」を削除してもよろしいですか？')) {
			ipcRenderer.send('deleteData', {'id': tipId});

			ipcRenderer.on('deleteComplete', function(e, data) {
				UpdateContents(null, data);
			});
		 }
 });
}

// ready
$(function(){
	window.onerror = function(message, file, line, col, error) {
		var error = {
			'message': message,
			'file': file,
			'line': line,
			'col': col,
			'error': error
		};
		ipcRenderer.send('error', error);
	};

	$('.btn-top').click(function() {
		$('.nav-group-item').removeClass('active');
		$(this).addClass('active');
		ipcRenderer.send('pageChange', 'index');
	});

	ipcRenderer.send('getData');
	ipcRenderer.on('returnData', function(event, data){
		UpdateContents(event, data);
	});

	$('.btn-tips').click(function() {
		$('.nav-group-item').removeClass('active');
		$(this).addClass('active');
		ipcRenderer.send('pageChange', 'result');
	});

	$('.btn-search').click(function() {
		var keyWord = $('#search-box').val();
		ipcRenderer.send('getData', {'category': keyWord});
	});

});
