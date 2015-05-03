import store from 'fluxed/store';

export default store('repo', {
  active: { owner: null, name: null },
  on: {
    'active-repo-change'(msg) {
      this.setState({ active: msg.repo });
    }
  }
});
