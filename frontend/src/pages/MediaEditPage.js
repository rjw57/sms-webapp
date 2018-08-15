import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import Page from '../containers/Page';
import ItemMetadataForm from "../components/ItemMetadataForm";
import MediaItemPreview from "../components/MediaItemPreview";
import {mediaGet, mediaPatch} from "../api";
import { setMessageForNextPageLoad } from "../containers/Snackbar";

/**
 * A page which allows the user to edit a media item's metadata.
 */
class MediaEditPage extends Component {
  constructor({ match: { params: { pk } } }) {
    super();

    this.state = {
      // An error object as returned by the API or the empty object if there are no errors.
      errors: {},
      // The media item being edited by the ItemMetadataForm.
      item: {},
      // remember the media item's key for convenience (read-only)
      pk,
    };
  }

  /**
   * Retrieve the item.
   */
  componentWillMount() {
    mediaGet(this.state.pk).then(item => this.setState({ item }));
  }

  /**
   * Save the edited item.
   */
  save() {
    mediaPatch(this.state.item)
      .then(savedItem => {
        setMessageForNextPageLoad('The media item has been updated.');
        window.location = '/media/' + this.state.pk
      })
      .catch(({ body }) => this.setState({ errors: body })
    );
  }

  render() {
    const { classes } = this.props;
    const { item, errors } = this.state;
    return (
      <Page>
        <section className={classes.section}>
          <Grid container justify='center' spacing={32}>
            <Grid item xs={12} sm={6} lg={4}>
              <ItemMetadataForm
                item={item}
                errors={errors}
                onChange={patch => this.setState({item: {...item, ...patch}})}
              />
              <div className={ classes.buttonSet }>
                <Button variant='outlined' href={ '/media/' + this.state.pk } >
                  Cancel
                </Button>
                <Button color='secondary' variant='contained' onClick={ () => this.save() } >
                  Save
                </Button>
              </div>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subheading' gutterBottom>Preview</Typography>
              <MediaItemPreview component={ Paper } className={ classes.preview } item={ item } />
            </Grid>
          </Grid>
        </section>
      </Page>
    );
  }
}

const styles = theme => ({
  buttonSet: {
    '& button': {
      marginLeft: theme.spacing.unit,
    },
    marginTop: theme.spacing.unit,
    textAlign: 'right',
  },
  preview: {
    padding: theme.spacing.unit * 3,
  },
  section: {
    marginTop: theme.spacing.unit,
  },
});

export default withStyles(styles)(MediaEditPage);
