const Bookshelf = require('../../config/bookshelf');
const knex = Bookshelf.knex;
const Promise = require('bluebird');


module.exports = Bookshelf.model('Lectors', Bookshelf.Model.extend({
    tableName: 'lectors',

}));
