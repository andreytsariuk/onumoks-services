const Bookshelf = require('../../config/bookshelf');
const knex = Bookshelf.knex;
const Promise = require('bluebird');
const { Lectors } = require('../rolesTypes');
const { Clusters } = require('../clustering');
const Files = require('../Files.model');


module.exports = Bookshelf.model('Articles', Bookshelf.Model.extend({
    tableName: 'articles',
    owner: function () {
        return this.belongsTo('Lectors');
    },
    cluster: function () {
        return this.belongsTo('Clusters');
    },
    file() {
        return this.morphOne('Files', 'file');
    }
}));
