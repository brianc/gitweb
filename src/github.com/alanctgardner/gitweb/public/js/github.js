import authStore from 'stores/auth-store';
import {http} from 'http';
console.log(http)

var token = function() {
  return authStore.token()
};

var path = function(...parts) {
  var part = parts.map(encodeURIComponent).join('/');
  return `https://api.github.com/${part}?access_token=${token()}`
};

export default {
  getRepo(owner, name, cb) {
    let url = path('repos', owner, name);
    http.get(url, cb)
  },
  getPulls(owner, name, cb) {
    let url = path('repos', owner, name, 'pulls');
    http.get(url, cb);
  },
  getPull(owner, name, number, cb) {
    let url = path('repos', owner, name, 'pulls', number);
    http.get(url, cb);
  }
}
