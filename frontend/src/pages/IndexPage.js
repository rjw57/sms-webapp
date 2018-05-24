import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

import MediaListSection from '../components/MediaListSection';
import SearchForm from '../components/SearchForm';

import CollectionDefaultImage from './collection-default-image.jpg';

import withRoot from '../withRoot';

import withProfile from '../contexts/profile';

const MAX_COLLECTION_RESULTS = 3;

const ProfileButton = withProfile(({ profile, ...otherProps }) => {
  if(!profile) { return null; }

  if(profile.is_anonymous) {
    return (
      <Button component='a' href={profile.urls.login} {...otherProps}>Login</Button>
    );
  }

  return (<Button {...otherProps}>{ profile.username }</Button>);
});

class IndexPage extends Component {
  constructor() {
    super()

    this.state = {
      latestMediaLoading: false,
      latestMediaResponse: null,

      searchResultMediaLoading: false,
      searchResultMediaResponse: null,

      searchResultCollectionsLoading: false,
      searchResultCollectionsResponse: null,
    }
  }

  componentWillMount() {
    this.fetchLatestMediaList();
  }

  fetchLatestMediaList() {
    this.setState({ latestMediaLoading: true });
    fetch('/api/media', { credentials: 'include' }).then(r => r.json()).then(
      response => this.setState({
        latestMediaLoading: false,
        latestMediaResponse: response,
      })
    );
  }

  search(query) {
    const params = new URLSearchParams();
    params.append('search', query);

    this.setState({ searchResultMediaLoading: true });
    fetch('/api/media?' + params, { credentials: 'include' }).then(r => r.json()).then(
      response => this.setState({
        searchResultMediaLoading: false,
        searchResultMediaResponse: response,
      })
    );

    this.setState({ searchResultCollectionsLoading: true });
    fetch('/api/collections?' + params, { credentials: 'include' }).then(r => r.json()).then(
      response => this.setState({
        searchResultCollectionsLoading: false,
        searchResultCollectionsResponse: response,
      })
    );
  }

  handleSubmit(event) {
    event.preventDefault();

    const formElement = event.target;
    const inputElement = Array.from(formElement.elements).filter(element => element.name === 'q')[0];
    if(!inputElement) { return; }

    const query = inputElement.value;
    if(!query) { return; }
    this.search(query);
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
        contentLoading={searchResultMediaLoading || searchResultCollectionsLoading}
        mediaItems={searchResultItems}
        classes={{ root: classes.section }}
        maxItemCount={18}
      />
    ) : null;

    return (
      <div className={ classes.page }>
        <AppBar position="static">
          <Grid container component={Toolbar} classes={{root: classes.toolBarRoot}}>
            <Hidden smDown>
              <Grid item xs={2} className={classes.toolBarLeft}>
                <Typography variant="title" color="inherit">
                  Media&nbsp;Service
                </Typography>
              </Grid>
            </Hidden>
            <Grid item md={8} xs={9} className={classes.toolBarMiddle}>
              <SearchForm
                classes={{root: classes.searchFormRoot}}
                onSubmit={event => this.handleSubmit(event)}
                InputProps={{
                  placeholder: 'Search', name: 'q',
                }}
              />
            </Grid>
            <Grid item md={2} xs={3} className={classes.toolBarRight}>
              <ProfileButton color='inherit' />
            </Grid>
          </Grid>
        </AppBar>

        <div className={classes.body}>

          { renderedSearchResult }

          <MediaListSection
            title='Latest Media'
            contentLoading={latestMediaLoading}
            mediaItems={latestMedia}
            classes={{ root: classes.section }}
            maxItemCount={12}
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
    maxWidth: '960px',
    boxSizing: 'content-box',
    margin: [[0, 'auto']],
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3,
    paddingTop: theme.spacing.unit * 3,
  },

  section: {
    marginBottom: theme.spacing.unit * 2,
  },

  toolBarRoot: {
  },

  toolBarLeft: {
    display: 'flex',
    justifyContent: 'flex-start',
    paddingRight: theme.spacing.unit * 3,
  },

  toolBarMiddle: {
    display: 'flex',
    justifyContent: 'center',
  },

  toolBarRight: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingLeft: theme.spacing.unit * 3,
  },

  searchFormRoot: {
    maxWidth: '960px',
    flexBasis: '960px',

  },
});

export default withStyles(styles)(withRoot(IndexPage));
