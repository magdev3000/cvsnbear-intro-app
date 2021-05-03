const mongoose = require('mongoose');
const { mongodbUri } = require('../config');

module.exports = () => {
  mongoose.connect(mongodbUri, { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true, });
  const db = mongoose.connection;

  db.on('error', (err) => {
    console.error(`🚫 Database Error 🚫  → ${err}`);
  });
  db.once('open', () => {
    console.log("🙌 We're connected to mongo!");
  });
};
