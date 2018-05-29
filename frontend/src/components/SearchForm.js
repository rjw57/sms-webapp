import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';

import Search from '@material-ui/icons/Search';

import { withStyles } from '@material-ui/core/styles';

/**
 * A combined input field and submit button providing a horizontal search control form.
 *
 * Any unknown properties supplied will be spread to the root component.
 */
const SearchForm = ({
  classes, component: Component, InputProps, ButtonProps, color, ...otherProps
}) => (
  <Component
    className={[
      classes.root,
      color === 'primary' ? classes.colorPrimary : null,
      color === 'secondary' ? classes.colorSecondary : null
    ].join(' ')}
    {...otherProps}
  >
    <Input
      disableUnderline fullWidth autoFocus
      type='search'
      classes={{
        root: classes.searchInputRoot, input: classes.searchInputInput,
      }}
      {...InputProps}
    />
    <Button
      variant='raised' size='large' color={color}
      classes={{root: classes.searchButtonRoot}}
      type='submit'
      {...ButtonProps}
    >
      <Search />
    </Button>
  </Component>
);

SearchForm.propTypes = {
  /** @ignore */
  classes: PropTypes.object.isRequired,

  /** The color of the component. */
  color: PropTypes.oneOf(['default', 'primary', 'secondary']),

  /** Base component for the control. */
  component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

  /** Props passed to the ``Input`` element implementing the search field. */
  InputProps: PropTypes.object,

  /** Props passed to the ``Button`` element implementing the submit button. */
  ButtonProps: PropTypes.object,
};

SearchForm.defaultProps = {
  component: 'form',
  color: 'default',
};

const styles = theme => ({
  root: {
    display: 'flex',
    border: [[
      1, 'solid', theme.palette.divider,
    ]],
    borderRadius: theme.spacing.unit * 0.5,
    overflow: 'hidden',
  },

  colorPrimary: {
    borderColor: theme.palette.primary.main,
  },

  colorSecondary: {
    borderColor: theme.palette.primary.main,
  },

  searchInputRoot: {
    backgroundColor: theme.palette.background.paper,
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

export default withStyles(styles)(SearchForm);
