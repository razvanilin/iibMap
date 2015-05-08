var mongoose = require('mongoose');

var BrokerSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	host: {
		type: String,
		required: true
	},
	port: {
		type: String,
		required: true
	},
	username: {
		type: String,
		default: ''
	},
	password: {
		type: String,
		default: ''
	},
	ssl: {
		type: Boolean,
		default: false
	}
});

module.exports = BrokerSchema;