import React, { useState, useEffect } from 'react';

import {
  Box,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import ReclamationService from 'src/services/pfe-services/reclamationService';

import StatCard from './components/StatCard';
import ReclamationCard from './components/ReclamationCard';
import ReclamationDetailsDialog from './components/ReclamationDetailsDialog';

const ReclamationList = () => {
  const [reclamations, setReclamations] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReclamation, setSelectedReclamation] = useState(null);

  useEffect(() => {
    ReclamationService.getAllReclamation(9)
      .then((res) => {
        setReclamations(res.data.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredReclamations = reclamations.filter((r) => {
    const matchesSearch =
      r.nomEtudiant.toLowerCase().includes(search.toLowerCase()) ||
      r.prenomEtudiant.toLowerCase().includes(search.toLowerCase()) ||
      r.emailEtudiant.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? r.statut === statusFilter : true;
    const matchesType = typeFilter ? r.typeReclamation === typeFilter : true;
    return matchesSearch && matchesStatus && matchesType;
  });

  const statCounts = {
    total: reclamations.length,
    en_attente: reclamations.filter((r) => r.statut === 'EN_ATTENTE').length,
    resolue: reclamations.filter((r) => r.statut === 'RESOLUE').length,
    en_cours: reclamations.filter((r) => r.statut === 'EN_COURS').length,
  };

  const uniqueTypes = [...new Set(reclamations.map((r) => r.typeReclamation))];

  return (
    <><Box p={3}>
      {/* Stats Section */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total" count={statCounts.total} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="En attente" count={statCounts.en_attente} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Résolues" count={statCounts.resolue} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="En cours" count={statCounts.en_cours} />
        </Grid>
      </Grid>

      {/* Filters */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6} lg={6}>
          <TextField
            variant="outlined"
            label="Rechercher par nom, email..."
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <TextField
            select
            label="Tous les statuts"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="EN_ATTENTE">En attente</MenuItem>
            <MenuItem value="RESOLUE">Résolue</MenuItem>
            <MenuItem value="EN_COURS">En cours</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <TextField
            select
            label="Tous les types"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Tous</MenuItem>
            {uniqueTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>


      {/* Results */}
      <Typography variant="body1" mb={2}>
        {filteredReclamations.length} demandes trouvées
      </Typography>

      <Grid container spacing={2}>
        {filteredReclamations.map((item) => (
          <Grid item xs={12} md={6} key={item.id}>
            <ReclamationCard
              item={{
                id: item.id,
                nom: `${item.prenomEtudiant} ${item.nomEtudiant}`,
                studentId: item.idEtudiant,
                email: item.emailEtudiant,
                statut: item.statut,
                type: item.typeReclamation,
                date: new Date(item.dateCreation).toLocaleString('fr-FR'),
              }}
             /* onVoirDetails={(x) => {
                setSelectedReclamation(x);
                setOpenDialog(true);
              } */
             onVoirDetails={() => {
              ReclamationService.getDetailReclamationById(item.id)
                .then((res) => {
                  setSelectedReclamation(res.data);
                  setOpenDialog(true);
                })
                .catch((err) => {
                  console.error("Erreur lors du chargement des détails de la réclamation", err);
                })
            }
               } />
          </Grid>
        ))}
      </Grid>
    </Box>
    <ReclamationDetailsDialog
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        data={selectedReclamation} /></>
  );
};

export default ReclamationList;
