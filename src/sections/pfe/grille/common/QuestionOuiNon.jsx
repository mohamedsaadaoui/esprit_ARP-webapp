import React from 'react';

const QuestionOuiNon = ({ question, onReponseChange, reponses }) => {
  const reponseActuelle = reponses[question.id];

  return (
    <div className="question-ouinon border-b pb-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <label className="font-medium text-gray-700 flex-1">
          {question.text}
        </label>
        <span className="text-sm text-gray-500 ml-2">({question.points} pt)</span>
      </div>
      
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={question.id}
            value="oui"
            checked={reponseActuelle === true}
            onChange={() => onReponseChange(question.id, true)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-green-600 font-medium">Oui</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={question.id}
            value="non"
            checked={reponseActuelle === false}
            onChange={() => onReponseChange(question.id, false)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-red-600 font-medium">Non</span>
        </label>
      </div>
    </div>
  );
};

export default QuestionOuiNon;