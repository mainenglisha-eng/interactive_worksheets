import { Worksheet } from '../types';

export function exportWorksheetToHTML5(worksheet: Worksheet): string {
  // Serialize worksheet details
  const escapedTitle = worksheet.title.replace(/"/g, '&quot;');
  
  // Create a structured list of pages, each with its background and fields
  const pagesHtml = worksheet.backgrounds.map((bg, idx) => {
    const pageNum = idx + 1;
    const pageFields = worksheet.fields.filter(f => f.page === pageNum);
    
    const fieldsHtml = pageFields.map(field => {
      let inputElement = '';
      
      if (field.type === 'text') {
        inputElement = `
          <input 
            type="text" 
            id="field-${field.id}" 
            data-field-id="${field.id}"
            data-correct="${field.correctAnswer.replace(/"/g, '&quot;')}"
            data-points="${field.points}"
            class="worksheet-input text-field" 
            placeholder="${field.placeholder || ''}"
            style="width: 100%; height: 100%; border: 1.5px dashed #4f46e5; border-radius: 4px; padding: 2px 6px; font-size: 14px; outline: none; background: rgba(255, 255, 255, 0.85); box-sizing: border-box;"
          />
        `;
      } else if (field.type === 'select') {
        const optionsHtml = [
          `<option value="">-- Selecciona --</option>`,
          ...field.options.map(opt => `<option value="${opt.replace(/"/g, '&quot;')}">${opt}</option>`)
        ].join('');
        
        inputElement = `
          <select 
            id="field-${field.id}" 
            data-field-id="${field.id}"
            data-correct="${field.correctAnswer.replace(/"/g, '&quot;')}"
            data-points="${field.points}"
            class="worksheet-input select-field"
            style="width: 100%; height: 100%; border: 1.5px dashed #4f46e5; border-radius: 4px; font-size: 14px; outline: none; background: rgba(255, 255, 255, 0.85); box-sizing: border-box; cursor: pointer;"
          >
            ${optionsHtml}
          </select>
        `;
      } else if (field.type === 'choice') {
        // Choice field can render as a set of options (rendered inside the overlay container)
        const optionsHtml = field.options.map((opt, oIdx) => {
          return `
            <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 12px; margin-bottom: 2px; background: rgba(255,255,255,0.9); padding: 2px 4px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); width: 100%; box-sizing: border-box;">
              <input 
                type="radio" 
                name="radio-${field.id}" 
                value="${opt.replace(/"/g, '&quot;')}"
                data-field-id="${field.id}"
                data-correct="${field.correctAnswer.replace(/"/g, '&quot;')}"
                data-points="${field.points}"
                class="worksheet-input choice-option"
                style="margin: 0; cursor: pointer;"
              />
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${opt}</span>
            </label>
          `;
        }).join('');
        
        inputElement = `
          <div style="display: flex; flex-direction: column; justify-content: center; width: 100%; height: 100%; box-sizing: border-box; padding: 2px;">
            ${optionsHtml}
          </div>
        `;
      }
      
      return `
        <div 
          class="field-container" 
          id="container-${field.id}"
          style="
            position: absolute; 
            left: ${field.x}%; 
            top: ${field.y}%; 
            width: ${field.width}%; 
            height: ${field.height}%; 
            z-index: 10;
          "
        >
          ${inputElement}
        </div>
      `;
    }).join('\n');

    return `
      <div class="page-container" id="page-${pageNum}" style="position: relative; width: 100%; max-width: 900px; margin: 0 auto 30px auto; box-shadow: 0 4px 20px rgba(0,0,0,0.15); border-radius: 8px; overflow: hidden; background: #fff;">
        <div class="page-header" style="background: #f8fafc; padding: 8px 16px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; color: #475569; font-size: 14px;">Página ${pageNum}</span>
          <span style="font-size: 12px; color: #94a3b8; font-family: monospace;">Ficha Interactiva HTML5</span>
        </div>
        <div style="position: relative; width: 100%; display: inline-block;">
          <img 
            src="${bg}" 
            alt="Página ${pageNum}" 
            style="width: 100%; display: block; height: auto;" 
            referrerpolicy="no-referrer"
          />
          <div class="fields-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
            ${fieldsHtml}
          </div>
        </div>
      </div>
    `;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedTitle}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f1f5f9;
      color: #1e293b;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    
    header {
      background-color: #4f46e5;
      color: white;
      width: 100%;
      padding: 20px 0;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    
    .subtitle {
      margin: 5px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    
    main {
      width: 100%;
      padding: 30px 15px;
      box-sizing: border-box;
      max-width: 1000px;
    }
    
    .actions-panel {
      background: white;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    
    .btn {
      background-color: #4f46e5;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .btn:hover {
      background-color: #4338ca;
    }
    
    .btn-reset {
      background-color: #64748b;
    }
    
    .btn-reset:hover {
      background-color: #475569;
    }
    
    .score-card {
      background-color: #ecfdf5;
      border: 1px solid #10b981;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      display: none;
      margin-bottom: 24px;
      animation: fadeIn 0.3s ease-out;
    }
    
    .score-title {
      font-size: 18px;
      font-weight: bold;
      color: #065f46;
      margin: 0 0 8px 0;
    }
    
    .score-value {
      font-size: 32px;
      font-weight: 800;
      color: #10b981;
      margin: 0;
    }

    /* Grading feedback styles */
    .correct-field {
      border-color: #10b981 !important;
      background-color: #ecfdf5 !important;
      color: #065f46 !important;
    }
    
    .incorrect-field {
      border-color: #ef4444 !important;
      background-color: #fef2f2 !important;
      color: #991b1b !important;
    }

    .correct-option-label {
      border: 1.5px solid #10b981 !important;
      background-color: #ecfdf5 !important;
    }

    .incorrect-option-label {
      border: 1.5px solid #ef4444 !important;
      background-color: #fef2f2 !important;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>

  <header>
    <h1>${escapedTitle}</h1>
    <p class="subtitle">Completa la ficha interactiva y califica tus respuestas</p>
  </header>

  <main>
    <div class="score-card" id="scoreCard">
      <p class="score-title">¡Ficha Calificada!</p>
      <p class="score-value" id="scoreValue">0 / 0</p>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #047857;">Las respuestas correctas se muestran en verde, las incorrectas en rojo.</p>
    </div>

    <div class="actions-panel">
      <span style="font-size: 14px; color: #64748b; font-weight: 500;">Llena todos los campos antes de calificar</span>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-reset" onclick="resetAnswers()">Reiniciar Ficha</button>
        <button class="btn" onclick="gradeWorksheet()">Corregir y Calificar</button>
      </div>
    </div>

    <div class="worksheet-pages">
      ${pagesHtml}
    </div>
  </main>

  <script>
    function gradeWorksheet() {
      // Hide previous results formatting first
      resetStyles();
      
      let totalPoints = 0;
      let earnedPoints = 0;
      
      // 1. Grade Text Fields and Select Fields
      const inputs = document.querySelectorAll('input.text-field, select.select-field');
      inputs.forEach(input => {
        const correctVal = input.getAttribute('data-correct').trim().toLowerCase();
        const points = parseFloat(input.getAttribute('data-points') || '1');
        const studentVal = input.value.trim().toLowerCase();
        
        totalPoints += points;
        
        if (studentVal === correctVal && correctVal !== '') {
          earnedPoints += points;
          input.classList.add('correct-field');
        } else {
          input.classList.add('incorrect-field');
          
          // Append a small correct answer tooltip if incorrect
          const tooltip = document.createElement('span');
          tooltip.className = 'correct-answer-tooltip';
          tooltip.innerText = 'R: ' + input.getAttribute('data-correct');
          tooltip.style.cssText = 'position: absolute; background: #1e293b; color: white; font-size: 10px; padding: 2px 4px; border-radius: 4px; bottom: 100%; left: 0; white-space: nowrap; z-index: 100; pointer-events: none;';
          input.parentNode.appendChild(tooltip);
        }
      });
      
      // 2. Grade Radio Choice Fields
      // Group choices by fieldId
      const choiceFields = {};
      const choiceInputs = document.querySelectorAll('input.choice-option');
      
      choiceInputs.forEach(input => {
        const fieldId = input.getAttribute('data-field-id');
        if (!choiceFields[fieldId]) {
          choiceFields[fieldId] = {
            inputs: [],
            correct: input.getAttribute('data-correct'),
            points: parseFloat(input.getAttribute('data-points') || '1')
          };
        }
        choiceFields[fieldId].inputs.push(input);
      });
      
      Object.keys(choiceFields).forEach(fieldId => {
        const data = choiceFields[fieldId];
        totalPoints += data.points;
        
        let selectedInput = null;
        data.inputs.forEach(input => {
          if (input.checked) {
            selectedInput = input;
          }
        });
        
        if (selectedInput && selectedInput.value === data.correct) {
          earnedPoints += data.points;
          // Highlight the selected label
          if (selectedInput.parentNode) {
            selectedInput.parentNode.style.borderColor = '#10b981';
            selectedInput.parentNode.style.backgroundColor = '#ecfdf5';
          }
        } else {
          // Highlight incorrect on the selected one
          if (selectedInput && selectedInput.parentNode) {
            selectedInput.parentNode.style.borderColor = '#ef4444';
            selectedInput.parentNode.style.backgroundColor = '#fef2f2';
          }
          
          // Show which was correct
          data.inputs.forEach(input => {
            if (input.value === data.correct && input.parentNode) {
              input.parentNode.style.border = '1.5px dashed #10b981';
              input.parentNode.style.backgroundColor = '#f0fdf4';
            }
          });
        }
      });
      
      // 3. Display Score
      const scoreCard = document.getElementById('scoreCard');
      const scoreValue = document.getElementById('scoreValue');
      scoreValue.innerText = earnedPoints + ' / ' + totalPoints + ' pts';
      scoreCard.style.display = 'block';
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    function resetStyles() {
      // Remove input classes
      document.querySelectorAll('.worksheet-input').forEach(input => {
        input.classList.remove('correct-field', 'incorrect-field');
        if (input.parentNode && input.parentNode.tagName === 'LABEL') {
          input.parentNode.style.border = 'none';
          input.parentNode.style.backgroundColor = 'rgba(255,255,255,0.9)';
          input.parentNode.style.borderColor = 'transparent';
        }
      });
      
      // Remove correct answer tooltips
      document.querySelectorAll('.correct-answer-tooltip').forEach(tooltip => {
        tooltip.remove();
      });
    }
    
    function resetAnswers() {
      resetStyles();
      
      // Clear inputs
      document.querySelectorAll('input.text-field').forEach(input => {
        input.value = '';
      });
      
      // Clear select fields
      document.querySelectorAll('select.select-field').forEach(select => {
        select.value = '';
      });
      
      // Clear radio options
      document.querySelectorAll('input.choice-option').forEach(radio => {
        radio.checked = false;
      });
      
      // Hide score card
      document.getElementById('scoreCard').style.display = 'none';
    }
  </script>
</body>
</html>
`;
}
