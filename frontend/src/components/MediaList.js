import React from 'react';
import PropTypes from 'prop-types';

import ResourceList from './ResourceList';

const MediaList = ({ mediaItems, ...otherProps }) => (
  <ResourceList cardProps={ mediaItemsToProps(mediaItems) } { ...otherProps } />
);

const mediaItemsToProps = items => (items || []).map(({
  title, description, posterImageUrl, id
}) => ({
  description,
  href: '/media/' + id,
  imageSrc: posterImageUrl,
  title,
}));

export default MediaList;
