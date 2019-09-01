const mongoose = require('mongoose')
const Schema = mongoose.Schema

const sampleGmapsDataSchema = new Schema({
	BusinessName: String, 
	FullAddress: String, 
	StreetAddress: String, 
	City: String, 
	State: String, 
	Zip: String, 
	PlusCode: String, 
	Website: String, 
	Phone: String, 
	LatLong: String, 
	Category: String,
	Hours: String, 
	IsClaimed: String, 
	Rating: String, 
	ReviewCount: String, 
	Amenities: String, 
	NumberOfPhotos: String, 
	ImageURL: String, 
	URL: String
})
module.exports = mongoose.model('SampleGmapsData', sampleGmapsDataSchema)