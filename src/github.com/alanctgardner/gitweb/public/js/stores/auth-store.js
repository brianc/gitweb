import store from 'fluxed/store';

export default store('auth', {
  token() {
    var token = document.cookie.split('oauth=')[1];
    return token;
  }
});
