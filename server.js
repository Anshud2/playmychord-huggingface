const express = require('express');
const app = express();

app.use(express.json());

// Rotas da API
app.use('/api/generate', require('./api/generate'));
app.use('/api/get', require('./api/get'));
app.use('/api/health', require('./api/health'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});