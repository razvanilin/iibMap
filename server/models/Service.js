var mongoose = require('mongoose');

var ServiceSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	flows: [{
		name: {
			type: String,
			required: true
		},
		inode: {
			type: String,
			required: true
		},
		iserver: {
			type: String,
			required: true
		},
		application: {
			type: String
		}
	}]
});

module.exports = ServiceSchema;