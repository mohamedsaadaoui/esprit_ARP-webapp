import PropTypes from 'prop-types';
import React, { useMemo, useState, useEffect, useContext, createContext } from 'react';

import semestreService from 'src/services/emploi-services/semestreService';

import { useAuthContext } from './auth/hooks'; // Ajout de l'import
import cursusService from './services/emploi-services/cursusService';
import vacanceService from './services/emploi-services/vacanceService';
import anneeUniversitaireService from './services/emploi-services/anneeunivService';

const GlobalDataContext = createContext({});

export const GlobalDataProvider = ({ children }) => {
  // Utiliser le contexte d'authentification
  const { user, isLoading: authLoading } = useAuthContext();
  
  const [cursusList, setCursusList] = useState([]);
  const [vacancesList, setVacancesList] = useState([]);
  const [anneesUniversitaires, setAnneesUniversitaires] = useState([]);
  const [cursusSelectionne, setCursusSelectionne] = useState(null);
  const [anneeSelectionne, setAnneeSelectionne] = useState(null);
  const [semestres, setSemestres] = useState([]);
  const [semestreSelectionne, setSemestreSelectionne] = useState(null);

  // Réinitialiser l'état lors de la déconnexion
  useEffect(() => {
    if (!authLoading && !user) {
      setCursusList([]);
      setVacancesList([]);
      setAnneesUniversitaires([]);
      setCursusSelectionne(null);
      setAnneeSelectionne(null);
      setSemestres([]);
      setSemestreSelectionne(null);
    }
  }, [user, authLoading]);

  // Chargement des données principales
  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !user) return;

      try {
        const [allCursus, anneesData] = await Promise.all([
          cursusService.getAllCursus(),
          anneeUniversitaireService.getAllAnneesUniversitaires(),
        ]);

        let filteredCursus = allCursus;
        if (user?.cursus?.length > 0) {
          filteredCursus = allCursus.filter(cursus =>
            user.cursus.some(userCur =>
              userCur.trim().toLowerCase() === cursus.nom.trim().toLowerCase()
            )
          );
        }

        setCursusList(filteredCursus);
        setAnneesUniversitaires(anneesData);

        if (filteredCursus.length > 0) {
          setCursusSelectionne(prev => prev || filteredCursus[0].id);
        }

        if (anneesData.length > 0) {
          const anneeActive = anneesData.find(annee => annee.etatAnnee);
          setAnneeSelectionne(prev => prev || (anneeActive?.id || anneesData[0].id));
        }

      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };

    fetchData();
  }, [user, authLoading]);

  // Chargement des vacances
  useEffect(() => { 
    const fetchVacances = async () => {
      if (authLoading || !user || !cursusSelectionne) return;

      try {
        const vacances = await vacanceService.getAllVacancesByCursus(cursusSelectionne);
        setVacancesList(vacances);
      } catch (error) {
        console.error('Erreur lors de la récupération des vacances:', error);
      }
    };

    fetchVacances();
  }, [cursusSelectionne, user, authLoading]);

  // Chargement des semestres
  useEffect(() => {
    const fetchSemestres = async () => {
      if (authLoading || !user || !cursusSelectionne || !anneeSelectionne) return;

      try {
        const semestresResult = await semestreService.listerSemestresParCursusEtAnnee(
          cursusSelectionne,
          anneeSelectionne
        );
        setSemestres(semestresResult);
      } catch (error) {
        console.error('Erreur lors de la récupération des semestres:', error);
      }
    };

    fetchSemestres();
  }, [cursusSelectionne, anneeSelectionne, user, authLoading]);

  const value = useMemo(() => ({
    cursusList,
    anneesUniversitaires,
    cursusSelectionne,
    setCursusSelectionne,
    anneeSelectionne,
    setAnneeSelectionne,
    semestres,
    semestreSelectionne,
    setSemestreSelectionne,
    vacancesList,
  }), [
    cursusList,
    anneesUniversitaires,
    cursusSelectionne,
    anneeSelectionne,
    semestres,
    semestreSelectionne,
    vacancesList
  ]);

  return (
    <GlobalDataContext.Provider value={value}>
      {children}
    </GlobalDataContext.Provider>
  );
};

GlobalDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useGlobalData = () => useContext(GlobalDataContext);
export default GlobalDataContext;