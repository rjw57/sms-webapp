import * as React from 'react';

import {
  channelList,
  IChannelQuery,
  IChannelResource,
  IError,
} from '../api';

import ChannelList from '../components/ChannelList';

export interface IState {
  error?: IError;
  isLoading: boolean;
  channels: IChannelResource[];
};

export interface IPassedProps extends IState {
  query: IChannelQuery;
};

export interface IProps {
  /** Search query. */
  query: IChannelQuery;

  /** Component to pass results to. Defaults to MediaList. */
  component: React.ComponentType<IPassedProps>;

  /** Extra props to pass to the rendered component. */
  componentProps?: {[x: string]: any};
};

/**
 * A component which fetches a list of media items and passes the result to a contained component.
 */
class FetchChannels extends React.Component<IProps, IState> {
  public static defaultProps: IProps = {
    component: ChannelList,
    query: {},
  }

  public state: IState = {
    channels: [],
    isLoading: false,
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
    const { isLoading, channels, error } = this.state;
    const { query, component: Component, componentProps } = this.props;
    const passedProps = { isLoading, channels, error, query };
    return <Component {...componentProps} {...passedProps} />
  }

  private fetchResults() {
    const { query } = this.props;

    this.setState({ isLoading: true });
    channelList(query)
      .then(response => {
        if(this.props.query === query) {
          this.setState({ isLoading: false, channels: response.results, error: undefined });
        }
      })
      .catch(error => {
        if(this.props.query === query) {
          this.setState({ isLoading: false, channels: [], error });
        }
      });
  }
};

export default FetchChannels;
