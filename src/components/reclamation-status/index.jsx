import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';

// Component to display reclamation status with appropriate styling
const ReclamationStatus = ({ status }) => {
  const theme = useTheme();

  // Default values
  let color = 'warning';
  let icon = <PendingIcon />;
  let label = 'EN_ATTENTE';
  let bgcolor = theme.palette.warning.lighter;
  let textColor = theme.palette.warning.darker;
  let borderColor = theme.palette.warning.main;
  let tooltipText = 'Your reclamation is waiting to be processed';

  // Determine styling based on status
  switch (status) {
    case 'EN_ATTENTE':
      // Default values already set
      break;
    case 'EN_COURS':
      color = 'info';
      icon = <HourglassTopIcon />;
      label = 'EN_COURS';
      bgcolor = theme.palette.info.lighter;
      textColor = theme.palette.info.darker;
      borderColor = theme.palette.info.main;
      tooltipText = 'Your reclamation is being processed';
      break;
    case 'RESOLUE':
      // eslint-disable-next-line
      color = 'success';
      icon = <CheckCircleIcon />;
      label = 'RESOLUE';
      bgcolor = theme.palette.success.lighter;
      textColor = theme.palette.success.darker;
      borderColor = theme.palette.success.main;
      tooltipText = 'Your reclamation has been resolved';
      break;
    default:
      // Use default values for unknown statuses
      label = status || 'EN_ATTENTE';
  }

  return (
    <Tooltip title={tooltipText} arrow>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 1.5,
          py: 0.5,
          borderRadius: '16px',
          bgcolor,
          border: `1px solid ${borderColor}`,
          color: textColor,
          '& svg': {
            fontSize: 16,
            mr: 0.5,
          },
        }}
      >
        {icon}
        <Typography variant="caption" fontWeight="bold">
          {label}
        </Typography>
      </Box>
    </Tooltip>
  );
};

// PropTypes validation
ReclamationStatus.propTypes = {
  status: PropTypes.string.isRequired, // status is required and should be a string
};

export default ReclamationStatus;