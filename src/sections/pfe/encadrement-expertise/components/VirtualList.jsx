import React from 'react';
import PropTypes from 'prop-types';
import { FixedSizeList as List } from 'react-window';
// eslint-disable-next-line import/no-extraneous-dependencies
import AutoSizer from 'react-virtualized-auto-sizer';

import { Box } from '@mui/material';

const VirtualList = ({ items, renderItem, itemHeight = 120 }) => (
  <Box sx={{ height: '100%' }}>
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          width={width}
          itemCount={items.length}
          itemSize={itemHeight}
        >
          {({ index, style }) => (
            <Box
              style={style}
              key={items[index].id || index}
              sx={{ mb: index !== items.length - 1 ? 2 : 0 }}
            >
              {renderItem(items[index])}
            </Box>
          )}
        </List>
      )}
    </AutoSizer>
  </Box>
);

VirtualList.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  itemHeight: PropTypes.number,
};

export default VirtualList;