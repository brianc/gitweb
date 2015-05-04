import React from 'react';

import github from 'github';
import RepoList from 'components/repo-list';

export default React.createClass({
  name: 'GithubPanel',
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

