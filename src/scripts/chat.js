(function () {
  const knowledge = 'A Squad B e uma equipe de UI/UX e desenvolvimento web. Conheca nossos projetos, servicos, habilidades e cases nas paginas do portfolio.';
  const apiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  function createChat() {
    const toggle = document.createElement('button');
    toggle.className = 'chat-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Abrir assistente virtual');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '?';

    const panel = document.createElement('section');
    panel.className = 'chat-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Assistente Virtual Educacional');
    panel.innerHTML = '<header class="chat-header"><h2>Assistente da Squad B</h2><div class="chat-header-actions"><button class="chat-settings" type="button" aria-label="Configurar inteligência artificial" title="Configurar IA">Configurar IA</button><button class="chat-close" type="button" aria-label="Fechar chat">&times;</button></div></header><div class="chat-settings-panel" hidden><label for="gemini-key">Chave Gemini local</label><input id="gemini-key" type="password" autocomplete="off" placeholder="Cole sua chave API"><div><button class="chat-save-key" type="button">Salvar chave</button><button class="chat-remove-key" type="button">Remover chave</button></div><small>A chave fica somente neste navegador e nao e enviada para o repositorio.</small></div><div class="chat-suggestions" aria-label="Perguntas sugeridas"><button type="button" data-question="Quais servicos voces oferecem?">Servicos</button><button type="button" data-question="Quais projetos voces ja desenvolveram?">Projetos</button><button type="button" data-question="Quais habilidades a Squad B possui?">Habilidades</button><button type="button" data-question="Como posso entrar em contato?">Contato</button></div><div class="chat-messages" aria-live="polite"></div><form class="chat-form"><input class="chat-input" aria-label="Sua mensagem" placeholder="Digite sua pergunta..." required><button class="chat-send" type="submit">Enviar</button></form>';
    document.body.append(toggle, panel);

    const messages = panel.querySelector('.chat-messages');
    const input = panel.querySelector('.chat-input');
    const send = panel.querySelector('.chat-send');
    const conversation = [];
    const settings = panel.querySelector('.chat-settings-panel');
    const keyInput = panel.querySelector('#gemini-key');
    const addMessage = (text, role) => {
      const item = document.createElement('p');
      item.className = `chat-message chat-message--${role}`;
      item.textContent = text;
      messages.appendChild(item);
      messages.scrollTop = messages.scrollHeight;
    };

    addMessage('Ola! Sou o assistente virtual da Squad B. Posso apresentar nossos servicos, projetos e habilidades.', 'assistant');
    panel.querySelector('.chat-settings').addEventListener('click', () => {
      settings.hidden = !settings.hidden;
      if (!settings.hidden) {
        keyInput.value = localStorage.getItem('gemini_api_key') || '';
        keyInput.focus();
      }
    });
    panel.querySelector('.chat-save-key').addEventListener('click', () => {
      const key = keyInput.value.trim();
      if (key) {
        localStorage.setItem('gemini_api_key', key);
        addMessage('Chave Gemini configurada. Agora posso responder perguntas abertas.', 'assistant');
        settings.hidden = true;
      }
    });
    panel.querySelector('.chat-remove-key').addEventListener('click', () => {
      localStorage.removeItem('gemini_api_key');
      keyInput.value = '';
      addMessage('Chave removida. O chat voltou ao modo demonstracao local.', 'assistant');
    });
    toggle.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      toggle.setAttribute('aria-expanded', String(!panel.hidden));
      if (!panel.hidden) input.focus();
    });
    panel.querySelector('.chat-close').addEventListener('click', () => {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    });
    const sendQuestion = async (question) => {
      if (!question) return;
      addMessage(question, 'user');
      conversation.push({ role: 'user', text: question });
      input.value = '';
      send.disabled = true;
      panel.querySelectorAll('[data-question]').forEach((suggestion) => {
        suggestion.disabled = true;
      });
      addMessage('Digitando...', 'assistant');
      const typing = messages.lastElementChild;
      try {
        const key = localStorage.getItem('gemini_api_key');
        const answer = key ? await askGemini(key, conversation) : mockAnswer(question);
        typing.textContent = answer;
        conversation.push({ role: 'assistant', text: answer });
      } catch (error) {
        typing.textContent = getApiErrorMessage(error);
      } finally {
        send.disabled = false;
        panel.querySelectorAll('[data-question]').forEach((suggestion) => {
          suggestion.disabled = false;
        });
        input.focus();
      }
    };

    panel.querySelector('.chat-form').addEventListener('submit', (event) => {
      event.preventDefault();
      sendQuestion(input.value.trim());
    });
    panel.querySelectorAll('[data-question]').forEach((suggestion) => {
      suggestion.addEventListener('click', () => {
        input.value = suggestion.dataset.question;
        sendQuestion(input.value);
      });
    });
  }

  async function askGemini(key, conversation) {
    const model = await findAvailableModel(key);
    const contents = conversation.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.text }]
    }));
    const response = await fetch(`${apiBaseUrl}/${model}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `Voce e um assistente virtual cordial, versatil e seguro. Pode responder perguntas abertas sobre estudos, tecnologia, carreira, desenvolvimento web, escrita e assuntos gerais. Responda em portugues, explique quando necessario e admita quando nao souber. Use este contexto institucional quando a pergunta for sobre a Squad B: ${knowledge}` }]
        },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
      })
    });
    if (!response.ok) {
      let details = '';
      try {
        const errorData = await response.json();
        details = errorData.error?.message || '';
      } catch (error) {
        details = '';
      }
      throw new Error(`API ${response.status}: ${details}`.trim());
    }
    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!answer) throw new Error('Resposta vazia da API');
    return answer;
  }

  async function findAvailableModel(key) {
    const response = await fetch(`${apiBaseUrl}/models?key=${encodeURIComponent(key)}`);
    if (!response.ok) {
      throw new Error(`Modelos indisponiveis (${response.status})`);
    }
    const data = await response.json();
    const supportedModels = (data.models || [])
      .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
      .map((model) => model.name?.replace(/^models\//, ''))
      .filter(Boolean);
    const preferredModel = supportedModels.find((model) => /gemini.*flash/i.test(model)) || supportedModels[0];
    if (!preferredModel) throw new Error('Nenhum modelo com generateContent disponivel');
    return `models/${preferredModel}`;
  }

  function getApiErrorMessage(error) {
    const message = error.message.toLowerCase();
    if (message.includes('401') || message.includes('403') || message.includes('api key') || message.includes('permission')) {
      return 'A chave Gemini foi recusada. Confira a chave no Google AI Studio, remova a atual e salve uma nova.';
    }
    if (message.includes('429') || message.includes('quota') || message.includes('limit')) {
      return 'O limite da API Gemini foi atingido. Aguarde ou use outra chave/projeto.';
    }
    if (message.includes('404') || message.includes('model')) {
      return 'O modelo Gemini nao esta disponivel para esta chave. Gere uma chave no Google AI Studio e tente novamente.';
    }
    return 'Nao foi possivel acessar a IA. Verifique sua conexao e a chave Gemini em Configurar IA.';
  }

  function mockAnswer(question) {
    const normalized = question.toLowerCase();
    if (normalized.includes('serv')) return 'Oferecemos UI/UX Design, desenvolvimento web, desenvolvimento de apps e design grafico.';
    if (normalized.includes('projet')) return 'Nosso portfolio inclui sistemas de gestao escolar, e-commerce, controle financeiro, delivery e agendamento medico.';
    if (normalized.includes('habil') || normalized.includes('skill')) return 'Trabalhamos com HTML, CSS, JavaScript, Figma, Java, Node.js, Python e React.';
    if (normalized.includes('ola') || normalized.includes('oi')) return 'Ola! Posso conversar sobre tecnologia, estudos, carreira ou apresentar a Squad B. Como posso ajudar?';
    return 'Estou no modo demonstracao e consigo responder sobre a Squad B, seus servicos, projetos e habilidades. Para perguntas abertas, configure uma chave Gemini local no README.';
  }

  document.addEventListener('DOMContentLoaded', createChat);
})();