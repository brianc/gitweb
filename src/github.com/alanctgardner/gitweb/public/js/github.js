import authStore from 'stores/auth-store';
import {http} from 'http';
import _ from 'lodash';
import moment from 'moment';
import async from 'async';

var token = function() {
  return authStore.token()
};

var path = function(...parts) {
  var part = parts.map(encodeURIComponent).join('/');
  return `https://api.github.com/${part}?access_token=${token()}`
};

var getLinks = function(xhr) {
  let links = {}
  let header = xhr.getResponseHeader('Link');
  if (!header) {
    return links;
  }
  let parts = header.split(',');
  parts.forEach(part => {
    let [link, type] = part.split(';');
    type = type.trim().replace(/"/ig, '').replace('rel=', '');
    link = link.trim().replace(/[<|>]/ig, '');
    links[type] = link;
  });
  return links;
};

var recursiveGet = function(path, items, cb) {
  http.get(path, (err, body, xhr) => {
    if (err) { return cb(err); }

    let links = getLinks(xhr);
    items = items.concat(body);
    if (links.next) {
      return recursiveGet(links.next, items, cb);
    }
    return cb(null, items);
  });
};

var getAll = function(path, cb) {
  path = `${path}&per_page=100&page=1`;
  return recursiveGet(path, [], cb);
};

var repoMap = repo => {
  var res = {};
  _.forIn(repo, (val, key) => {
    if (_.endsWith(key, '_url')) {
      return;
    }
    if (_.endsWith(key, '_at')) {
      res[key] = moment(val);
    } else {
      res[key] = val;
    }
  })
  return res;
};

export default {
  getRepos(cb) {
    let url = path('user', 'repos');
    return getAll(url, (err, res) => {
      let repos = _(res || [])
        .map(repoMap)
        .sortByOrder('pushed_at', false)
        .value();
      return cb(err, repos);
    });
  },
  getRepo(owner, name, cb) {
    let url = path('repos', owner, name);
    return http.get(url, cb)
  },
  getPullDetails(owner, name, id, cb) {
    let url = path('repos', owner, name, 'pulls', id);
    return http.get(url, cb);
  },
  getPulls(owner, name, cb) {
    let url = path('repos', owner, name, 'pulls');
    return getAll(url, cb);
    return getAll(url, (err, res) => {
      if (err || _.isEmpty(res)) { return cb(err, res); }
      let ids = res.map(pull => pull.number);
      async.map(ids, this.getPullDetails.bind(null, owner, name), (err, res) => {
        console.log('all repos!', res)
      });
    });
  },
  getPull(owner, name, number, cb) {
    let url = path('repos', owner, name, 'pulls', number);
    return http.get(url, cb);
  }
}
