import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom'

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

import BodySection from '../components/BodySection';

import ReleaseTag from './ReleaseTag';

/**
 * The "message of the day" banner used to display information from the admins to the users.
 *
 * Any unknown properties supplied will be spread to the root component.
 */
const MotdBanner = ({
  classes, ...otherProps
}) => (
  <BodySection classes={{ root: classes.root }}>
    <Typography component='div' variant='body1' classes={{ root: classes.message }}>
      <div className={classes.left}>
        <ReleaseTag style={{marginRight: '0.5ex'}}>alpha</ReleaseTag>
        {' '}This service is in development.{' '} { /* whitespace coalescing in JSX sux! */ }
        <Link className={classes.link} to='/about'>Help us improve it.</Link>
      </div>
      <div className={classes.right}>
        <Button color='primary' variant='text' component={Link} size='small' to="/changelog">
          What's new?
        </Button>
      </div>
    </Typography>
  </BodySection>
)

MotdBanner.propTypes = {
};

MotdBanner.defaultProps = {
};

const styles = theme => ({
  root: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderBottom: [[1, 'solid', theme.palette.divider]],
    marginBottom: -1,
  },

  left: {
    flexGrow: 1,
  },

  right: {
    marginRight: -theme.spacing.unit,

    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },

  message: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit * 2,
  },

  link: {
    color: theme.palette.text.secondary,

    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
});

export default withStyles(styles)(MotdBanner);
