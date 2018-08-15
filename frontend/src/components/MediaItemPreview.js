import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';

import PlayIcon from '@material-ui/icons/PlayCircleOutline';

import { withStyles } from '@material-ui/core/styles';

import RenderedMarkdown from '../components/RenderedMarkdown';

/**
 * A preview of a media item. Unknown properties are broadcast to the root element.
 */
const MediaItemPreview = ({
  component: Component,
  classes,
  item: { description = '', title = '', },
  ...otherProps
}) => (
  <Component className={ classes.root } { ...otherProps }>
    <div className={ classes.video }>
      <div className={ classes.videoContent }>
        <PlayIcon className={ classes.videoIcon }/>
      </div>
    </div>
    <Typography variant='title' className={ classes.title }>{ title }</Typography>
    <RenderedMarkdown className={ classes.description } source={ description } />
  </Component>
);

MediaItemPreview.propTypes = {
  /** Base root component. */
  component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

  /** Media item to preview. */
  item: PropTypes.shape({
    /** Description of media item. */
    description: PropTypes.string,

    /** Title of media item. */
    title: PropTypes.string,
  }),
};

MediaItemPreview.defaultProps = {
  component: 'div',
};

const styles = theme => ({
  root: { },

  video: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    borderRadius: theme.spacing.unit * 0.5,
    marginBottom: theme.spacing.unit * 2,
    paddingTop: '56.25%',
    position: 'relative',
  },

  videoContent: {
    alignItems: 'center',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },

  videoIcon: {
    fontSize: '10em',
    opacity: 0.25,
  },
});

export default withStyles(styles)(MediaItemPreview);
