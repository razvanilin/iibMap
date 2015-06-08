var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var ServiceSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
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
			type: String,
			default: ""
		}
	}],
	isActive: {
		type: Boolean,
		default: true
	}
});

ServiceSchema.plugin(timestamps);

module.exports = ServiceSchema;