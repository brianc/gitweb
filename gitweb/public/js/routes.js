import React from 'react';
import Router from 'react-router';
var { Route, RouteHandler } = Router;

import authStore from 'stores/auth-store';
import GithubPanel from 'components/github-panel';
import RepoPanel from 'components/repo-panel';

var TopNav = React.createClass({
  renderLoggedOut() {
    return (
      <li>
        <a href='/auth/login'>Login</a>
      </li>
    );
  },
  renderLoggedIn() {
    return (
      <li>
        <a href='/auth/logout'>logout</a>
      </li>
    );
  },
  render() {
    var contents = this.props.token ? this.renderLoggedIn() : this.renderLoggedOut();
    return (
      <div className='navbar navbar-default navbar-static-top top-nav'>
        <ul className='nav navbar-nav pull-right'>
          {contents}
        </ul>
      </div>
    );
  }
});

var App = React.createClass({
  getInitialState() {
    let token = authStore.token()
    return { token }
  },
  render() {
    return (
      <div className='app'>
        <div className='app-header'>
          <TopNav token={this.state.token} />
        </div>
        <RouteHandler />
      </div>
    );
  }
});

var Authenticated = React.createClass({
  statics: {
    willTransitionTo(transition, params, query) {
      var token = authStore.token()
      if (!token) {
        return transition.redirect('login')
      }
    }
  },
  render() {
    return (
      <div className='app-body'>
        <GithubPanel token={authStore.token()}>
          <RouteHandler />
        </GithubPanel>
      </div>
    );
  }
});

var Home = React.createClass({
  render() {
    return (<div>home</div>)
  }
});

var Login = React.createClass({
  render() {
    return (
      <h1>Must Log In</h1>
    );
  }
});

export var routes = (
  <Route handler={App}>
    <Route handler={Authenticated}>
      <Route path='/' handler={Home} />
      <Route path='/repo/:owner/:name' name='repo-view' handler={RepoPanel} />
    </Route>
    <Route handler={Login} name='login' path='/login' />
  </Route>
);
