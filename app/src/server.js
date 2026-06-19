const express = require('express');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'cloud-app',
    message: 'API radi. Probaj GET /api/messages ili POST /api/messages.',
  });
});

app.use('/api', messageRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`cloud-app sluša na portu ${PORT}`);
});
