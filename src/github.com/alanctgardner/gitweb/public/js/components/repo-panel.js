import React from 'react';
import {http} from 'http';
import github from 'github';

var PullPanel = React.createClass({
  render() {
    var pull = this.props.pull;
    return (
      <div>{pull.title}</div>
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
    return (
      <div>
        <div>Repo here: {params.id} {params.owner}/{params.name}</div>
        <div>
          {this.renderPulls()}
        </div>
      </div>
    );
  }
})
