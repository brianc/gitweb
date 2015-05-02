import React from 'react';
import {http} from 'http'
import bus from 'fluxed/bus';

import * as router from 'react-router';
var Router = router.default;
var { Route, Link, RouteHandler } = Router;


console.log('token', authStore.token())

var Button = React.createClass({
  render() {
    return (<button onClick={this.props.onClick}>{this.props.text}</button>);
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
