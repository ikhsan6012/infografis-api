const mongoose = require('mongoose')
const Schema = mongoose.Schema

const mfwpSchema = new Schema({
	NPWP: String,
	NAMA_WP: String,
	KPADM: String,
	JALAN: String,
	BLOK: String,
	NOMOR: String,
	RT: String,
	RW: String,
	NM_KELURAHAN: String,
	NM_KECAMATAN: String,
	NM_KOTA: String,
	NM_PROVINSI: String,
})
module.exports = mongoose.model('MFWP', mfwpSchema)