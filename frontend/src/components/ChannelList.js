import React from 'react';
import PropTypes from 'prop-types';

import ResourceList from './ResourceList';

import ChannelDefaultImage from '../img/channel-default-image.jpg';

const ChannelList = ({ channels, ...otherProps }) => (
  <ResourceList cardProps={ channelsToProps(channels) } { ...otherProps } />
);

const channelsToProps = items => (items || []).map(({
  title, description, id
}) => ({
  description,
  href: '/channels/' + id,
  imageSrc: ChannelDefaultImage,
  label: 'Channel',
  title,
}));

export default ChannelList;
