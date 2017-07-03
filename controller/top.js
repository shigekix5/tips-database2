var $ = jQuery = require("jquery/dist/jquery.js");

const ipcRenderer = require('electron').ipcRenderer;

function ConvertDateToString(year, month, date) {
	month = month >= 10 ? month : '0' + month;
	date  = date  >= 10 ? date  : '0' + date;
	return String(year) + '-' + String(month) + '-' + String(date);
};

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

	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var date = date.getDate();
	$('.date input').val(ConvertDateToString(year, month, date));


	$('.btn-primary').click(function() {
		var $form = $('.form-control')
		var description = $form.val();
		$form.val('');
		var category = [];
		$('input[type="checkbox"]').filter(':checked').each(function(i, el) {
			category[i] = $(el).attr('category');
		});

		var date = new Date($('.date input').val());
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var date = date.getDate();

		var time = {
			'year': year,
			'month': month,
			'date': date
		};

		var sendData = {
			'description': description,
			'category': category,
			'time': time
		};
		ipcRenderer.send('input', sendData); // sendSyncにするとレンダープロセスが止まるので注意
	});

	$('.btn-tips').click(function() {
		$('.nav-group-item').removeClass('active');
		$(this).addClass('active');
		ipcRenderer.send('pageChange', 'result');
	});

	$('.input-view .icon-plus-circled').click(function() {
		//TODO 回転させるとオシャレ
		
	});

});
