const axios = require('axios');
const { handleCors } = require('./_utils');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;
  try {
    const body = req.body || {};
    const prompt = body.prompt || '';

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é obrigatório' });
    }

    const response = await axios.post(
      'https://api.sonauto.ai/v1/generations/v3',
      { prompt },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SONAUTO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      prompt: prompt,
      message: 'Música gerada com sucesso!',
      data: response.data,
    });
  } catch (err) {
    console.error('[generate]', err.message);
    res.status(500).json({ error: err.message });
  }
};