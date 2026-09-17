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
    panel.innerHTML = '<header class="chat-header"><h2>Assistente da Squad B</h2><button class="chat-close" type="button" aria-label="Fechar chat">&times;</button></header><div class="chat-messages" aria-live="polite"></div><form class="chat-form"><input class="chat-input" aria-label="Sua mensagem" placeholder="Como podemos ajudar?" required><button class="chat-send" type="submit">Enviar</button></form>';
    document.body.append(toggle, panel);

    const messages = panel.querySelector('.chat-messages');
    const input = panel.querySelector('.chat-input');
    const send = panel.querySelector('.chat-send');
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
    panel.querySelector('.chat-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const question = input.value.trim();
      if (!question) return;
      addMessage(question, 'user');
      input.value = '';
      send.disabled = true;
      addMessage('Digitando...', 'assistant');
      const typing = messages.lastElementChild;
      try {
        const key = localStorage.getItem('gemini_api_key');
        const answer = key ? await askGemini(key, question) : mockAnswer(question);
        typing.textContent = answer;
      } catch (error) {
        typing.textContent = 'Nao consegui acessar a IA agora. Posso responder sobre a Squad B, seus servicos e projetos pelo modo local.';
      } finally {
        send.disabled = false;
        input.focus();
      }
    });
  }

  async function askGemini(key, question) {
    const response = await fetch(`${apiUrl}?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: `Voce e um assistente institucional da Squad B. Use este contexto: ${knowledge} Responda em portugues, com clareza e brevidade. Pergunta: ${question}` }] }] })
    });
    if (!response.ok) throw new Error('Falha na API');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Nao encontrei uma resposta para isso.';
  }

  function mockAnswer(question) {
    const normalized = question.toLowerCase();
    if (normalized.includes('serv')) return 'Oferecemos UI/UX Design, desenvolvimento web, desenvolvimento de apps e design grafico.';
    if (normalized.includes('projet')) return 'Nosso portfolio inclui sistemas de gestao escolar, e-commerce, controle financeiro, delivery e agendamento medico.';
    if (normalized.includes('habil') || normalized.includes('skill')) return 'Trabalhamos com HTML, CSS, JavaScript, Figma, Java, Node.js, Python e React.';
    return knowledge;
  }

  document.addEventListener('DOMContentLoaded', createChat);
})();