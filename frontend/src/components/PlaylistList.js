import React from 'react';
import PropTypes from 'prop-types';

import ResourceList from './ResourceList';

import PlaylistDefaultImage from '../img/playlist-default-image.jpg';

const PlaylistList = ({ playlists, ...otherProps }) => (
  <ResourceList cardProps={ playlistsToProps(playlists) } { ...otherProps } />
);

const playlistsToProps = items => (items || []).map(({
  title, description, id
}) => ({
  description,
  href: '/playlists/' + id,
  imageSrc: PlaylistDefaultImage,
  label: 'Playlist',
  title,
}));

export default PlaylistList;
