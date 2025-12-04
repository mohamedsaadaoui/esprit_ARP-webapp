import React from 'react';
import PropTypes from 'prop-types';

import { Box } from '@mui/material';

const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index} style={{ height: '100%' }}>
      {value === index && (
        <Box sx={{ pt: 2, height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
};

export default TabPanel;