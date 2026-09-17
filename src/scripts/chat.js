(function () {
  const knowledge = 'A Squad B e uma equipe de UI/UX e desenvolvimento web. Conheca nossos projetos, servicos, habilidades e cases nas paginas do portfolio.';
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

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
    panel.innerHTML = '<header class="chat-header"><h2>Assistente da Squad B</h2><button class="chat-close" type="button" aria-label="Fechar chat">&times;</button></header><div class="chat-suggestions" aria-label="Perguntas sugeridas"><button type="button" data-question="Quais servicos voces oferecem?">Servicos</button><button type="button" data-question="Quais projetos voces ja desenvolveram?">Projetos</button><button type="button" data-question="Quais habilidades a Squad B possui?">Habilidades</button><button type="button" data-question="Como posso entrar em contato?">Contato</button></div><div class="chat-messages" aria-live="polite"></div><form class="chat-form"><input class="chat-input" aria-label="Sua mensagem" placeholder="Digite sua pergunta..." required><button class="chat-send" type="submit">Enviar</button></form>';
    document.body.append(toggle, panel);

    const messages = panel.querySelector('.chat-messages');
    const input = panel.querySelector('.chat-input');
    const send = panel.querySelector('.chat-send');
    const conversation = [];
    const addMessage = (text, role) => {
      const item = document.createElement('p');
      item.className = `chat-message chat-message--${role}`;
      item.textContent = text;
      messages.appendChild(item);
      messages.scrollTop = messages.scrollHeight;
    };

    addMessage('Ola! Sou o assistente virtual da Squad B. Posso apresentar nossos servicos, projetos e habilidades.', 'assistant');
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
        typing.textContent = 'Nao consegui acessar a IA agora. Verifique sua chave ou continue usando as perguntas sobre a Squad B.';
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
    const contents = conversation.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.text }]
    }));
    const response = await fetch(`${apiUrl}?key=${encodeURIComponent(key)}`, {
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
    if (!response.ok) throw new Error('Falha na API');
    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!answer) throw new Error('Resposta vazia da API');
    return answer;
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