import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

import AppBar from '../AppBar';
import MediaList from '../MediaList';

import CollectionDefaultImage from './collection-default-image.jpg';

import withRoot from './withRoot';

import SearchResultsProvider, { withSearchResults } from '../providers/SearchResultsProvider';

const MAX_COLLECTION_RESULTS = 3;

const MediaListSection = ({ title, MediaListProps, ...otherProps }) => (
  <section {...otherProps}>
    <Typography variant='headline' gutterBottom>
      { title }
    </Typography>
    <Typography component='div' paragraph>
      <MediaList
        GridItemProps={{ xs: 12, sm: 6, md: 4, lg: 3 }}
        maxItemCount={18}
        {...MediaListProps}
      />
    </Typography>
  </section>
);

const SearchResults = withSearchResults(({
  query, mediaResults, collectionResults, isLoading
}) => (
  <MediaListSection
    title="Search Results"
    contentLoading={isLoading}
  />
));

class IndexPage extends Component {
  constructor() {
    super()

    this.state = {
      latestMediaLoading: false,
      latestMediaResponse: null,
      query: null,
    }
  }

  componentWillMount() {
    this.fetchLatestMediaList();
  }

  fetchLatestMediaList() {
    this.setState({ latestMediaLoading: true });
    fetch('/api/media/', { credentials: 'include' }).then(r => r.json()).then(
      response => this.setState({
        latestMediaLoading: false,
        latestMediaResponse: response,
      })
    );
  }

  handleSearch(q) {
    this.setState({ query: { q } });
  }

  render() {
    const { classes } = this.props;
    const {
      latestMediaLoading, latestMediaResponse,
      searchResultMediaLoading, searchResultMediaResponse,
      searchResultCollectionsLoading, searchResultCollectionsResponse,
    } = this.state;

    let latestMedia;
    if(!latestMediaLoading && latestMediaResponse) {
      latestMedia = latestMediaResponse.media.map(item => {
        const { title, description, url, poster_image_url } = item;
        return { title, description, url, imageUrl: poster_image_url };
      });
    }

    let searchResultItems = [];

    if(!searchResultCollectionsLoading && searchResultCollectionsResponse) {
      searchResultItems = searchResultItems.concat(
        searchResultCollectionsResponse.collections.slice(0, MAX_COLLECTION_RESULTS).map(item => {
          const { title, description, url, poster_image_url } = item;
          return {
            label: 'Collection',
            title, description, url,
            imageUrl: poster_image_url || CollectionDefaultImage,
          };
        })
      );
    }

    if(!searchResultMediaLoading && searchResultMediaResponse) {
      searchResultItems = searchResultItems.concat(
        searchResultMediaResponse.media.map(item => {
          const { title, description, url, poster_image_url } = item;
          return { title, description, url, imageUrl: poster_image_url };
        })
      );
    }

    const renderedSearchResult= (
      searchResultMediaLoading ||
      searchResultCollectionsLoading ||
      searchResultMediaResponse ||
      searchResultCollectionsResponse
    ) ? (
      <MediaListSection
        title='Search Results'
        className={classes.mediaListSection}
        MediaListProps={{
          contentLoading: searchResultMediaLoading || searchResultCollectionsLoading,
          mediaItems: searchResultItems,
        }}
      />
    ) : null;

    return (
      <div className={ classes.page }>
        <AppBar onSearch={q => this.handleSearch(q)} />

        <div className={classes.body}>
          <SearchResultsProvider query={this.state.query}>
            <SearchResults />
          </SearchResultsProvider>

          { renderedSearchResult }

          <MediaListSection
            title='Latest Media'
            className={classes.mediaListSection}
            MediaListProps={{
              contentLoading: latestMediaLoading,
              mediaItems: latestMedia,
            }}
          />
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = theme => ({
  page: {
    minHeight: '100vh',
    width: '100%',
  },

  searchPaper: {
    padding: theme.spacing.unit * 4,
  },

  itemsPaper: {
    padding: theme.spacing.unit,
    margin: [[theme.spacing.unit * 2, 'auto']],
  },

  body: {
    // maxWidth: '960px',
    boxSizing: 'content-box',
    margin: [[0, 'auto']],
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit * 3,
  },

  mediaListSection: {
    marginBottom: theme.spacing.unit * 2,
  },
});

export default withStyles(styles)(withRoot(IndexPage));
