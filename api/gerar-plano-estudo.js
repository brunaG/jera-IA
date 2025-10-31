// ===================================================
          // NOVA FUNÇÃO PARA CHAMAR A API (PLANO DE ESTUDO)
          // ===================================================
          async function buscarPlanoDeEstudoGemini(pontosFracos, problema) {
            const container = document.getElementById('gemini-plano-estudo');
            const conteudo = document.getElementById('gemini-plano-conteudo');

            // Mostra o container com a mensagem de "carregando"
            container.style.display = 'block';
            conteudo.innerHTML = '<p>Personalizando seu plano de estudo... O Gemini está analisando seu desempenho.</p>';

            try {
              // Chama a NOVA API que criamos na Vercel
              const response = await fetch('/api/gerar-plano-estudo', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  pontosFracos: pontosFracos, // Array de strings, ex: ['Decomposição']
                  problema: problema       // String, ex: 'Logística E-commerce'
                })
              });

              if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
              }

              const data = await response.json(); // data é { explicacao: "...", exercicios: [...] }

              // Armazena os dados recebidos globalmente para as outras funções (PDF, Gabarito)
              planoEstudoAtual = data;

              // Limpa o conteúdo anterior
              conteudo.innerHTML = '';

              let htmlFinal = '';

              // 1. Formata e adiciona a explicação
              if (data.explicacao) {
                  // Formata quebras de linha e negrito
                  // ADICIONADO (data.explicacao || '') para garantir que seja uma string
                  let explicacaoFormatada = (data.explicacao || '')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br>');
                  htmlFinal += `<p class="explicacao-plano">${explicacaoFormatada}</p>`;
              }

              // 2. Formata e adiciona os exercícios
              if (data.exercicios && data.exercicios.length > 0) {
                  data.exercicios.forEach((ex, index) => {
                      if (!ex) return; // Pula exercício nulo/undefined

                      htmlFinal += `<div class="exercicio-plano" id="plano-ex-${index}">`;

                      // Pergunta (formatando negrito e quebras de linha)
                      // ADICIONADO (ex.pergunta || '') para defesa
                      let perguntaFormatada = (ex.pergunta || 'Exercício sem pergunta')
                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                .replace(/\n/g, '<br>');
                      htmlFinal += `<p><strong>${index + 1}.</strong> ${perguntaFormatada}</p>`;

                      // Opções (se for múltipla escolha)
                      if (ex.tipo === 'multipla_escolha' && ex.opcoes && ex.opcoes.length > 0) {
                          htmlFinal += '<ul>';
                          ex.opcoes.forEach(opt => {
                              // Formata opções também
                              // ADICIONADO (opt || '') para defesa
                              let optFormatada = (opt || 'Opção inválida').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                              htmlFinal += `<li>${optFormatada}</li>`;
                          });
                          htmlFinal += '</ul>';
                      }

                      // Gabarito (oculto)
                      // ADICIONADO (ex.resposta_correta || '') para defesa
                      let respostaFormatada = (ex.resposta_correta || 'Resposta não fornecida')
                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                .replace(/\n/g, '<br>');
                      htmlFinal += `<div class="gabarito-resposta"><strong>Gabarito:</strong> ${respostaFormatada}</div>`;

                      htmlFinal += '</div>';
                  });

                  // Mostra os botões de ação (Gabarito, PDF, etc.)
                  document.getElementById('plano-estudo-acoes').style.display = 'flex';
                  // Reseta o botão do gabarito
                  document.getElementById('btn-gabarito').innerHTML = '👁️ Mostrar Gabarito';
                  container.classList.remove('mostrar-gabarito');

              } else {
                  // Se não houver exercícios (só a explicação de parabéns)
                  document.getElementById('plano-estudo-acoes').style.display = 'none';
              }

              conteudo.innerHTML = htmlFinal;

            } catch (error) {
              console.error('Falha ao buscar plano de estudo:', error);
              conteudo.innerHTML = '<p style="color: red;">Desculpe, não foi possível gerar seu plano de estudo no momento. Tente recarregar.</p>';
            }
          }
