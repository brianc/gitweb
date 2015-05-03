import React from 'react';
import {http} from 'http';
import github from 'github';
import bus from 'fluxed/bus';

var PullPanel = React.createClass({
  render() {
    var pull = this.props.pull;
    console.log(pull)
    return (
      <div className='panel panel-default'>
        <div className='panel-heading'>
          <h3 className='panel-title'>
            <a href={pull.html_url}>{pull.title}</a>
          </h3>
        </div>
        <div className='panel-body' dangerouslySetInnerHTML={{__html: pull.body_html}}>
        </div>
      </div>
    );
  }
});

export var RepoPanel = React.createClass({
  getInitialState() {
    return {
      pulls: []
    };
  },
  getPulls(owner, name) {
    let msg = { repo: { owner, name } };
    bus.emit('active-repo-change', msg);
    github.getPulls(owner, name, (err, pulls) => {
      if (err) {
        return console.error(err);
      }
      this.setState({ pulls });
    });
  },
  componentDidMount() {
    let params = this.props.params;
    this.getPulls(params.owner, params.name);
  },
  componentWillReceiveProps(props) {
    this.setState({ pulls: [] });
    let params = props.params;
    this.getPulls(props.params.owner, props.params.name);
  },
  renderPulls() {
    return this.state.pulls.map(pull => {
      let key = 'pull-' + pull.id;
      return <PullPanel key={key} pull={pull} />
    });
  },
  render() {
    let params = this.props.params;
    let githubHref = `https://github.com/${params.owner}/${params.name}`;
    return (
      <div>
        <h1>
          <a href={githubHref}>{params.owner}/{params.name}</a>
        </h1>
        <div>
          {this.renderPulls()}
        </div>
      </div>
    );
  }
})
