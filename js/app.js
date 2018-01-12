//var host_server = 'http://localhost/bot/';
var host_server = 'https://dizzain.us/030_bot/';
//var host_server = 'https://medcatalog.by/bot/';
var accessToken = "38c297a52fa24eee9128c6a3afcae076";
var baseUrl = "https://api.api.ai/v1/";
var answerText = '';

$(document).ready(function() {
	$("#input").keypress(function(event) {
		if (event.which == 13) {
			event.preventDefault();
			send();
			$(this).blur();
		}
	});
	$("#rec").click(function(event) {
		switchRecognition();

		if ($(this).hasClass('request__rec--send')) {
			event.preventDefault();
			send();
		}
	});
	$("#replay").click(function(event) {
		event.preventDefault();
		repeatText();
	});
	$("#input").focusin(function() {
		var sendBtn = $(this).siblings(".request__rec");
		sendBtn.addClass("request__rec--send");
	});
	$("#input").focusout(function() {
		var sendBtn = $(this).siblings(".request__rec");
		setTimeout(function() {
			sendBtn.removeClass("request__rec--send");
		}, 300);
	});

	var viewportHeight = $('.page-wrapper').outerHeight();
	$('.page-wrapper').css('height', viewportHeight);
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
			$("#input").val("");

			if (chatWrapper.html().trim() === '') {
				var chat = $("<p></p>").appendTo(chatWrapper);
				chat.append(text);
				chatWrapper.css('display', 'block');
			} else {
				chatWrapper.empty();
				setTimeout(function() {
					var chat = $("<p></p>").appendTo(chatWrapper);
					chat.append(text);
					chatWrapper.css('display', 'block');
				}, 100);
			}
		},
		error: function() {
			setResponse("Internal Server Error");
		}
	});
	setResponse("Loading...");
	$('#info_message').removeClass('response__reply--answer');
	$('#info_message > p').remove();
	$("#info_wrap, #info_wrap > *, .response__chat").css('display', 'none');
}

function setResponse(val) {
	$("#response").text(val);
}

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
			showMessage('Look at this picture');
			showImage(value);
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
		showMessage();
		answerText = data['result']['fulfillment']['speech'];

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

function repeatText() {
	sayText(answerText, 3, 1, 3);
}

function showMessage(text) {
	var message = $("<p></p>").appendTo('#info_message');
	message.append(text);
	$("#info_wrap, #info_message").css('display', 'block');
	$("#info_message").addClass('response__reply--answer').css('display', 'block');
}

// function showText(text) {
// 	var message = $("<p></p>").appendTo('#info_message');
// 	message.append(text);
// 	$("#info_wrap, #info_message").css('display', 'block');
// }

function showImage(value) {
	$("#info_wrap, #info_image").css('display', 'block');
	$('#info_image').attr("src", host_server + 'assets/images/' + value);
}

function showTable(array) {
	var
		tableTime = $("#info_table .table__time"),
		tableTitle = $("#info_table .table__title"),
		tableText = $("#info_table .table__content");

	for (var i = 0; i < array.length; i++) {
		var data = array[i],
			time = data.time,
			title = data.title,
			name = data.name;

		var timeTd = $("<p></p>").appendTo(tableTime[i]),
			titleTd = $("<p></p>").appendTo(tableTitle[i]),
			textTd = $("<p></p>").appendTo(tableText[i]);

		timeTd.append(time);
		titleTd.append(title);
		textTd.append(name);
		console.log();
	}

	$("#info_wrap, #info_table").css('display', 'block');
}

var events = [{
	'time': 'September 09, 2018 09:00',
	'title': 'KPMG Welcome',
	'name': 'event'
}, {
	'time': 'September 19, 2018 09:30',
	'title': 'Keynote: Business Advice',
	'name': 'Two days of learning'
}, {
	'time': 'November 09, 2018 10:30',
	'title': 'The transformation of business',
	'name': 'Two days of learning from top product management'
}, {
	'time': 'November 09, 2018 11:00',
	'title': 'The Economics of a Digital Labor Force',
	'name': 'Two days of learning from top product management and innovation executives'
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
