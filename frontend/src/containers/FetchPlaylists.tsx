import * as React from 'react';

import {
  IError,
  IPlaylistQuery,
  IPlaylistResource,
  playlistList,
} from '../api';

import PlaylistList from '../components/PlaylistList';

export interface IState {
  error?: IError;
  isLoading: boolean;
  playlists: IPlaylistResource[];
};

export interface IPassedProps extends IState {
  query: IPlaylistQuery;
};

export interface IProps {
  /** Search query. */
  query: IPlaylistQuery;

  /** Component to pass results to. Defaults to MediaList. */
  component: React.ComponentType<IPassedProps>;

  /** Extra props to pass to the rendered component. */
  componentProps?: {[x: string]: any};
};

/**
 * A component which fetches a list of media items and passes the result to a contained component.
 */
class FetchPlaylists extends React.Component<IProps, IState> {
  public static defaultProps: IProps = {
    component: PlaylistList,
    query: {},
  }

  public state: IState = {
    isLoading: false,
    playlists: [],
  }

  public componentDidMount() {
    this.fetchResults();
  }

  public componentDidUpdate(prevProps: IProps) {
    if(prevProps.query !== this.props.query) {
      this.fetchResults();
    }
  }

  public render() {
    const { isLoading, playlists, error } = this.state;
    const { query, component: Component, componentProps } = this.props;
    const passedProps = { isLoading, playlists, error, query };
    return <Component {...componentProps} {...passedProps} />
  }

  private fetchResults() {
    const { query } = this.props;

    this.setState({ isLoading: true });
    playlistList(query)
      .then(response => {
        if(this.props.query === query) {
          this.setState({ isLoading: false, playlists: response.results, error: undefined });
        }
      })
      .catch(error => {
        if(this.props.query === query) {
          this.setState({ isLoading: false, playlists: [], error });
        }
      });
  }
};

export default FetchPlaylists;
