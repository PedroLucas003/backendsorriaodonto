// document.getElementById('prontuarioForm').addEventListener('submit', async function (e) {
//     e.preventDefault();
  
//     const cpf = document.getElementById('cpf').value;
//     const senha = document.getElementById('senha').value;
  
//     const response = await fetch('http://localhost:3000/api/prontuario', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ cpf, senha }),
//     });
  
//     const data = await response.json();
//     const resultDiv = document.getElementById('result');
  
//     if (response.ok) {
//       resultDiv.innerHTML = `<p><strong>Dados do Prontuário:</strong></p><pre>${JSON.stringify(data, null, 2)}</pre>`;
//     } else {
//       resultDiv.textContent = data.error || 'Erro ao consultar prontuário.';
//     }
//   });
  