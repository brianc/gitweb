import React from 'react';
import moment from 'moment';
import bus from 'fluxed/bus';

import github from 'github';

export default React.createClass({
  name: 'RepoPanel',
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
      console.log(pull)
      let updated = moment(pull.created_at).fromNow();
      return (
        <div key={key} className='panel panel-default pull-panel'>
          <div className='panel-heading'>
            <h3 className='panel-title'>
              <a href={pull.html_url}>@{pull.user.login} - {pull.title}</a>
            </h3>
            <div className='pull-right text-muted'>{updated}</div>
          </div>
          <div className='panel-body'>
            <div className='pull-panel-body' dangerouslySetInnerHTML={{__html: pull.body_html || ''}}>
            </div>
            <div className='pull-panel-links'>
              <div></div>
            </div>
          </div>
        </div>
      );
    });
  },
  render() {
    let { owner, name } = this.props.params;
    let githubHref = `https://github.com/${owner}/${name}`;
    return (
      <div className='repo-panel'>
        <h2 className='repo-panel-header'>
          <a href={githubHref}>{owner}/{name}</a>
        </h2>
        <div className='repo-panel-pull-list'>
          {this.renderPulls()}
        </div>
      </div>
    );
  }
})
