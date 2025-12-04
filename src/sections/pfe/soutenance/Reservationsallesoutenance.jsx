import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  TextField,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import frLocale from "date-fns/locale/fr";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const GestionSoutenances = ({ cursusId=1 }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [heureDebut, setHeureDebut] = useState(new Date());
  const [heureFin, setHeureFin] = useState(new Date());
  const [salles, setSalles] = useState([]);
  const [allSalles, setAllSalles] = useState([]);
const navigate = useNavigate();

  const fetchAllSalles = async () => {
    if (!cursusId) {
      console.warn("Aucun cursusId fourni. Impossible de récupérer les salles.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8222/api/salle/contSalle/byCursus/${cursusId}`
      );

      if (Array.isArray(response.data)) {
        setAllSalles(response.data);
      } else {
        console.error("Réponse inattendue du serveur:", response.data);
        setAllSalles([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des salles:", error.message || error);
      setAllSalles([]);
    }
  };

  const fetchSallesDisponibles = async () => {
    if (!selectedDate || !heureDebut || !heureFin || !cursusId) {
      console.warn("Paramètres manquants pour récupérer les salles disponibles.");
      return;
    }

    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const heureDebutStr = heureDebut.toTimeString().split(" ")[0];
      const heureFinStr = heureFin.toTimeString().split(" ")[0];

      const response = await axios.get(
        "http://localhost:8222/api/salle/disponibiliteSalle/toutesDisponibilites",
        {
          params: {
            dateDebut: dateStr,
            heureDebut: heureDebutStr,
            heureFin: heureFinStr,
            cursusId: cursusId,
          },
        }
      );

      if (Array.isArray(response.data)) {
        setSalles(response.data);
      } else {
        console.error("Réponse inattendue du serveur:", response.data);
        setSalles([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des salles disponibles:", error.message || error);
      setSalles([]);
    }
  };

  useEffect(() => {
    fetchAllSalles();
  }, [cursusId]);

  useEffect(() => {
    fetchSallesDisponibles();
  }, [selectedDate, heureDebut, heureFin]);

  const total = allSalles.length;
  const disponibles = salles.length;
  const occupees = allSalles.filter(s => !salles.find(d => d.id === s.id)).length;
  const reservees = 0; // à compléter si tu as une logique de réservation future

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Gestion des Soutenances – {selectedDate.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <DatePicker
            label="Date de soutenance"
            value={selectedDate}
            onChange={(newDate) => setSelectedDate(newDate)}
            renderInput={(params) => <TextField {...params} />}
          />
          <TimePicker
            label="Heure début"
            value={heureDebut}
            onChange={(newTime) => setHeureDebut(newTime)}
            renderInput={(params) => <TextField {...params} />}
          />
          <TimePicker
            label="Heure fin"
            value={heureFin}
            onChange={(newTime) => setHeureFin(newTime)}
            renderInput={(params) => <TextField {...params} />}
          />
        </Box>
      </LocalizationProvider>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Chip label={`Salles Totales: ${total}`} color="default" />
<Chip
  label={`Disponibles: ${disponibles}`}
  
  color="success"
  clickable
  onClick={() => navigate("/pfe/soutenance/planification")}
/>

        <Chip label={`Occupées: ${occupees}`} color="error" />
        <Chip label={`Réservées: ${reservees}`} color="warning" />
        <Button startIcon={<CalendarTodayIcon />} variant="outlined">
          {selectedDate.toLocaleDateString("fr-FR")}
        </Button>
      </Box>

      <Grid container spacing={2}>
        {allSalles.map((salle) => {
          const isDisponible = salles.find((s) => s.id === salle.id);
          return (
            <Grid item xs={12} md={6} lg={4} key={salle.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{salle.nom}</Typography>
                    <Chip
                      label={isDisponible ? "Disponible" : "Occupée"}
                      color={isDisponible ? "success" : "error"}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Capacité: {salle.capacite} places
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Type: {salle.typesalle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Localisation: {salle.localisation}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" gap={1}>
                    <Button variant="contained" size="small">
                      Réserver
                    </Button>
                    <Button variant="outlined" size="small">
                      Détails
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default GestionSoutenances;
