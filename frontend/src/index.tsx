import * as React from 'react';
import * as ReactDOM from 'react-dom';

import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Helmet } from 'react-helmet';
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import AnalyticsPage from './pages/AnalyticsPage';
import ChannelPage from './pages/ChannelPage';
import IndexPage from './pages/IndexPage';
import MediaEditPage from './pages/MediaEditPage';
import MediaPage from './pages/MediaPage';
import PlaylistCreatePage from './pages/PlaylistCreatePage';
import PlaylistEditPage from './pages/PlaylistEditPage';
import PlaylistPage from './pages/PlaylistPage';
import StaticTextPage from './pages/StaticTextPage';
import UploadPage from './pages/UploadPage';

import FetchProgress from './containers/FetchProgress';
import Snackbar from "./containers/Snackbar";

import ProfileProvider from './providers/ProfileProvider';

import theme from './theme';

const globalSnackbar = <Snackbar/>;

ReactDOM.render(
  <BrowserRouter>
    <MuiThemeProvider theme={theme}>
      <ProfileProvider>
        { /* A default title for the page which can be overridden by specific pages. */ }
        <Helmet><title>The University of Cambridge Media Platform</title></Helmet>
        <CssBaseline />

        <FetchProgress />

        <Route exact={true} path="/" component={IndexPage} />
        <Switch>
          <Route exact={true} path="/media/new" component={UploadPage} />
          <Route exact={true} path="/media/:pk" component={MediaPage} />
        </Switch>
        <Route exact={true} path="/media/:pk/analytics" component={AnalyticsPage} />
        <Route exact={true} path="/media/:pk/edit" component={MediaEditPage} />
        <Route exact={true} path="/channels/:pk" component={ChannelPage} />
        <Switch>
          <Route exact={true} path="/playlists/new" component={PlaylistCreatePage} />
          <Route exact={true} path="/playlists/:pk" component={PlaylistPage} />
        </Switch>
        <Route exact={true} path="/playlists/:pk/edit" component={PlaylistEditPage} />
        <Route exact={true} path="/about" component={StaticTextPage} />
        <Route exact={true} path="/changelog" component={StaticTextPage} />

        { /* Global notification snackbar */ }
        { globalSnackbar }
      </ProfileProvider>
    </MuiThemeProvider>
  </BrowserRouter>,
  document.getElementById('app')
);
