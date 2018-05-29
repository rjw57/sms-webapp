import React, { Component } from 'react';

const { Provider, Consumer } = React.createContext();

class SearchResultsProvider extends Component {
  constructor() {
    super();
    this.state = {
      // A monotonic index which is used to determine if a response from the API server corresponds
      // to the most recent request.
      lastFetchIndex: 0,

      // The search results themselves.
      mediaResults: null,
      collectionResults: null,
      isLoading: false,
    };
  }

  componentWillMount() {
    // Handle the initial query.
    this.fetchResults();
  }

  componentDidUpdate(prevProps) {
    // If the query changed, fetch new results
    if(this.props.query !== prevProps.query) { this.fetchResults(); }
  }

  fetchResults() {
    const { query } = this.props;
    const { lastFetchIndex } = this.state;
    const fetchIndex = lastFetchIndex + 1;

    this.setState({ isLoading: true, lastFetchIndex: fetchIndex });

    // If there is no query, simply blank all results and return.
    if(query === null) {
      this.setState({ mediaResults: null, collectionResults: null, isLoading: false});
      return;
    }

    // Otherwise launch the query.
    Promise.all([
      fetch('/api/media/', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/collections/', { credentials: 'include' }).then(r => r.json()),
    ]).then((mediaResults, collectionResults) => {
      if(this.state.lastFetchIndex !== fetchIndex) { return; }
      this.setState({ mediaResults, collectionResults, isLoading: false });
    });
  }

  render() {
    const { mediaResults, collectionResults, isLoading } = this.state;
    const { query, children } = this.props;
    return (
      <Provider value={{query, mediaResults, collectionResults, isLoading}}>
        { children }
      </Provider>
    );
  }
}

const withSearchResults = Component => props => (
  <Consumer>{ results => <Component {...results} {...props} /> }</Consumer>
);

export { SearchResultsProvider, withSearchResults };
export default withSearchResults;
