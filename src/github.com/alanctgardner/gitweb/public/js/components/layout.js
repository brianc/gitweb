import React from 'react';
import {Sub} from 'js/components/sub';

export class Layout {
  render() {
    return (
      <div><Sub text={this.props.text} /></div>
    )
  }
}
