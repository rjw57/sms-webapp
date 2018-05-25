import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';

import Search from '@material-ui/icons/Search';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    display: 'flex',
    border: [[
      '1px', 'solid', 'rgba(255,255,255,0.25)'
    ]],
    borderRadius: theme.spacing.unit * 0.5,
    overflow: 'hidden',
  },

  searchInputRoot: {
    height: theme.spacing.unit * 5,
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
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
  },
})

const SearchForm = ({ classes, InputProps, ButtonProps, ...otherProps }) => (
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
      {...ButtonProps}
    >
      <Search />
    </Button>
  </form>
);

SearchForm.propTypes = {
  classes: PropTypes.object.isRequired,
  InputProps: PropTypes.object,
  ButtonProps: PropTypes.object,
};

SearchForm.defaultProps = {
  InputProps: {},
  ButtonProps: {},
};

export default withStyles(styles)(SearchForm);
