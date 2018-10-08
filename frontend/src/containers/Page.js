import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom'

import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Hidden from '@material-ui/core/Hidden';
import { withStyles } from '@material-ui/core/styles';

import UploadIcon from '@material-ui/icons/CloudUpload';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';

import AppBar from "../components/AppBar";
import DraggableContext from "../components/DraggableContext";
import MotdBanner from "../components/MotdBanner";
import NavigationPanel from "../components/NavigationPanel";
import Snackbar from "./Snackbar";
import IfOwnsAnyChannel from "./IfOwnsAnyChannel";

import { withProfile } from "../providers/ProfileProvider";

const ConnectedNavigationPanel = withProfile(NavigationPanel);

/**
 * A top level component that wraps all pages to give then elements common to all page,
 * the ``AppBar`` etc.
 */
class Page extends React.Component {
  state = {
    mobileDrawerOpen: false,
  };

  handleDrawerToggle = () => {
    this.setState(state => ({ mobileDrawerOpen: !state.mobileDrawerOpen }));
  };

  render() {
    const { defaultSearch, classes, children, gutterTop } = this.props;
    const { mobileDrawerOpen } = this.state;
    const drawer = <ConnectedNavigationPanel />;

    return (
      <div className={ classes.page }>
        <AppBar
          classes={{root: classes.appBar}}
          position='fixed'
          defaultSearch={defaultSearch}
          onMenuClick={ this.handleDrawerToggle }
        >
          <IfOwnsAnyChannel>
            <IconButton color='inherit' component={ Link } to='/media/new'>
              <UploadIcon />
            </IconButton>
            <IconButton color='inherit' component={ Link } to='/playlists/new'>
              <PlaylistAddIcon />
            </IconButton>
          </IfOwnsAnyChannel>
        </AppBar>

        <Hidden mdUp>
          <Drawer
            variant="temporary"
            open={ mobileDrawerOpen }
            onClose={ this.handleDrawerToggle }
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            { drawer }
          </Drawer>
        </Hidden>

        <Hidden smDown implementation="css">
          <Drawer
            variant="permanent"
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            { /* used as a spacer */ }
            <div className={classes.toolbar} />
            { drawer }
          </Drawer>
        </Hidden>

        <div className={classes.content}>
          { /* used as a spacer */ }
          <div className={classes.toolbar} />
          <main className={classes.main}>
            <MotdBanner />
            <DraggableContext>
              <div className={ [classes.children, gutterTop ? classes.gutterTop : ''].join(' ') }>
                { children }
              </div>
            </DraggableContext>
          </main>
        </div>

        <Snackbar/>
      </div>
    );
  }
}

Page.propTypes = {
  /** @ignore */
  classes: PropTypes.object.isRequired,

  /** Default search text to populate the search form with. */
  defaultSearch: PropTypes.string,

  /** Should the page have a gutter between the top and the content? */
  gutterTop: PropTypes.bool,
};

Page.defaultProps = {
  gutterTop: false,
};

const styles = theme => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },

  drawerPaper: {
    left: 0,
    position: 'fixed',
    top: 0,
    width: theme.dimensions.drawerWidth,
  },

  children: {
    /* No default styles. */
  },

  page: {
    minHeight: '100vh',
  },

  content: {
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.dimensions.drawerWidth,
    },
  },

  gutterTop: {
    paddingTop: theme.spacing.unit * 2,

    [theme.breakpoints.up('sm')]: {
      paddingTop: theme.spacing.unit * 3,
    },
  },

  main: {
    /* No default styles. */
  },

  toolbar: theme.mixins.toolbar,
});

export default withStyles(styles)(Page);
