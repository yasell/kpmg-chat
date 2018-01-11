var host_server = 'https://dizzain.us/030_bot/';
var accessToken = "38c297a52fa24eee9128c6a3afcae076";
var baseUrl = "https://api.api.ai/v1/";

$(document).ready(function() {
	$("#input").keypress(function(event) {
		if (event.which == 13) {
			event.preventDefault();
			send();
		}
	});
	$("#rec").click(function(event) {
		switchRecognition();
	});
	$('#rec.request__rec--send').click(function(event) {
		event.preventDefault();
		send();
	});
	$("#input").focusin(function(e) {
		$(this).siblings("#rec").addClass("request__rec--send");
	});
	$("#input").focusout(function() {
		$(this).siblings("#rec").removeClass("request__rec--send");
	});
});

var recognition;

function startRecognition() {
	recognition = new webkitSpeechRecognition();
	recognition.onstart = function(event) {
		updateRec();
	};
	recognition.onresult = function(event) {
		var text = "";
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			text += event.results[i][0].transcript;
		}
		setInput(text);
		stopRecognition();
	};
	recognition.onend = function() {
		stopRecognition();
	};
	recognition.lang = "en-US";
	recognition.start();
}

function stopRecognition() {
	if (recognition) {
		recognition.stop();
		recognition = null;
	}
	updateRec();
}

function switchRecognition() {
	if (recognition) {
		stopRecognition();
	} else {
		startRecognition();
	}
}

function setInput(text) {
	$("#input").val(text);
	send();
}

function updateRec() {
	$("#rec").text(recognition ? "Stop" : "Speak");
}

function send() {
	var text = $("#input").val();
	var chatWrapper = $('.response__chat');

	$.ajax({
		type: "POST",
		url: baseUrl + "query?v=20150910",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		headers: {
			"Authorization": "Bearer " + accessToken
		},
		data: JSON.stringify({
			query: text,
			lang: "en",
			sessionId: "somerandomthing"
		}),
		success: function(data) {
			setResponse(JSON.stringify(data, undefined, 2));
			gotResponse(data);
			$('.request__wrapper form').trigger('reset');

			if (chatWrapper.html().trim() === '') {
				var chat = $('<p></p>').appendTo(chatWrapper);
				chat.append(text);
			} else {
				chatWrapper.empty();
				setTimeout(function() {
					var chat = $('<p></p>').appendTo(chatWrapper);
					chat.append(text);
				}, 100);
			}
		},
		error: function() {
			setResponse("Internal Server Error");
		}
	});
	setResponse("Loading...");
}

function setResponse(val) {
	$("#response").text(val);
}

// function writeTable(array) {
// 	var thead = $('#info_table thead');
// 	var tbody = $('#info_table tbody');
//
// 	$('#info_image').css('display', 'none');
// 	$('#info_table').css('display', 'block');
//
// 	thead.empty();
// 	tbody.empty();
//
// 	var th = $('<tr></tr>').appendTo(thead);
// 	for (var j = 0; j < array[0].length; j++) {
// 		th.append('<td>' + array[0][j] + '</td>');
// 	}
//
// 	for (var i = 1; i < array.length; i++) {
// 		var tr = $('<tr></tr>').appendTo(tbody);
//
// 		for (var j = 0; j < array[0].length; j++) {
// 			tr.append('<td>' + array[i][j] + '</td>');
// 		}
// 	}
// }

function gotResponse(data) {
	switch (data['result']['action']) {
		case 'current_location':
			{
				show_current_location(data['result']);
				break;
			}
		default:
			{
				//alert(data['result']['action']);
			}
	}
	$.each(data['result']['parameters'], function(key, value) {
		if (key == 'image') {
			$('#info_image').attr("src", host_server + 'assets/images/' + value);
			$('#info_image').css('display', 'block');
			$('.response__request').css('display', 'block');
			$('#info_table').css('display', 'none');
		}
		if (key == 'table') {
			//$('#info_image').attr("src", host_server + 'assets/images/' + value);
			//$('#info_table').css('display', 'none');
			if (value == 'next_break') {
				getNextBreak();
			}
			if (value == 'event') {
				getNextEvent();
			}
		}
	});
	if (data['result']['fulfillment']['speech'] != '') {
		sayText(data['result']['fulfillment']['speech'], 3, 1, 3);
		//alert(data['result']['fulfillment']['speech']);
	}
}

function show_current_location(data) {

}

function shuffle(a) {
	var j, x, i;
	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
}

// function writeTable(array) {
// 	var
// 		timeTd = ('#info_table .table__time'),
// 		titleTd = $('#info_table .table__title'),
// 		textTd = $('#info_table .table__content');
//
// 	var th = $('<p></p>').appendTo(timeTd);
// 	for (var j = 1; j < array.length; j++) {
// 		var data = array[j],
// 			time = data.time,
// 			title = data.title,
// 			name = data.name;
//
// 		th.append(time);
// 	}
//
// 	$('#info_image').css('display', 'none');
// 	$('#info_table').css('display', 'block');
// }

var events = [{
	'time': 'September 09, 2018 09:00',
	'title': 'KPMG Welcome',
	'name': 'event'
}, {
	'time': 'September 19, 2018 09:30',
	'title': 'Keynote: Business Advice',
	'name': 'event'
}, {
	'time': 'November 09, 2018 10:30',
	'title': 'The transformation of business',
	'name': 'event'
}, {
	'time': 'November 09, 2018 11:00',
	'title': 'The Economics of a Digital Labor Force',
	'name': 'event'
}];

var breaks = [{
		'time': 'November 09, 2018 10:15',
		'title': 'Break',
		'name': 'break'
	},
	{
		'time': 'November 09, 2018 12:15',
		'title': 'Break',
		'name': 'break'
	},
	{
		'time': 'November 09, 2018 14:15',
		'title': 'Break',
		'name': 'break'
	},
	{
		'time': '',
		'title': 'No more events or breaks are available for today',
		'name': 'break'
	}

];

function getNextBreak() {
	shuffle(breaks);

	writeTable([
		['Next Break'],
		[breaks[0]['time'] + ' ' + breaks[0]['title']]
	]);
	sayText(breaks[0]['time'] + ' ' + breaks[0]['title'], 3, 1, 3);
	//return breaks[0]['time'] + ' ' + breaks[0]['title'];
}

function getNextEvent() {
	shuffle(events);
	writeTable([
		['Room', 'Time'],
		['Mars', events[0]['time'] + ' ' + events[0]['title']]
	]);
	sayText(events[0]['time'] + ' ' + events[0]['title'], 3, 1, 3);
	//return events[0]['time'] + ' ' + events[0]['title'];
}
