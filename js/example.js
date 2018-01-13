var array = [
  ['Event', 'Room', 'Speaker', 'Theme'],
  ['conference', 'Mars', 'Cris Coyer', 'conference theme'],
  ['confere', 'Mars', 'Cris Co', 'conferenceT'],
  ['conf', 'Mars', 'Cris', 'conf.t.']
];

function writeTable() {
  var thead = $('#info_table thead'),
    tbody = $('#info_table tbody');

  $('#info_image').css('display', 'none');
  $('#info_table').css('display', 'block');

  var th = $('<tr></tr>').appendTo(thead);
  for (var j = 0; j < array.length; j++) {
    th.append('<td>' + array[0][j] + '</td>');
  }

  for (var i = 1; i < array.length; i++) {
    var tr = $('<tr></tr>').appendTo(tbody);

    for (var j = 0; j < array.length; j++) {
      tr.append('<td>' + array[i][j] + '</td>');
    }
  }
}
