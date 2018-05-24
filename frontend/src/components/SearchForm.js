import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';

import Search from '@material-ui/icons/Search';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    boxShadow: theme.shadows[2],
    display: 'flex',
  },

  searchInputRoot: {
    height: theme.spacing.unit * 5,
    backgroundColor: theme.palette.background.paper,
    border: [[
      '1px', 'solid', 'rgba(0, 0, 0, 0.15)',
    ]],
    borderRight: 'none',
    borderTopLeftRadius: theme.spacing.unit * 0.25,
    borderBottomLeftRadius: theme.spacing.unit * 0.25,
    padding: [[ theme.spacing.unit, theme.spacing.unit*2 ]],
  },

  searchInputInput: {
    padding: 0,
    height: theme.spacing.unit * 3,
    minWidth: theme.spacing.unit * 5,
  },

  searchButtonRoot: {
    height: theme.spacing.unit * 5,
    padding: 0,
    minWidth: theme.spacing.unit * 6,
    boxShadow: 'none',

    borderRadius: 0,
    borderTopRightRadius: theme.spacing.unit * 0.25,
    borderBottomRightRadius: theme.spacing.unit * 0.25,
  },
})

const SearchForm = ({ classes, InputProps, ...otherProps }) => (
  <form className={classes.root} {...otherProps}>
    <Input
      disableUnderline fullWidth autoFocus
      type='search'
      classes={{
        root: classes.searchInputRoot, input: classes.searchInputInput,
      }}
      {...InputProps}
    />
    <Button
      variant='raised' size='large' color='primary'
      classes={{root: classes.searchButtonRoot}}
      type='submit'
    >
      <Search />
    </Button>
  </form>
);

SearchForm.propTypes = {
  classes: PropTypes.object.isRequired,
  InputProps: PropTypes.object,
};

SearchForm.defaultProps = {
  InputProps: {},
};

export default withStyles(styles)(SearchForm);
