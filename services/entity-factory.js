module.exports = function(application) {

	var srv;

	return {
		init:init,
		destroy:destroy,
		create:create
	}

	function init() {
		srv = {
			objectId:application.getService('object-id'),
			fs:application.getService('fs')
		};
	}

	function create(entityPath) {

		return {
			save:save,
			read:read,
			list:list
		}

		/**
		 * Save an entity to disk. If entity has id, it will be overwritten. If entity has no id, it will be
		 * created.
		 *
		 * @param entity {object} The entity
		 * @returns {Promise} The updated entity, e.g with new id if none was available
		 */
		function save(entity) {
			var id = entity.id || srv.objectId();
			entity.id = id;
			return fs.writeJsonFile(path.join(entityPath, id + 'json'), entity).then(function(){return entity;})
		}

		/**
		 * Read an entity from disk
		 *
		 * @param entityId
		 * @returns {Promise} Resolves to the contents of a
		 */
		function read(entityId) {
			srv.fs.readJsonFile(path.join(entityPath, entityId + '.json'));
		}

		/**
		 * Get an array of all stored entitys
		 *
		 * @returns {Promise} Resolves to an array of entity objects
		 */
		function list() {
			return srv.fs.readJsons(entityPath);
		}

	}
}