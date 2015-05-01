import React from 'react';
import {http} from 'http'

var Button = React.createClass({
  render() {
    return (<button onClick={this.props.onClick}>{this.props.text}</button>);
  }
});

var RepoListItem = React.createClass({
  onClick(e) {
    if (e.ctrlKey || e.shiftKey || e.metaKey) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
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

var RepoDetails = React.createClass({
  render() {
    if (!this.props.repo) {
      return (<h3>Select a repo</h3>);
    }
    return (
      <div>yup</div>
    );
  }
});

var GithubPanel = React.createClass({
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
          <RepoDetails repo={this.state.repo} />
        </div>
      </div>
    );
  }
});

export var Layout = React.createClass({
  getInitialState() {
    var token = document.cookie.split('oauth=')[1];
    return {
      auth: !!token,
      token: token
    };
  },
  componentDidMount() {
    if (this.state.token) {
      return;
    }
    this.setState({ auth: 'LOADING' });
    http.get('/auth/status', (err, res) => {
      var token = document.cookie.split('oauth=')[1];
      this.setState({ auth: res.loggedIn, token: token });
    });
  },
  onLogInClick() {
    window.location = '/auth/login';
  },
  renderContent() {
    if (this.state.auth === false) {
      return (<Button text='Log In' onClick={this.onLogInClick}/>);
    }
    if (this.state.auth == 'LOADING') {
      return (<div>Loading...</div>);
    }
    return (
      <GithubPanel token={this.state.token} />
    );
  },
  render() {
    return (
      <div className='app'>
        <div className='app-header'>
          <h3>header</h3>
        </div>
        <div className='app-body'>
          <GithubPanel token={this.state.token} />
        </div>
      </div>
    );
  }
});
