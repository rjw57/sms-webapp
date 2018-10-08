import * as React from 'react';

import Fade from '@material-ui/core/Fade';
import LinearProgress from '@material-ui/core/LinearProgress';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

// This file creates an "in-flight fetch" progress bar á la YouTube which gives the suer some
// feedback on requests in the absence of page loads. The general idea is simple: we patch
// window.fetch to increment a "start" count when a fetch begins and increment a "finish" count
// when the fetch resolves or rejects. The ratio of "finish" to "start" is the progress.
//
// We show the progress bar whenever the "start" count is non-zero and not equal to the "finish"
// count. When "start" becomes equal to "finish" we hide the progress bard and then reset the
// start/finish counts back to zero.

const styles = (theme: Theme) => createStyles({
  root: {
    boxShadow: theme.shadows[2],
    left: 0,
    position: 'fixed',
    top: 0,
    width: '100%',

    // z-index rationale: like a snackbar, this provides information to user which is above all
    // other UI elements
    zIndex: theme.zIndex.snackbar,
  },

  // The progress bar should be somewhat unobtrusive.
  progressRoot: {
    height: 3,
  },
});

/**
 * Global state
 */
interface IGlobalState {
  fetchDidFinish: (() => void) | null;
  fetchWillStart: (() => void) | null;
}

const globalState: IGlobalState = {
  fetchWillStart: null,

  fetchDidFinish: null,
};

interface IProps extends WithStyles<typeof styles> { }

/**
 * A progress bar which is shown at the top of the page when there are in-flight fetches.
 */
export class FetchProgress extends React.Component<IProps> {
  public state = {
    // Number of fetch-es initiated since the progress bar was last shown
    startedCount: 0,

    // Number of fetches which finished since the progress bar was last shown.
    finishedCount: 0,

    // Show the progress bar
    show: false,
  }

  public componentDidMount() {
    globalState.fetchWillStart = this.fetchWillStart;
    globalState.fetchDidFinish = this.fetchDidFinish;
  }

  public componentWillUnmount() {
    if(globalState.fetchWillStart === this.fetchWillStart) {
      globalState.fetchWillStart = null;
    }

    if(globalState.fetchDidFinish === this.fetchDidFinish) {
      globalState.fetchDidFinish = null;
    }
  }

  public render() {
    const { classes } = this.props;
    const { startedCount, finishedCount, show } = this.state;

    // We have a bit of a cheat here in that we lie to the user a bit and always have a little bit
    // of progress so that they feel something is actually happening.
    const value = (startedCount > 0) ? 10 + 90 * finishedCount / startedCount : 0;

    return <Fade in={ show } onExited={ this.handleExitedFade }>
      <div className={ classes.root }>
        <LinearProgress
          classes={{ root: classes.progressRoot }}
          color='secondary'
          value={ value }
          variant='determinate'
        />
      </div>
    </Fade>;
  }

  /**
   * Handle progress bar having finished fading out.
   */
  private handleExitedFade = () => {
    // Determine if the progress bar should still be off the screen.
    const { show } = this.state;

    // If so, reset the fetch counts
    if(!show) { this.setState({ startedCount: 0, finishedCount: 0 }); }
  }

  private fetchWillStart = () => {
    const { startedCount } = this.state;
    this.setState({ startedCount: startedCount + 1, show: true });
  }

  private fetchDidFinish = () => {
    const { startedCount, finishedCount } = this.state;
    this.setState({ finishedCount: finishedCount + 1 });
    if(finishedCount + 1 === startedCount) {
      this.setState({ show: false });
    }
  }
}

export default withStyles(styles)(FetchProgress);

/**
 * Special version of fetch which will allow progress bar display.
 */
const wrappedFetch = window.fetch;
window.fetch = (...args: any[]) => {
  if(globalState.fetchWillStart) {
    globalState.fetchWillStart();
  }

  const handleResolveOrReject = (value: any) => {
    if(globalState.fetchDidFinish) {
      globalState.fetchDidFinish();
    }
    return value;
  }

  return wrappedFetch(...args).then(handleResolveOrReject, handleResolveOrReject);
}
