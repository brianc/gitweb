var request = function (method, path, body, cb) {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = state => {
    if (xhr.readyState != 4) return;
    return cb(null, JSON.parse(xhr.responseText), xhr);
  }
  xhr.open(method, path);
  xhr.setRequestHeader('Accept', 'application/vnd.github.moondragon+json')
  xhr.send(body ? JSON.stringify(body) : null);
};

export var http = {
  get(path, cb) {
    request('GET', path, null, cb);
  }
};
