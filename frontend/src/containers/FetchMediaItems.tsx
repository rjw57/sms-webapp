import * as React from 'react';

import {
  IError,
  IMediaQuery,
  IMediaResource,
  mediaList,
} from '../api';

import MediaList from '../components/MediaList';

export interface IState {
  error?: IError;
  isLoading: boolean;
  mediaItems: IMediaResource[];
};

export interface IPassedProps extends IState {
  query: IMediaQuery;
};

export interface IProps {
  /** Search query. */
  query: IMediaQuery;

  /** Component to pass results to. Defaults to MediaList. */
  component: React.ComponentType<IPassedProps>;

  /** Extra props to pass to the rendered component. */
  componentProps?: {[x: string]: any};
};

/**
 * A component which fetches a list of media items and passes the result to a contained component.
 */
class FetchMediaItems extends React.Component<IProps, IState> {
  public static defaultProps: IProps = {
    component: MediaList,
    query: {},
  }

  public state: IState = {
    isLoading: false,
    mediaItems: [],
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
    const { isLoading, mediaItems, error } = this.state;
    const { query, component: Component, componentProps } = this.props;
    const passedProps = { isLoading, mediaItems, error, query };
    return <Component {...componentProps} {...passedProps} />
  }

  private fetchResults() {
    const { query } = this.props;

    this.setState({ isLoading: true });
    mediaList(query)
      .then(response => {
        if(this.props.query === query) {
          this.setState({ isLoading: false, mediaItems: response.results, error: undefined });
        }
      })
      .catch(error => {
        if(this.props.query === query) {
          this.setState({ isLoading: false, mediaItems: [], error });
        }
      });
  }
};

export default FetchMediaItems;
