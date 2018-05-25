import React from 'react';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    position: 'relative',
  },

  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },

  label: {
    position: 'absolute',
    top: 0, left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: theme.spacing.unit,
    color: 'white',
    textTransform: 'uppercase',
    borderBottomRightRadius: theme.spacing.unit * 0.25,
  },

  title: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  description: {
    display: 'block',
    position: 'relative',
    overflow: 'hidden',
  },
  descriptionContent: {
    display: 'block',
    position: 'relative',
    height: '4em',
  },
  descriptionEllipsis: {
    position: 'absolute',
    right: 0,
    top: '2em',
    width: '100%',
    height: '2em',
    background:
      'linear-gradient(to bottom, rgba(255,255,255,0), ' + theme.palette.background.paper + ')',
  },
});

const MediaItemCard = ({ title, description, imageSrc, label, classes, ...otherProps }) => (
  <Card className={classes.root} {...otherProps}>
    <CardMedia className={classes.media} image={imageSrc} />
    <CardContent className={classes.content}>
      <Typography gutterBottom variant="body2" component="h2" className={classes.title}>
        { title }
      </Typography>
      <Typography variant="caption" component="p" className={classes.description}>
        <span className={classes.descriptionContent}>
          { description }
          <span className={classes.descriptionEllipsis}>&nbsp;</span>
        </span>
      </Typography>
    </CardContent>
    { label ? <div className={classes.label}>{ label }</div> : null }
  </Card>
);

MediaItemCard.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  imageSrc: PropTypes.string.isRequired,
  description: PropTypes.string,
  label: PropTypes.string,
};

export default withStyles(styles)(MediaItemCard);
