import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

import MediaList from '../components/MediaList';

const MediaListSection = ({
  component: Component, classes, title, contentLoading, mediaItems,
  maxItemCount, ...otherProps
}) => (
  <Component className={classes.root} {...otherProps}>
    <Typography variant='headline' gutterBottom>
      { title }
    </Typography>
    <Typography component='div' paragraph>
      <MediaList
        contentLoading={contentLoading}
        mediaItems={mediaItems}
        maxItemCount={maxItemCount}
      />
    </Typography>
  </Component>
);

MediaListSection.propTypes = {
  classes: PropTypes.object.isRequired,
  component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  title: PropTypes.string.isRequired,
  contentLoading: PropTypes.bool,
  mediaItems: PropTypes.array,
  maxItemCount: PropTypes.number,
};

MediaListSection.defaultProps = {
  component: 'section',
};

const styles = theme => ({
  root: { /* no default styling */ },
});

export default withStyles(styles)(MediaListSection);
