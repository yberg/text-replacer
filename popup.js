var x = function() {
  var a = document.createElement('a');
  a.className = 'delete';
  a.tabIndex = -1;
  var strong = document.createElement('strong');
  strong.style.fontSize = '24px';
  strong.innerHTML = '&times;';
  a.appendChild(strong);
  return a;
};

var input = function(className, value) {
  var div = document.createElement('div');
  div.className = 'input-field col s12';
  var input = document.createElement('input');
  input.type = 'text';
  input.className = className;
  input.value = value || "";
  if (value !== undefined) {
    input.className += ' valid';
  }
  if (className === 'find') {
    input.autofocus = true;
  }
  div.appendChild(input);
  return div;
};

var check = function(color) {
  var div = document.createElement('div');
  div.className = 'input-field col s12';
  var input = document.createElement('input');
  input.type = 'text';
  input.className = 'color';
  input.placeholder = '#hex color';
  input.value = color || "";
  if (color !== undefined) {
    input.className += ' valid';
  }
  div.appendChild(input);
  return div;
};

var row = function(values = '') {
  var tr = document.createElement('tr');

  var deleteButton = document.createElement('td');
  deleteButton.appendChild(x());
  var inputFind = document.createElement('td');
  inputFind.appendChild(input('find', values.find || undefined));
  var inputRepl = document.createElement('td');
  inputRepl.appendChild(input('repl', values.repl || undefined));
  var checkBox = document.createElement('td');
  checkBox.appendChild(check(values.color || undefined));

  tr.appendChild(deleteButton);
  tr.appendChild(inputFind);
  tr.appendChild(inputRepl);
  tr.appendChild(checkBox);
  return tr;
};

if (chrome.storage !== undefined) {
  var words = chrome.storage.sync.get('words', function(data) {
    if (data.words !== undefined) {
      data.words.forEach(function(wordPair) {
        $('tbody').append(row({
          find: wordPair[0],
          repl: wordPair[1],
          color: wordPair[2]
        }));
      });
    }
    $('tbody').append(row());
    return data.words;
  });
}
else {
  $('tbody').append(row());
}

$('body').on('input', 'input', function() {
  if ($('input.find').last().val() !== "") {
    var tr = row();
    $('tbody').append(tr);
  }
});

$('body').on('focus', 'input', function() {
  var remove = false;
  for (var i = $('input.find').length - 1; i >= 0; --i) {
    if ($('input.find').eq(i).val() === "") {
      if ($('input.repl').eq(i).val() === "") {
        if ($(this).parents().eq(2)[0] === $('tr').last()[0] ||
          (!$('input.find').eq(i).is(':focus') && !$('input.repl').eq(i).is(':focus'))) {
          if (!remove)
            remove = true;
          else
            $('input.find').parent().eq(i).parents()[1].remove();
        }
      }
    }
  }
  if ($(this).val() !== "") {
    $(this).parents().eq(2).after(row());
  }
});

var timeout;
$('form').submit(function(event) {
  event.preventDefault();

  $('i').show();
  clearTimeout(timeout);
  timeout = setTimeout(function() {
    $('i').hide();
  }, 1000);

  var words = Array();
  for (var i = 0; i < $('input.find').length; i++) {
    if ($('input.find').eq(i).val() !== "" && $('input.repl').eq(i).val() !== "") {
      var tmpColor = $('input.color').eq(i).val().replace(/ /g, '').split(',');
      if (tmpColor[0] === "")
        tmpColor = undefined;
      words.push([
        $('input.find').eq(i).val(),
        $('input.repl').eq(i).val(),
        tmpColor
      ]);
    }
  }

  if (chrome.storage !== undefined) {
    chrome.storage.sync.set({'words': words});
  }

  if (chrome.tabs !== undefined) {
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
      chrome.tabs.reload(arrayOfTabs[0].id);
    });
  }

  $('input').filter(function() {
    return this.value;
  }).addClass('valid');

  $('input.find:last').focus();

  return false;
});

$('body').on('click', 'a.delete', function(e) {
  if ($('a.delete').length === 1) {
    $('input').val("");
  }
  else {
    $(this).parents().eq(1).remove();
  }
  if ($('input.find').last().val() !== "") {
    $('tbody').append(row());
  }

  $('input.find:last').focus();
});