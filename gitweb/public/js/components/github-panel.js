import React from 'react';
import {http} from 'http'
import bus from 'fluxed/bus';
import Router from 'react-router';
import github from 'github';
var { Navigation } = Router;


import classNames from 'classnames';
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
    let { repo, active } = this.props;
    let classes = classNames({
      'list-group-item': true,
      active
    });
    return (
      <a className={classes} href={repo.html_url} onClick={this.onClick}>{repo.full_name}</a>
    );
  }
});

import repoStore from 'stores/repo-store';
var RepoList = React.createClass({
  mixins: [bus.mixin],
  getInitialState() {
    return {
      active: repoStore.active()
    };
  },
  on: {
    'repo-store-change'(msg) {
      console.log('changed', msg.store.active())
      this.setState({ active: msg.store.active() });
    }
  },
  isActive(repo) {
    let { owner, name } = this.state.active;
    return repo.owner.login == owner && repo.name == name;
  },
  renderRepos() {
    return this.props.repos.map((repo, i) => {
      var key = `repo-${i}`;
      return (<RepoListItem key={key} repo={repo} active={this.isActive(repo) }/>);
    });
  },
  render() {
    return (
      <div className='list-group'>{this.renderRepos()}</div>
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

