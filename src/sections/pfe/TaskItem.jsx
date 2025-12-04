import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
// Ou si vous n'avez pas Iconify, utilisez directement depuis MUI :
import { Button } from '@mui/material';
import Iconify from 'src/components/iconify';
// Composant pour les tâches/fonctionnalités
const TaskItem = ({ task, index, onTaskChange, onRemoveTask }) => (
    <Box sx={{ 
      mb: 2, 
      p: 2, 
      border: '1px solid', 
      borderColor: 'divider', 
      borderRadius: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 2
    }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Description de la tâche"
            value={task.description}
            multiline
            onChange={(e) => onTaskChange(index, 'description', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Durée (jours)"
            type="number"
            value={task.duration}
            onChange={(e) => onTaskChange(index, 'duration', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={2}>

            <Button
              size="small"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={() => onRemoveTask(index)}
            >
              Supprimer
            </Button>

        </Grid>
      </Grid>
    </Box>
  );
export default TaskItem;

TaskItem.propTypes = {
  task: PropTypes.shape({
    description: PropTypes.string.isRequired,
    duration: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onTaskChange: PropTypes.func.isRequired,
  onRemoveTask: PropTypes.func.isRequired,
};