import PropTypes from 'prop-types';
import React, { useState , useCallback } from 'react';
 
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Button, Dialog, DialogContent } from '@mui/material';

import Iconify from 'src/components/iconify';

import CreateUserForm from './user-new-edit-form'; 
// ----------------------------------------------------------------------
 
export default function UserTableToolbar({
  filters,
  onFilters = () => {},
  
  roleOptions,
  fetchUsers,
}) {
  const [openDialog, setOpenDialog] = useState(false);



    const handleAddUser = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleFilterSearch = useCallback(
      (event) => {
        onFilters('username', event.target.value); 
      },
      [onFilters]
    );
 
 
  return (
    <Stack
            spacing={2}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            direction={{
                xs: 'column',
                md: 'row',
            }}
            sx={{
                p: 2.5,
                pr: { xs: 2.5, md: 1 },
            }}
        >
           {/*  <FormControl
                sx={{
                    flexShrink: 0,
                    width: { xs: 1, md: 200 },
                }}
            >
                <InputLabel>Role</InputLabel>
                <Select
                    multiple
                    value={filters.role}
                    onChange={handleFilterRole}
                    input={<OutlinedInput label="Role" />}
                    renderValue={(selected) =>
                        selected
                            .map((value) => roleOptions.find((opt) => opt.value === value)?.label)
                            .join(', ')
                    }
                    MenuProps={{
                        PaperProps: {
                            sx: { maxHeight: 240 },
                        },
                    }}
                >
                    {roleOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            <Checkbox
                                disableRipple
                                size="small"
                                checked={filters.role.includes(option.value)}
                            />
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
 */}
            <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
                <TextField
                    fullWidth
                    value={filters.search}
                    onChange={handleFilterSearch} 
                    placeholder="Chercher..."
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                            </InputAdornment>
                        ),
                    }}
                />
   <Button 
                variant="contained" 
                color="primary" 
                onClick={handleAddUser}
            >
                Ajouter Utilisateur
            </Button>
               
            </Stack>
            
            
            <Dialog 
    open={openDialog} 
    onClose={handleCloseDialog} 
    PaperProps={{
        sx: { 
            width: '820px',  
            height: 'auto', 
        } 
    }}
>
    <DialogContent sx={{ pt: 4, pb: 4 }}> {/* Ajoutez du padding ici */}
    <CreateUserForm 
    onClose={handleCloseDialog} 
    fetchUsers={fetchUsers}/>
    </DialogContent>
</Dialog> 
        </Stack>
    
  );
}
 
UserTableToolbar.propTypes = {
  filters: PropTypes.object,
  roleOptions: PropTypes.array,
  fetchUsers: PropTypes.func.isRequired,
  onFilters: PropTypes.func.isRequired,
};