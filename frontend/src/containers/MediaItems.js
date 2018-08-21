import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { mediaList } from '../api';

const { Provider, Consumer } = React.createContext();

/**
 * A component which fetches a list of media items and provides them to its child. The props passed
 * are: query, error, isLoading and mediaItems. The component must have a single child and it
 * should be a function which renders a props object.
 */
class MediaItems extends Component {
  state = {
    // If non-null, an error returned from the last fetch
    error: null,

    // Is a fetch currently in flight?
    isLoading: false,

    // The current fetch query
    query: null,

    // The list of media items
    mediaItems: [],
  }

  componentDidMount() {
    this.fetchResults();
  }

  componentDidUpdate(prevProps) {
    if(
      (prevProps.search !== this.props.search) ||
      (prevProps.ordering !== this.props.ordering)
    ) {
      this.fetchResults();
    }
  }

  fetchResults() {
    const { search, ordering } = this.props;
    const query = { search, ordering };

    this.setState({ query, isLoading: true });
    mediaList(query)
      .then(response => {
        if(this.state.query === query) {
          this.setState({ isLoading: false, mediaItems: response.results, error: null });
        }
      })
      .catch(error => {
        if(this.state.query === query) {
          this.setState({ isLoading: false, mediaItems: [], error });
        }
      });
  }

  render() {
    const { query, isLoading, mediaItems, error } = this.state;
    const { children } = this.props;
    return children({ query, isLoading, mediaItems, error });
  }
}

MediaItems.propTypes = {
  /** Search query. */
  search: PropTypes.string,

  /** Ordering of results. */
  ordering: PropTypes.string,

  /** The child of MediaItems must be a function. */
  children: PropTypes.func.isRequired,
};

/**
 * A higher-order component wrapper which passes the media list to its child. The following props
 * are provided: isLoading, mediaItems, error and query.
 */
const withMediaList = WrappedComponent => props => (
  <Consumer>{ results => <WrappedComponent {...results} {...props} /> }</Consumer>
);

export { MediaItems, withMediaList };
export default MediaItems;
