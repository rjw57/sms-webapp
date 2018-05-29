import React from 'react';

import MuiAppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

import SearchForm from './SearchForm';

import withProfile from '../contexts/profile';

const ProfileButton = withProfile(({ profile, ...otherProps }) => {
  if(!profile) { return null; }

  if(profile.is_anonymous) {
    return (
      <Button component='a' href={profile.urls.login} {...otherProps}>
        Login
      </Button>
    );
  }

  return (
    <Button {...otherProps}>
      { profile.username }
    </Button>
  );
});

const AppBar = ({ classes, onSearch, ...otherProps }) => (
  <MuiAppBar position="static" className={classes.root} {...otherProps}>
    <Grid container component={Toolbar}>
      <Hidden smDown>
        <Grid item xs={3} lg={2} className={classes.toolBarLeft}>
            <Typography variant="title" color="inherit">
              Media&nbsp;Service
            </Typography>
        </Grid>
      </Hidden>
      <Grid item xs={12} sm={9} md={6} lg={8} className={classes.toolBarMiddle}>
        <SearchForm
          classes={{root: classes.searchFormRoot}}
          onSubmit={event => handleSubmit(event, onSearch)}
          color="secondary"
          InputProps={{
            placeholder: 'Search', name: 'q',
          }}
        />
      </Grid>
      <Hidden xsDown>
        <Grid item xs={3} lg={2} className={classes.toolBarRight}>
          <ProfileButton size='large' color='inherit' />
        </Grid>
      </Hidden>
    </Grid>
  </MuiAppBar>
);

const handleSubmit = (event, onSearch) => {
  // Prevent default handling of submit event.
  event.preventDefault();

  // Need do nothing else if there is no search handler.
  if(!onSearch) { return; }

  // Get value from input element.
  const formElement = event.target;
  const inputElement = Array.from(formElement.elements).filter(element => element.name === 'q')[0];
  if(!inputElement) { return; }

  // Get query from input element.
  const query = inputElement.value;
  if(!query) { return; }

  // Pass query to handler.
  onSearch(query);
}

const styles = theme => ({
  root: { /* no default styles */ },

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
    width: '100%',
    maxWidth: '960px',
  },
});

export default withStyles(styles)(AppBar);
