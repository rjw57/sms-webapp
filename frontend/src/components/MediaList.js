import React from 'react';
import PropTypes from 'prop-types';

import ButtonBase from '@material-ui/core/ButtonBase';
import Grid from '@material-ui/core/Grid';

import { withStyles } from '@material-ui/core/styles';

import MediaItemCard from './MediaItemCard';
import MediaItemCardContentLoader from './MediaItemCardContentLoader';

const MediaList = ({ classes, maxItemCount, contentLoading, mediaItems }) => {
  let mediaItemComponents;

  if(!contentLoading) {
    mediaItemComponents = mediaItems.slice(0, maxItemCount).map(item => (
      <ButtonBase
        classes={{root: classes.buttonRoot}}
        component='a'
        href={item.url}
      >
        <MediaItemCard
          classes={{root: classes.itemRoot}}
          title={item.title}
          description={item.description}
          imageSrc={item.imageUrl}
          label={item.label}
          elevation={0}
        />
      </ButtonBase>
    ));
  } else {
    mediaItemComponents = Array(maxItemCount || 6).fill(null).map(() => (
      <MediaItemCardContentLoader />
    ));
  }

  return (
    <Grid container spacing={16}>
      { mediaItemComponents.map((item, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>{ item }</Grid>
      )) }
    </Grid>
  );
}

MediaList.propTypes = {
  classes: PropTypes.object.isRequired,
  maxItemCount: PropTypes.number,
  contentLoading: PropTypes.bool,
  mediaItems: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    imageUrl: PropTypes.string.isRequired,
    label: PropTypes.string,
  })),
};

MediaList.defaultProps = {
  contentLoading: false,
  mediaItems: [],
};

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.54)',
  },
  buttonRoot: {
    '&:hover': {
      '&::after': {
        display: 'block',
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: theme.palette.action.hover,
        content: "''",
      },
      boxShadow: theme.shadows[6],
    },
    position: 'relative',
    textAlign: 'inherit',
    width: '100%',
    padding: 0,
    boxShadow: theme.shadows[2],
    transition: [
      theme.transitions.create('box-shadow'),
      theme.transitions.create('background-color'),
    ],
  },
  itemRoot: {
    width: '100%',
  },
});

export default withStyles(styles)(MediaList);
