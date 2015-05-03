import React from 'react';
import {http} from 'http'
import bus from 'fluxed/bus';
import Router from 'react-router';
import github from 'github';
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
    github.getRepos((err, repos) => {
      if (err) {
        return console.log('error fetching repos', err);
      }
      this.setState({ repos });
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

