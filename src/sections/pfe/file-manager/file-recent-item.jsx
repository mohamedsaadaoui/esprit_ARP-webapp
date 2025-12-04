import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import ListItemText from '@mui/material/ListItemText';




import FileThumbnail from 'src/components/file-thumbnail';

export default function FileRecentItem({ file, onDelete, onStatusChange, sx, ...other }) {

  const handleOpenFile = useCallback(() => {
    window.open(file.url, '_blank');
  }, [file.url]);







  const renderText = (
    <ListItemText
      primary={file.name}
      // secondary={
      //   <>
      //     {fData(file.size)}
      //     <Box
      //       sx={{
      //         mx: 0.75,
      //         width: 2,
      //         height: 2,
      //         borderRadius: '50%',
      //         bgcolor: 'currentColor',
      //       }}
      //     />
      //   </>
      // }
      primaryTypographyProps={{
        noWrap: true,
        typography: 'subtitle2',
      }}
      secondaryTypographyProps={{
        mt: 0.5,
        component: 'span',
        alignItems: 'center',
        typography: 'caption',
        color: 'text.disabled',
        display: 'inline-flex',
      }}
    />
  );

  // const renderAvatar = (
  //   <AvatarGroup
  //     max={3}
  //     sx={{
  //       [`& .${avatarGroupClasses.avatar}`]: {
  //         width: 24,
  //         height: 24,
  //         '&:first-of-type': {
  //           fontSize: 12,
  //         },
  //       },
  //     }}
  //   >
  //     {file.shared?.map((person) => (
  //       // eslint-disable-next-line react/jsx-no-undef
  //       <Avatar key={person.id} alt={person.name} src={person.avatarUrl} />
  //     ))}
  //   </AvatarGroup>
  // );

  return (
    
      <Stack
        component={Paper}
        variant="outlined"
        spacing={1}
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'unset', sm: 'center' }}
        sx={{
          borderRadius: 2,
          bgcolor: 'unset',
          cursor: 'pointer',
          position: 'relative',
          p: { xs: 2.5, sm: 2 },
          '&:hover': {
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z20,
          },
          ...sx,
        }}
        {...other}
        onClick={handleOpenFile}
      >
        <FileThumbnail file={file.extension} sx={{ width: 36, height: 36, mr: 1 }} />

        {renderText}

        {/* {!!file?.shared?.length && renderAvatar} */}

      </Stack>

    
  );
}

FileRecentItem.propTypes = {
  file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func.isRequired,
  sx: PropTypes.object,
};
