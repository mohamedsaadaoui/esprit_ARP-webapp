import { useCallback } from 'react';

const useCalculNotes = () => {
  
  const calculerTotal = useCallback((notes, structuredData) => {
    if (!notes || !structuredData) return 0;
    
    let total = 0;
    
    // Parcourir toutes les sections et sous-sections pour calculer le total
    structuredData.sections.forEach(section => {
      section.sousSections.forEach(sousSection => {
        sousSection.elements.forEach(element => {
          const noteElement = notes[element.id]?.points || 0;
          // Ne pas dépasser le maximum autorisé pour l'élément
          total += Math.min(noteElement, element.points);
        });
      });
    });
    
    return parseFloat(total.toFixed(2));
  }, []);

  const calculerNoteSur20 = useCallback((total, totalMax) => {
    if (totalMax <= 0) return 0;
    return parseFloat(((total / totalMax) * 20).toFixed(2));
  }, []);

  return {
    calculerTotal,
    calculerNoteSur20
  };
};

export default useCalculNotes;