import * as React from 'react';

import {
  IError,
  IPlaylistResource,
  playlistGet,
} from '../api';

export interface IState {
  error?: IError;
  isLoading: boolean;
  playlist?: IPlaylistResource;
};

type IPassedProps = IState;

export interface IProps {
  /** Id of playlist to fetch */
  id: string;

  /** Component to pass results to. Defaults to MediaList. */
  component: React.ComponentType<IPassedProps>;

  /** Extra props to pass to the rendered component. */
  componentProps?: {[x: string]: any};
};

/**
 * A component which fetches a playlist resource and passes it to a contained component.
 */
class FetchPlaylist extends React.Component<IProps, IState> {
  public state: IState = {
    isLoading: false,
  }

  public componentDidMount() {
    this.fetchResource();
  }

  public render() {
    const { isLoading, playlist, error } = this.state;
    const { component: Component, componentProps } = this.props;
    const passedProps = { isLoading, playlist, error };
    return <Component {...componentProps} {...passedProps} />
  }

  private fetchResource() {
    const { id } = this.props;

    this.setState({ isLoading: true });
    playlistGet(id)
      .then(playlist => {
        if(this.props.id === id) {
          this.setState({ isLoading: false, playlist, error: undefined });
        }
      })
      .catch(error => {
        if(this.props.id === id) {
          this.setState({ isLoading: false, playlist: undefined, error });
        }
      });
  }
};

export default FetchPlaylist;
