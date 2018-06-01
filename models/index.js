let Clustering = require('./clustering');

module.exports = {
    ...Clustering,
    Workspaces: require('./Workspaces.model'),
    FilesType: require('./filesTypes'),
    Files: require('./Files.model'),
}