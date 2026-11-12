const messageInput = document.getElementById('messageInput');
const chatLog = document.getElementById('chatLog');
const sendBtn = document.getElementById('sendBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const voiceBtn = document.getElementById('voiceBtn');
const imagePrompt = document.getElementById('imagePrompt');
const generateImageBtn = document.getElementById('generateImageBtn');
const imageResult = document.getElementById('imageResult');
const pdfInput = document.getElementById('pdfInput');
const pdfQuestion = document.getElementById('pdfQuestion');
const analyzePdfBtn = document.getElementById('analyzePdfBtn');
const modeButtons = document.querySelectorAll('.mode-btn');

let currentMode = 'chat';
let history = JSON.parse(localStorage.getItem('jarvis-history') || '[]');
const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function appendMessage(role, text) {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role}`;

  const label = document.createElement('small');
  label.textContent = role === 'user' ? 'You' : 'JARVIS';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = text;

  wrapper.append(label, bubble);
  chatLog.appendChild(wrapper);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function saveHistory() {
  localStorage.setItem('jarvis-history', JSON.stringify(history));
}

function renderHistory() {
  chatLog.innerHTML = '';
  for (const item of history) {
    appendMessage(item.role, item.content);
  }
}

async function streamChat(message) {
  appendMessage('user', message);

  const responseText = document.createElement('div');
  responseText.className = 'message assistant';
  const label = document.createElement('small');
  label.textContent = 'JARVIS';
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = 'Thinking...';
  responseText.append(label, bubble);
  chatLog.appendChild(responseText);
  chatLog.scrollTop = chatLog.scrollHeight;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        mode: currentMode,
        history
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Unable to contact JARVIS.' }));
      throw new Error(errorData.error || 'Unable to contact JARVIS.');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        if (!part.startsWith('data: ')) continue;
        try {
          const payload = JSON.parse(part.slice(6));
          if (payload.delta) {
            bubble.textContent += payload.delta;
            chatLog.scrollTop = chatLog.scrollHeight;
          }
          if (payload.done) {
            history.push({ role: 'user', content: message });
            history.push({ role: 'assistant', content: bubble.textContent });
            saveHistory();
          }
          if (payload.error) {
            bubble.textContent = payload.error;
          }
        } catch (error) {
          console.error('SSE parse error', error);
        }
      }
    }
  } catch (error) {
    bubble.textContent = error.message || 'Something went wrong.';
    console.error(error);
  }
}

function handleSend() {
  const message = messageInput.value.trim();
  if (!message) return;
  messageInput.value = '';
  messageInput.style.height = 'auto';
  streamChat(message);
}

sendBtn.addEventListener('click', handleSend);
messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSend();
  }
});

clearChatBtn.addEventListener('click', () => {
  history = [];
  localStorage.removeItem('jarvis-history');
  renderHistory();
});

modeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentMode = button.dataset.mode;
    modeButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
  });
});

voiceBtn.addEventListener('click', () => {
  if (!recognition) {
    alert('Voice input is not supported in this browser.');
    return;
  }

  const recorder = new recognition();
  recorder.lang = 'en-US';
  recorder.interimResults = false;
  recorder.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    messageInput.value = transcript;
    messageInput.focus();
  };
  recorder.start();
});

generateImageBtn.addEventListener('click', async () => {
  const prompt = imagePrompt.value.trim();
  if (!prompt) {
    alert('Describe the image you want to create.');
    return;
  }

  imageResult.classList.remove('hidden');
  imageResult.innerHTML = '<p>Generating image...</p>';

  try {
    const res = await fetch('/api/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Image generation failed.');

    imageResult.innerHTML = `<img src="${data.image}" alt="Generated artwork" />`;
  } catch (error) {
    imageResult.innerHTML = `<p>${error.message}</p>`;
  }
});

analyzePdfBtn.addEventListener('click', async () => {
  const file = pdfInput.files?.[0];
  if (!file) {
    alert('Choose a PDF file first.');
    return;
  }

  const formData = new FormData();
  formData.append('pdf', file);
  formData.append('question', pdfQuestion.value.trim() || 'Summarize this document and list the key points.');

  try {
    const res = await fetch('/api/analyze-pdf', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'PDF analysis failed.');

    appendMessage('assistant', data.answer || 'No response returned.');
    history.push({ role: 'assistant', content: data.answer || 'No response returned.' });
    saveHistory();
  } catch (error) {
    appendMessage('assistant', error.message || 'Unable to analyze this PDF.');
  }
});

renderHistory();

if (!history.length) {
  appendMessage('assistant', 'Welcome back. I am JARVIS. How can I help today?');
  history.push({ role: 'assistant', content: 'Welcome back. I am JARVIS. How can I help today?' });
  saveHistory();
}
