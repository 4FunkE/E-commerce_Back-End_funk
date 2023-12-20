const  = require('express').();
const apiRoutes = require('./api');

.use('/api', apiRoutes);

.use((req, res) => {
  res.send('<h1>Wrong Route!</h1>');
});

module.exports = ;