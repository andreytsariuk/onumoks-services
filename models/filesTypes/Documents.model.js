
const Bookshelf = require('../../config/bookshelf');
const knex = Bookshelf.knex;
const Promise = require('bluebird');
const Files = require('../Files.model');


module.exports = Bookshelf.model('Documents', Bookshelf.Model.extend({
    tableName: 'documents',
    file() {
        return this.morphOne('Files', 'file');
    }
}));
