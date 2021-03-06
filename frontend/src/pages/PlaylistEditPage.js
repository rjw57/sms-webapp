import React, { Component } from 'react';

import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import ReorderIcon from '@material-ui/icons/Reorder';


import { playlistGet, playlistPatch, mediaResourceToItem } from '../api';
import BodySection from "../components/BodySection";
import RenderedMarkdown from '../components/RenderedMarkdown';
import Page from "../containers/Page";
import IfOwnsChannel from "../containers/IfOwnsChannel";

/**
 * A editable list of media for a playlist. Upon mount, it fetches the playlist with a list of the
 * media items and shows them to the user. The list can be re-ordered by drag/drop.
 */
class PlaylistEditPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // The playlist resource
      playlist: { id: '', media: [] },

      // The index of the items being dragged.
      dragStart: null,
    }
  }

  componentWillMount() {
    // As soon as the index page mounts, fetch the playlist.
    const { match: { params: { pk } } } = this.props;
    playlistGet(pk)
      .then(playlist => {
        this.setState({ playlist });
      });
  }

  /**
   * Function called when an item drag begins. Saves the index of the dragged item.
   */
  handleDragStart = (index) => {
    this.setState({ dragStart: index })
  };

  /**
   * Function called when an item is dropped on another item. Reorder the list so that the target
   * item is dropped in place and the other items are shifted in the direction of the source item.
   */
  handleDrop = (index) => {
    const media = this.state.playlist.media.slice();
    media.splice(index, 0, ...media.splice(this.state.dragStart, 1));
    this.setState({ playlist: { ...this.state.playlist, media } });
    // save the new order
    const { match: { params: { pk } } } = this.props;
    playlistPatch({id: pk, mediaIds: media.map(({id}) => id)});
  };

  render() {
    const { playlist } = this.state;
    return (
      <Page>
      {
        playlist.id !== ''
        ?
        <div>
          <IfOwnsChannel channel={playlist.channel}>
            <EditableListSection
              handleDragStart={this.handleDragStart}
              handleDrop={this.handleDrop}
              playlist={playlist}
            />
          </IfOwnsChannel>
          <IfOwnsChannel channel={playlist.channel} hide>
            <Typography variant="headline" component="div">
              You cannot edit this playlist.
            </Typography>
          </IfOwnsChannel>
        </div>
        :
        null
      }
      </Page>
    );
  }
}

/**
 * A section of the body with a heading and a editable playlist and allows reordering of the list.
 * The component can't be a Stateless Function because of the use of references. The drag/drop
 * stuff should be abstracted at some point but I would like the page to bed down a little so we
 * can see how best to do it.
 */
class EditableListSectionComponent extends Component {
  render() {
    const {
      classes, handleDragStart, handleDrop, playlist: {title, description, media}
    } = this.props;
    return (
      <BodySection>
        <Grid container justify='center'>
          <Grid item xs={12} sm={10} md={8} lg={6}>
            <Typography variant='display1' className={classes.title} gutterBottom>
              {title}
            </Typography>
            <Typography variant='body1' component='div'>
              <RenderedMarkdown source={description}/>
            </Typography>
            <Typography variant='headline' gutterBottom>
              Media items
            </Typography>
            <List>
              {media.map(mediaResourceToItem).map((item, index) => (
                <div key={index} ref={'item-' + index}
                     onDragOver={event => event.preventDefault()}
                     onDrop={(event) => {event.preventDefault(); handleDrop(index)}}
                >
                  <ListItem className={classes.listItem}>
                    <Avatar src={item.imageUrl}/>
                    <ListItemText primary={item.title}/>
                    <ListItemSecondaryAction className={classes.action}>
                      <div
                        draggable={true}
                        onDragStart={event => {
                          handleDragStart(index);
                          // setDragImage not supported for IE
                          if (typeof event.dataTransfer.setDragImage === "function") {
                            // Displays the ghost item correctly
                            const ghost = this.refs['item-' + index];
                            const x = ghost.clientWidth - 20;
                            const y = ghost.clientHeight / 2;
                            event.dataTransfer.setDragImage(ghost, x, y);
                          }
                          // this is required for FF compat
                          event.dataTransfer.setData('text', "it doesn't matter");
                        }}
                      >
                        <ReorderIcon/>
                      </div>
                    </ListItemSecondaryAction>
                  </ListItem>
                </div>
              ))}
            </List>
          </Grid>
        </Grid>
      </BodySection>
    );
  }
}

const styles = theme => ({
  action: {
    marginRight: theme.spacing.unit
  },
  listItem: {
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    marginTop: theme.spacing.unit * 2
  },
});

const EditableListSection = withStyles(styles)(EditableListSectionComponent);

export default PlaylistEditPage;
