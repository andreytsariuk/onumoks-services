
const Bookshelf = require('../config/bookshelf');
const knex = Bookshelf.knex;
const Promise = require('bluebird');
const { Articles } = require('./filesTypes');


module.exports = Bookshelf.model('Files', Bookshelf.Model.extend({
    tableName: 'files',
    file() {
        return this.morphTo('file', 'Articles');
    }
}));
