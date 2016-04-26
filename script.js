var format = function(word, colors) {
  var string = "";
  for (var i = 0; i < word.length; i++) {
    string += "<span style='color: " + colors[i%colors.length] + "'>" + word.charAt(i) + "</span>";
  }
  return string;
};

var image = function(word, image) {
  return  word +
    "<span style='position:relative;top:-5px'>" +
      "<img src='" + image + "' width='20em'>" +
    "</span>";
}

chrome.storage.sync.get('words', function(data) {
  var words = data.words;
  if (words === undefined)
    words = Array();

  var queue = [document.body];
  var curr, word, replace, color;

  String.prototype.replaceAll = function(find, replace) {
    var target = this;
    return target.replace(new RegExp(find, 'g'), replace);
  };

  while (curr = queue.pop()) {
    words.forEach(function(wordPair) {
      word = wordPair[0];
      if (curr.textContent.match(word)) {
        color = wordPair[2];
        replace = wordPair[1];
        if (color !== null && color !== undefined) {
          replace = format(replace, color);
        }
        for (var i = 0; i < curr.childNodes.length; ++i) {
          switch (curr.childNodes[i].nodeType) {
            case Node.TEXT_NODE : // 3
              if (curr.childNodes[i].textContent.match(word)) {
                curr.innerHTML = curr.innerHTML.replaceAll(word, replace);
              }
              break;
            case Node.ELEMENT_NODE : // 1
              queue.push(curr.childNodes[i]);
              break;
          }
        }
      }
    });
  }
});
