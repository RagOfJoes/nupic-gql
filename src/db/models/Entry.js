import mongoose from 'mongoose';

/**
 * User Schema
 */
const EntrySchema = new mongoose.Schema({
	title: {
		type: String,
		minlength: 4,
		maxlength: 60,
		required: [true, 'Title must not be empty!'],
	},
	mood: {
		index: true,
		type: String,
		enum: ['VERY_GOOD', 'GOOD', 'WELL', 'BAD', 'VERY_BAD'],
	},
	description: {
		type: String,
		minlength: 4,
		maxlength: 72,
	},
	images: [
		{
			url: { type: String, required: [true, 'Image must have a URL!'] },
			name: { type: String, required: [true, 'Image must have a name!'] },
		},
	],
	location: {
		// Name(s)
		main: {
			type: String,
		},
		secondary: {
			type: String,
		},

		// Metadata
		placeId: {
			type: String,
		},
		latitude: {
			type: mongoose.Schema.Types.Decimal128,
		},
		longitude: {
			type: mongoose.Schema.Types.Decimal128,
		},
	},

	// Metadata
	createdBy: {
		ref: 'User',
		index: true,
		required: true,
		type: mongoose.Schema.Types.ObjectId,
	},
	date: {
		creation: {
			type: Date,
			index: true,
			required: true,
			default: Date.now,
		},
		lastUpdate: {
			type: Date,
		},
	},
});

export default mongoose.model('Entry', EntrySchema);
