import React from 'react';
import bus from 'fluxed/bus';
import classNames from 'classnames';
import Router from 'react-router';

import repoStore from 'stores/repo-store';

var { Navigation } = Router;

export default React.createClass({
  name: 'RepoList',
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
