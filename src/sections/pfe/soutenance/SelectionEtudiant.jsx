// components/SelectionEtudiant.jsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Button,
  Chip,
  Alert
} from '@mui/material';

const SelectionEtudiant = ({ onEtudiantSelect }) => {
  const [soutenances, setSoutenances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSoutenances = async () => {
      try {
        const response = await fetch('/api/soutenances/aujourdhui');
        const data = await response.json();
        setSoutenances(data);
      } catch (error) {
        console.error('Erreur chargement soutenances:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSoutenances();
  }, []);

  const getStatutChip = (grillesRemplies) => {
    if (grillesRemplies.length === 0) return <Chip label="Non évalué" color="default" />;
    const complete = grillesRemplies.filter(g => g.statut === "VALIDEE").length;
    return <Chip label={`${complete}/${grillesRemplies.length} validées`} color="success" />;
  };

  if (loading) return <Typography>Chargement des soutenances...</Typography>;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Soutenances du Jour
      </Typography>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Étudiant</TableCell>
              <TableCell>Projet</TableCell>
              <TableCell>Heure</TableCell>
              <TableCell>Salle</TableCell>
              <TableCell>Statut Évaluation</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {soutenances.map((soutenance) => (
              <TableRow key={soutenance.idSoutenance}>
                <TableCell>
                  <Typography fontWeight="bold">
                    {soutenance.etudiant.nom} {soutenance.etudiant.prenom}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {soutenance.etudiant.departement} - {soutenance.etudiant.option}
                  </Typography>
                </TableCell>
                <TableCell>{soutenance.etudiant.projet}</TableCell>
                <TableCell>{new Date(soutenance.dateSoutenance).toLocaleTimeString()}</TableCell>
                <TableCell>{soutenance.salle}</TableCell>
                <TableCell>
                  {getStatutChip(soutenance.grillesRemplies)}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="contained" 
                    onClick={() => onEtudiantSelect(soutenance)}
                  >
                    Évaluer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};