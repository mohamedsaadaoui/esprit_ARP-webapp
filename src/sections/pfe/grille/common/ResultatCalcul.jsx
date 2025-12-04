// src/sections/pfe/grille/common/ResultatCalcul.jsx
import React from 'react';

const ResultatCalcul = ({ noteFinale, moyenne, appreciation }) => {
  return (
    <div className="resultat-calcul">
      <h3>Résultats du Calcul</h3>
      <div className="notes-container">
        <div className="note-item">
          <span>Note Finale: </span>
          <strong>{noteFinale}</strong>
        </div>
        <div className="note-item">
          <span>Moyenne: </span>
          <strong>{moyenne}</strong>
        </div>
        <div className="appreciation">
          <span>Appréciation: </span>
          <em>{appreciation}</em>
        </div>
      </div>
    </div>
  );
};

export default ResultatCalcul; // ← Export default