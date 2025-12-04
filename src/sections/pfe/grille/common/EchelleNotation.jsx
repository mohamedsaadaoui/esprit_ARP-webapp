import React from 'react';

const EchelleNotation = ({ echelle, onSelectNote, notesSelectionnees, critereId }) => {
  return (
    <div className="echelle-notation">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Échelle de notation :</h4>
      <div className="flex flex-wrap gap-2">
        {echelle.map((niveau) => (
          <button
            key={niveau.note}
            className={`px-3 py-2 rounded-lg border transition-all ${
              notesSelectionnees[critereId]?.note === niveau.note
                ? 'ring-2 ring-offset-2'
                : 'hover:shadow-md'
            }`}
            style={{
              backgroundColor: niveau.couleur + '20',
              borderColor: niveau.couleur,
              color: niveau.couleur,
              ringColor: niveau.couleur
            }}
            onClick={() => onSelectNote(critereId, niveau)}
          >
            <div className="font-bold">{niveau.note}</div>
            <div className="text-xs">{niveau.points} pts</div>
          </button>
        ))}
      </div>
      {notesSelectionnees[critereId] && (
        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
          <strong>{notesSelectionnees[critereId].note}</strong>: {notesSelectionnees[critereId].description}
        </div>
      )}
    </div>
  );
};

export default EchelleNotation;