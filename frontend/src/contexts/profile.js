import React, { Component } from 'react';

const { Provider, Consumer } = React.createContext();

class ProfileProvider extends Component {
  constructor() {
    super();
    this.state = { profile: null };
  }

  componentWillMount() {
    fetch('/api/profile', { credentials: 'include' }).then(r => r.json()).then(
      profile => this.setState({ profile })
    );
  }

  render() {
    const { profile } = this.state;
    const { children } = this.props;

    return (
      <Provider value={profile}>
        { children }
      </Provider>
    );
  }
}

const withProfile = Component => props => (
  <Consumer>{ value => <Component profile={value} {...props} />}</Consumer>
);

export { ProfileProvider, withProfile };
export default withProfile;
