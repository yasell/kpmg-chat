var host_server = 'http://localhost/bot/';
//var host_server = 'https://dizzain.us/030_bot/';
var accessToken = '38c297a52fa24eee9128c6a3afcae076';
//var accessToken = "6ef7fb1acb5f4e579bcf5e1208622c6a";
var baseUrl = 'https://api.api.ai/v1/';
var answerText = '';
var last_response = [];
var call_event = '';
var tips = [
  ['text', 0],
  ['text1', 1, showText]
];

$(document).ready(function() {

  $('#input').keypress(function(event) {
    if (event.which == 13) {
      event.preventDefault();
      send();
      $(this).blur();
    }
  });

  $('#input').focusin(function() {
    var sendBtn = $(this).siblings('.request__rec');
    sendBtn.addClass('request__rec--send');
  });

  $('#input').focusout(function() {
    var sendBtn = $(this).siblings('.request__rec');
    setTimeout(function() {
      sendBtn.removeClass('request__rec--send');
    }, 300);
  });

  $('#rec').click(function(event) {
    switchRecognition();

    if ($(this).hasClass('request__rec--send')) {
      event.preventDefault();
      send();
    }
  });

  $('#replay').click(function(event) {
    event.preventDefault();
    repeatText();
  });

  $('.tips button').click(function() {
    question = $(this).data('question');

    $('#input').val(question);
    send();
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
      event: {
        name: call_event,
        data: {}
      },
      query: call_event == '' ? text : '',
      lang: "en",
      sessionId: "somerandomthing"
    }),
    success: function(data) {
      call_event = '';
      last_response = data;
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
  $('.response__reply').remove();
  $('.tips ul > li').empty();
  $("#info_wrap, #info_wrap > *, #info_promo, #info_chat, #info_table").css('display', 'none');
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
      //showMessage('Look at this picture');
      showImage(value);
    }

    if (key == 'use_func') {
      window[value](data['result']['parameters']);
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
  if (last_response['result']['fulfillment']['speech'] != '') {
    answerText = last_response['result']['fulfillment']['speech'];
    sayText(answerText, 3, 1, 3);
    showMessage(answerText);


    //alert(data['result']['fulfillment']['speech']);
  }
}

function getOfficeByName(params) {
  showImage('reception_' + params['rooms'].toLowerCase() + '.png');
}

function getUserByName(params) {
  if (params['speaker'] == '') {
    return;
  }
  //showImage('reception_' + params['planets'].toLowerCase() + '.png');
  //SPEAKER_NAME  is currently in room ROOM_NAME. Here's how you can find him
  last_response['result']['fulfillment']['speech'] = last_response['result']['fulfillment']['speech'].replace("SPEAKER_NAME", params['speaker']);
  tmp_events = [];
  for (var i = 0; i < events.length; i++) {
    if (events[i]['speaker'] == params['speaker']) {
      tmp_events[tmp_events.length] = events[i];
    }
  }
  if (tmp_events.length) {
    last_response['result']['fulfillment']['speech'] = last_response['result']['fulfillment']['speech'].replace("ROOM_NAME", tmp_events[0]['room']) + '<br /> Would you like to send him SMS?';
    showImage('reception_' + tmp_events[0]['room'].toLowerCase() + '.png');
    showTable(tmp_events);
    call_event = 'SEND_SMS';
    showTips(tips);
  } else {
    last_response['result']['fulfillment']['speech'] = 'Sorry. I can\'t find him';
  }
  /*
   'time': 'September 09, 2018 09:00',
   'title': 'KPMG Welcome',
   'name': 'event',
   'speaker': 'Alex Krasner',
   'room': 'Mars',
  **/
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

function showTips(arr) {
  var list = $('.tips ul'),
    item = $('.tips ul > li');

  item.empty();

  for (var i = 0; i < arr.length; i++) {
    var name = arr[i][0],
      disabled = arr[i][1],
      arrFunc = arr[i][2],
      button = $('<button></button>').appendTo(item[i]);

    button.append(name);
    button.attr('data-question', name);
    button.attr('disabled', disabled==0);

    $('.tips button').click(function() {
      if (arrFunc !== undefined) {
        arrFunc();
        question = $(this).data('question');
        $('#input').val(question);
        send();
      } else {
        question = $(this).data('question');
        $('#input').val(question);
        send();
      }
    });
  }
}

function showText() {
  alert('Hi!');

	// var message = $("<p></p>").appendTo('#info_message');
	// message.append(text);
	// $("#info_wrap, #info_message").css('display', 'block');
}

function showMessage(text) {
  // var message = $("<p></p>").appendTo('#info_message');
  // message.append(text);

  var container = $(".response"),
  tips = $('.tips');
  messageWrapper = $('<div class="response__reply response__reply--answer"><button id="replay" class="response__replay--btn">Replay</button></div>').appendTo(container);

  messageWrapper.append(text).insertBefore(tips);
}

function showImage(value) {
  $("#info_wrap, #info_image").css('display', 'block');
  $('#info_image').attr("src", host_server + 'assets/images/' + value);
}

function showTable(array) {
  var
    tableTime = $("#info_table .table__time"),
    tableTitle = $("#info_table .table__title"),
    tableText = $("#info_table .table__content");

  tableTime.empty();
  tableTitle.empty();
  tableText.empty();

  for (var i = 0; i < array.length; i++) {
    var data = array[i],
      time = data.time,
      title = data.title,
      name = data.name;
    room = data.room;

    var timeTd = $("<p></p>").appendTo(tableTime[i]),
      titleTd = $("<p></p>").appendTo(tableTitle[i]),
      textTd = $("<p></p>").appendTo(tableText[i]);
    // roomTd = $("<p></p>").appendTo(tableTime[i]);

    timeTd.append(time);
    titleTd.append(title);
    textTd.append(name);
    // roomTd.append(room);
  }

  $("#info_table").css('display', 'block');
}

var events = [{
  'time': '09:00 - 11:00',
  'title': 'Managing consumer relationships',
  'name': 'The increase in priority attached to provenance branding, co-innovation with customers, embedding resources (including people) into export markets and developing a New Zealand integrity mark highlight the focus being placed on managing consumer relationships',
  'speaker': 'Alex Krasner',
  'room': 'Mars',
}, {
  'time': '09:30 - 12:15',
  'title': 'High quality trade agreements',
  'name': ' Leaders placed greater priority on securing high quality trade agreements, reflecting the shift in the trade environment as a result of Brexit and the election of President Trump. Industry leaders suggest free trade as we know it will only survive if everybody benefits, we must seek to combat social inequality and better disperse the benefits of trade to retain market access into the future',
  'speaker': 'Bill Smith',
  'room': 'Mercury',
}, {
  'time': '10:30 - 11:00',
  'title': 'Biotechnologies',
  'name': 'The conversation around biotechnologies has evolved, it is no longer about whether these technologies will be adopted given the benefits they can deliver, but about the regulatory framework that is needed to manage their application.',
  'speaker': 'Alex Krasner',
  'room': 'Mercury',
}, {
  'time': '11:00 - 14:10',
  'title': 'Leveraging data',
  'name': 'Concerns were expressed around how the sector is leveraging data that is being collected, with some leaders suggesting we are moving backwards comparatively to other countries. Companies are keeping close control over their data and seeking opportunities to monetise it, however without collaboration it is unlikely any significant financial benefits will crystallise.',
  'speaker': 'John Snow',
  'room': 'Uranus',
}];

var breaks = [{
    'time_from': '10:15',
    'time_to': '11:15',
  },
  {
    'time_from': '12:15',
    'time_to': '13:15',
  },
  {
    'time_from': '14:15',
    'time_to': '15:15',
  }

];

function getNextBreak() {
  shuffle(breaks);

  //showTable(breaks[0]);
  sayText(breaks[0]['time'] + ' ' + breaks[0]['title'], 3, 1, 3);
  showMessage('The next break is planned to be from ' + breaks[0]['time_from'] + ' till ' + breaks[0]['time_to']);
  //return breaks[0]['time'] + ' ' + breaks[0]['title'];
}

function getNextEvent() {
  shuffle(events);
  showTable(events);
  showMessage('Here\'s is the schedule for Mars');
  sayText('Here\'s is the schedule for Mars', 3, 1, 3);
  //return events[0]['time'] + ' ' + events[0]['title'];
}
