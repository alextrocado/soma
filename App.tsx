
import React, { useState, useEffect, useCallback } from 'react';
import { Problem, UserInput, ValidationResult } from './types';
import GridInput from './components/GridInput';

const App: React.FC = () => {
  const [problem, setProblem] = useState<Problem>({ num1: 0, num2: 0 });
  const [userInput, setUserInput] = useState<UserInput>({
    row1D: '', row1U: '',
    row2D: '', row2U: '',
    carry: '',
    resultD: '', resultU: ''
  });
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const generateNewProblem = useCallback(() => {
    // Garantir que a soma resulte em transporte em ~50% das vezes para treino
    let n1, n2;
    const forceCarry = Math.random() > 0.5;
    
    if (forceCarry) {
      n1 = Math.floor(Math.random() * 40) + 15; // 15-54
      // Garantir que as unidades somem > 9
      const u1 = n1 % 10;
      const u2 = Math.floor(Math.random() * (9 - (10 - u1) + 1)) + (10 - u1);
      n2 = (Math.floor(Math.random() * 3) + 1) * 10 + u2;
    } else {
      n1 = Math.floor(Math.random() * 40) + 10;
      n2 = Math.floor(Math.random() * 40) + 10;
    }
    
    setProblem({ num1: n1, num2: n2 });
    setUserInput({
      row1D: '', row1U: '',
      row2D: '', row2U: '',
      carry: '',
      resultD: '', resultU: ''
    });
    setValidation(null);
    setShowFeedback(false);
  }, []);

  useEffect(() => {
    generateNewProblem();
  }, [generateNewProblem]);

  const updateInput = (field: keyof UserInput, value: string) => {
    setUserInput(prev => ({ ...prev, [field]: value }));
    if (validation) setValidation(null);
  };

  const validate = () => {
    const fieldErrors: Partial<Record<keyof UserInput, boolean>> = {};
    const sum = problem.num1 + problem.num2;
    
    const p1String = problem.num1.toString().padStart(2, '0');
    const p2String = problem.num2.toString().padStart(2, '0');
    
    const u1Val = userInput.row1D + userInput.row1U;
    const u2Val = userInput.row2D + userInput.row2U;

    // Verificação de comutatividade: as parcelas podem estar em qualquer ordem
    const isMatchDirect = (u1Val === p1String && u2Val === p2String);
    const isMatchSwapped = (u1Val === p2String && u2Val === p1String);
    const numbersAreCorrect = isMatchDirect || isMatchSwapped;

    if (!numbersAreCorrect) {
      // Se a primeira linha não é nem p1 nem p2
      if (u1Val !== p1String && u1Val !== p2String) {
        fieldErrors.row1D = true;
        fieldErrors.row1U = true;
      }
      // Se a segunda linha não é nem p1 nem p2
      if (u2Val !== p1String && u2Val !== p2String) {
        fieldErrors.row2D = true;
        fieldErrors.row2U = true;
      }
      // Caso especial: se inseriu o mesmo número nas duas linhas e eles não são iguais no problema
      if (u1Val === u2Val && (u1Val === p1String || u1Val === p2String) && p1String !== p2String) {
        fieldErrors.row2D = true;
        fieldErrors.row2U = true;
      }
    }

    // O transporte e o resultado são sempre os mesmos independentemente da ordem
    const uDigit1 = problem.num1 % 10;
    const uDigit2 = problem.num2 % 10;
    const correctCarry = (uDigit1 + uDigit2 > 9) ? "1" : "";
    const correctResU = (sum % 10).toString();
    const correctResD = Math.floor(sum / 10).toString();

    if (userInput.carry !== correctCarry) fieldErrors.carry = true;
    if (userInput.resultD !== correctResD) fieldErrors.resultD = true;
    if (userInput.resultU !== correctResU) fieldErrors.resultU = true;

    const hasErrors = Object.keys(fieldErrors).length > 0;
    const errors: string[] = [];
    
    if (hasErrors) {
      if (fieldErrors.row1D || fieldErrors.row1U || fieldErrors.row2D || fieldErrors.row2U) {
        errors.push("Verifica se escreveste as duas parcelas corretamente.");
      }
      if (fieldErrors.carry) {
        errors.push("O transporte (quadradinho vermelho) não está correto.");
      }
      if (fieldErrors.resultD || fieldErrors.resultU) {
        errors.push("O resultado da soma não está correto.");
      }
    }

    setValidation({ isValid: !hasErrors, errors, fieldErrors });
    setShowFeedback(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-yellow-50">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-orange-600 mb-2">Treino de Algoritmo</h1>
        <p className="text-gray-600 text-lg">Podes colocar os números em qualquer ordem!</p>
      </header>

      {/* Target Problem Display */}
      <div className="bg-black text-white rounded-xl px-10 py-4 mb-8 shadow-xl">
        <span className="text-4xl font-bold tracking-widest">
          {problem.num1} + {problem.num2} = ?
        </span>
      </div>

      {/* Addition Grid Algorithm */}
      <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-orange-100 select-none">
        <div className="flex space-x-6">
          {/* Sign column */}
          <div className="flex flex-col justify-center pt-20">
            <span className="text-4xl font-bold text-gray-400">+</span>
          </div>

          {/* Tens Column (Dezenas) */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full bg-yellow-400 text-white font-bold py-1 rounded-t-lg text-center text-xl">D</div>
            
            {/* Carry Box - Small and to the Right above Tens */}
            <div className="w-full flex justify-end pr-1">
              <GridInput 
                variant="carry" 
                value={userInput.carry} 
                onChange={(v) => updateInput('carry', v)}
                isError={validation?.fieldErrors.carry}
              />
            </div>

            <GridInput value={userInput.row1D} onChange={(v) => updateInput('row1D', v)} isError={validation?.fieldErrors.row1D} />
            <GridInput value={userInput.row2D} onChange={(v) => updateInput('row2D', v)} isError={validation?.fieldErrors.row2D} />
            
            <div className="w-full border-t-4 border-gray-800 my-1"></div>
            
            <GridInput variant="result" value={userInput.resultD} onChange={(v) => updateInput('resultD', v)} isError={validation?.fieldErrors.resultD} />
          </div>

          {/* Units Column (Unidades) */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full bg-green-500 text-white font-bold py-1 rounded-t-lg text-center text-xl">U</div>
            
            {/* Spacer for carry alignment */}
            <div className="h-6 md:h-8"></div>

            <GridInput value={userInput.row1U} onChange={(v) => updateInput('row1U', v)} isError={validation?.fieldErrors.row1U} />
            <GridInput value={userInput.row2U} onChange={(v) => updateInput('row2U', v)} isError={validation?.fieldErrors.row2U} />
            
            <div className="w-full border-t-4 border-gray-800 my-1"></div>
            
            <GridInput variant="result" value={userInput.resultU} onChange={(v) => updateInput('resultU', v)} isError={validation?.fieldErrors.resultU} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <button 
          onClick={validate}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-12 rounded-2xl shadow-lg transition-transform active:scale-95 text-xl"
        >
          Verificar Resposta
        </button>
        <button 
          onClick={generateNewProblem}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-12 rounded-2xl shadow-lg transition-transform active:scale-95 text-xl"
        >
          Próxima Conta
        </button>
      </div>

      {/* Feedback Area */}
      {showFeedback && validation && (
        <div className={`mt-6 max-w-sm w-full p-5 rounded-2xl border-4 animate-pop-in ${validation.isValid ? 'bg-green-100 border-green-400 text-green-900' : 'bg-red-100 border-red-400 text-red-900'}`}>
          {validation.isValid ? (
            <div className="text-center">
              <span className="text-5xl block mb-2">🌟</span>
              <p className="text-2xl font-bold">Excelente trabalho!</p>
            </div>
          ) : (
            <div>
              <span className="text-xl font-bold block mb-2">Quase lá! Vamos corrigir:</span>
              <ul className="list-disc pl-5 space-y-1">
                {validation.errors.map((err, i) => (
                  <li key={i} className="font-medium">{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
          animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .shake-animation {
          animation: shake 0.2s ease-in-out 2;
        }
      `}</style>
    </div>
  );
};

export default App;
