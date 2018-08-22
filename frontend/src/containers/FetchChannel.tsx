import * as React from 'react';

import {
  channelGet,
  IChannelResource,
  IError,
} from '../api';

export interface IState {
  error?: IError;
  isLoading: boolean;
  channel?: IChannelResource;
};

type IPassedProps = IState;

export interface IProps {
  /** Id of channel to fetch */
  id: string;

  /** Component to pass results to. Defaults to MediaList. */
  component: React.ComponentType<IPassedProps>;

  /** Extra props to pass to the rendered component. */
  componentProps?: {[x: string]: any};
};

/**
 * A component which fetches a channel resource and passes it to a contained component.
 */
class FetchChannel extends React.Component<IProps, IState> {
  public state: IState = {
    isLoading: false,
  }

  public componentDidMount() {
    this.fetchResource();
  }

  public render() {
    const { isLoading, channel, error } = this.state;
    const { component: Component, componentProps } = this.props;
    const passedProps = { isLoading, channel, error };
    return <Component {...componentProps} {...passedProps} />
  }

  private fetchResource() {
    const { id } = this.props;

    this.setState({ isLoading: true });
    channelGet(id)
      .then(channel => {
        if(this.props.id === id) {
          this.setState({ isLoading: false, channel, error: undefined });
        }
      })
      .catch(error => {
        if(this.props.id === id) {
          this.setState({ isLoading: false, channel: undefined, error });
        }
      });
  }
};

export default FetchChannel;
