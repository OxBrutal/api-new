const mongoose = require('mongoose');
const { dbURI } = require('../lib/settings');

function connectMongoDb() {
    mongoose.connect(dbURI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true
    });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      console.log('[INFO] KirBotz ApiS Conected!');
    });
};

module.exports.connectMongoDb = connectMongoDb;
