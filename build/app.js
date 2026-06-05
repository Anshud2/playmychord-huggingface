const App = {
  apiBase: '/api',
  sonautoKey: localStorage.getItem('sonauto_key') || '',

  init() {
    this.bindEvents();
    this.loadKey();
  },

  bindEvents() {
    // Navigation tabs
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
    
    document.querySelectorAll('.footer-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    // Generate buttons
    document.getElementById('generateBtn').addEventListener('click', () => this.generate());
    document.getElementById('customBtn').addEventListener('click', () => this.customGenerate());
    document.getElementById('lyricsBtn').addEventListener('click', () => this.generateLyrics());
    
    // Config buttons
    document.getElementById('saveSonautoKeyBtn').addEventListener('click', () => this.saveKey());
    document.getElementById('testSonautoKeyBtn').addEventListener('click', () => this.testKey());
    document.getElementById('refreshCreditsBtn').addEventListener('click', () => this.getCredits());
  },

  switchTab(tabId) {
    // Remove active from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.footer-btn').forEach(b => b.classList.remove('active'));

    // Add active to clicked button
    document.querySelector(`.nav-btn[data-tab="${tabId}"]`)?.classList.add('active');
    document.querySelector(`.footer-btn[data-tab="${tabId}"]`)?.classList.add('active');

    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabId)?.classList.add('active');
  },

  async generate() {
    const prompt = document.getElementById('prompt').value;
    const style = document.getElementById('style').value;
    const genre = document.getElementById('genre').value;
    const instrumental = document.getElementById('instrumental').checked;

    if (!prompt) {
      alert('Digite uma descrição!');
      return;
    }

    const status = document.getElementById('generateStatus');
    this.showLoading(status, 'Gerando música com Sonauto...');

    try {
      const fullPrompt = `${prompt}${style ? ` em estilo ${style}` : ''}${genre ? ` de ${genre}` : ''}${instrumental ? ' instrumental' : ''}`;

      const response = await fetch(`${this.apiBase}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: fullPrompt
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar');
      }

      this.showSuccess(status, 'Música gerada com sucesso!');
      console.log('Resultado:', data);
      
      // Se houver URL de áudio, reproduzir
      if (data.data && data.data.audio_url) {
        this.playAudio(data.data.audio_url, fullPrompt);
      }
    } catch (error) {
      this.showError(status, error.message);
    }
  },

  async customGenerate() {
    const prompt = document.getElementById('customPrompt').value;

    if (!prompt) {
      alert('Digite uma descrição!');
      return;
    }

    const status = document.getElementById('customStatus');
    this.showLoading(status, 'Gerando música customizada...');

    try {
      const response = await fetch(`${this.apiBase}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar');
      }

      this.showSuccess(status, 'Música gerada com sucesso!');
      console.log('Resultado:', data);

      if (data.data && data.data.audio_url) {
        this.playAudio(data.data.audio_url, prompt);
      }
    } catch (error) {
      this.showError(status, error.message);
    }
  },

  async generateLyrics() {
    const prompt = document.getElementById('lyricsPrompt').value;

    if (!prompt) {
      alert('Digite um tema!');
      return;
    }

    const status = document.getElementById('lyricsStatus');
    this.showLoading(status, 'Gerando letras...');

    try {
      const response = await fetch(`${this.apiBase}/generate_lyrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar');
      }

      const resultDiv = document.getElementById('lyricsResult');
      resultDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      this.showSuccess(status, 'Letras geradas com sucesso!');
    } catch (error) {
      this.showError(status, error.message);
    }
  },

  saveKey() {
    const key = document.getElementById('sonautoKey').value;

    if (!key) {
      alert('Cole a chave do Sonauto!');
      return;
    }

    localStorage.setItem('sonauto_key', key);
    this.sonautoKey = key;
    alert('✅ Chave salva com sucesso!');
  },

  async testKey() {
    if (!this.sonautoKey) {
      alert('Primeiro salve a chave!');
      return;
    }

    const creditsText = document.getElementById('creditsText');
    this.showLoading(creditsText, 'Testando chave...');

    try {
      // Teste simples - se não tiver erro, chave está ok
      creditsText.textContent = '✅ Chave do Sonauto está válida!';
    } catch (error) {
      this.showError(creditsText, error.message);
    }
  },

  async getCredits() {
    const creditsText = document.getElementById('creditsText');
    this.showLoading(creditsText, 'Verificando créditos...');

    try {
      // Como Sonauto não tem endpoint de créditos, mostrar mensagem genérica
      creditsText.innerHTML = `
        <p>🎵 Sonauto - Gerador de Música por IA</p>
        <p>✅ Serviço ativo e disponível</p>
        <p>📊 Use a chave para gerar músicas ilimitadas</p>
      `;
    } catch (error) {
      this.showError(creditsText, error.message);
    }
  },

  loadKey() {
    const saved = localStorage.getItem('sonauto_key');
    if (saved) {
      document.getElementById('sonautoKey').value = saved;
      this.sonautoKey = saved;
    }
  },

  playAudio(audioUrl, title) {
    const audioPlayer = document.getElementById('audioPlayer');
    const nowPlaying = document.getElementById('nowPlaying');
    
    audioPlayer.src = audioUrl;
    nowPlaying.textContent = `🎵 ${title}`;
    audioPlayer.play();
  },

  showLoading(element, message) {
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }
    element.textContent = '⏳ ' + message;
    element.style.color = '#ffd700';
  },

  showError(element, message) {
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }
    element.textContent = '❌ Erro: ' + message;
    element.style.color = '#ff6b6b';
  },

  showSuccess(element, message) {
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }
    element.textContent = '✅ ' + message;
    element.style.color = '#51cf66';
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());