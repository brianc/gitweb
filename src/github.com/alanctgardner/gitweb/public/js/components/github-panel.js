import React from 'react';
import {http} from 'http'
import bus from 'fluxed/bus';
import Router from 'react-router';
var { Navigation } = Router;

var RepoListItem = React.createClass({
  mixins: [Navigation],
  onClick(e) {
    if (e.ctrlKey || e.shiftKey || e.metaKey) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    var repo = this.props.repo;
    var params = {
      owner: repo.owner.login,
      name: repo.name
    };
    this.transitionTo('repo-view', params)
  },
  render() {
    var repo = this.props.repo;
    return (
      <div onClick={this.onClick}>
        <a href={repo.html_url} onClick={this.onClick}>{repo.full_name}</a>
      </div>
    );
  }
});

var RepoList = React.createClass({
  renderRepos() {
    return this.props.repos.map(function(repo, i) {
      var key = `repo-${i}`;
      return (<RepoListItem key={key} repo={repo} />);
    });
  },
  render() {
    return (
      <div>{this.renderRepos()}</div>
    );
  }
});

export var GithubPanel = React.createClass({
  getInitialState() {
    return {
      repos: []
    };
  },
  componentDidMount() {
    var url = `https://api.github.com/user/repos?access_token=${this.props.token}&per_page=100`;
    http.get(url, (err, res) => {
      var repos = res.map(repo => {
        repo.updated_at = Date.parse(repo.updated_at);
        return repo;
      }).sort((a, b) => {
        return b.updated_at - a.updated_at;
      });

      this.setState({ repos:  repos });
    });
  },
  render() {
    return (
      <div className='github-panel'>
        <div className='repo-list-container'>
          <RepoList repos={this.state.repos} />
        </div>
        <div className='repo-details-container'>
          {this.props.children}
        </div>
      </div>
    );
  }
});

