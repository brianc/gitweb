import React from 'react';
import {http} from 'http'

export var RepoPanel = React.createClass({
  render() {
    let params = this.props.params;
    return (<div>Repo here: {params.owner}/{params.name}</div>)
  }
})
