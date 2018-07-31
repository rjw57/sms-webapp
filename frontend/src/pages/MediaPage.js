import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import { BASE_SMS_URL } from '../api';
import Page from '../components/Page';
import RenderedMarkdown from '../components/RenderedMarkdown';
import MediaItemProvider, { withMediaItem } from '../providers/MediaItemProvider';

/**
 * The media item page
 */
const MediaPage = ({ match: { params: { pk } }, classes }) => (
  <Page>
    <MediaItemProvider id={ pk }>
      <ConnectedMediaPageContents />
    </MediaItemProvider>
  </Page>
);

MediaPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      pk: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

const MediaPageContents = ({ item, classes }) => (
  <div>
    <section className={ classes.playerSection }>
      <div className={ classes.playerWrapper }>
        <iframe
          src={ (item && item.links) ? item.links.embedUrl : '' }
          className={ classes.player }
          frameBorder="0"
          allowFullScreen>
        </iframe>
      </div>
    </section>
    <section className={ classes.mediaDetails }>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Typography variant="headline" component="div">{ item ? item.title : '' }</Typography>
        </Grid>
        <Grid item xs={12}>
          <RenderedMarkdown source={ item ? item.description : '' }/>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subheading">
            {
              item && item.contentUrl
              ?
              <a target='_blank' className={ classes.link } href={ item.contentUrl } download>
                Download media
              </a>
              :
              null
            }
          </Typography>
        </Grid>
        <Grid item xs={6} style={{textAlign: 'right'}}>
          <Typography variant="subheading">
            {
              item && item.links && item.links.legacyStatisticsUrl
              ?
              <a className={ classes.link } href={ item.links.legacyStatisticsUrl }>
                Statistics
              </a>
              :
              null
            }
          </Typography>
        </Grid>
      </Grid>
    </section>
  </div>
);

MediaPageContents.propTypes = {
  classes: PropTypes.object.isRequired,
  item: PropTypes.object,
};

/* tslint:disable object-literal-sort-keys */
var styles = theme => ({
  mediaDetails: {
    marginTop: theme.spacing.unit * 2,
  },
  // The following rules specify that the player keep itself in 16:9 aspect ratio but is never
  // larger than 67.5% of the screen height. (We'll come back to why this isn't 66% in a bit.)
  // Our trick here is to use the fact that padding values are relative to an element's *width*. We
  // can force a particular aspect ratio by specifying a height of zero and a padding based on the
  // reciprocal of the aspect ratio. We also want the video to have a maximum height of 67.5vh (see
  // above). Since the padding value is a function of the width, we need to limit the maximum
  // *width* of the element, not the height. Fortunately we're doing all this jiggery-pokery to
  // keep a constant aspect ratio and so a maximum *height* of 67.5vh implies a maximum width of
  // 67.5vh * 16 / 9 = 120vh.
  //
  // The use of a 67.5% maximum height lets us keep the nice round figure for the maximum height.
  playerSection: {
    marginTop: theme.spacing.unit,
    backgroundColor: 'black',
    maxHeight: '67.5vh',
    overflow: 'hidden',  // since the player wrapper below can sometimes overhang
  },
  playerWrapper: {
    height: 0,
    margin: [[0, 'auto']],
    maxWidth: '120vh',
    paddingTop: '56.25%', // 16:9
    position: 'relative',
    width: '100%',
  },
  player: {
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  link: {
    color: theme.palette.text.secondary,
  },
});
/* tslint:enable */

const ConnectedMediaPageContents = withMediaItem(withStyles(styles)(MediaPageContents));

export default withMediaItem(withStyles(styles)(MediaPage));
