const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema para CompanyBank
const companyBankSchema = new Schema({
  pk: { type: Number, required: true, unique: true },
  accountName: { type: String, required: true },
  accountType: { type: String, required: true },
  currency: { type: String, required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  cci: { type: String, required: true }
}, { collection: 'companybanks', timestamps: true });

// Schema para Bank
const bankSchema = new Schema({
  pk: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  cci: { type: Boolean, required: true },
  short_name: { type: String, required: true },
  long_name: { type: String, required: true },
  image: { type: String, required: false },
  num_chars_min: { type: Number, required: true },
  num_chars_max: { type: Number, required: true },
  format_mask: { type: String, default: null },
  supports_op_code: { type: Boolean, required: true },
  is_source_bank: { type: Boolean, required: true },
  is_target_bank: { type: Boolean, required: true },
  allow_credit_card: { type: Boolean, required: true }
}, { collection: 'banks', timestamps: true });

const CompanyBank = mongoose.model('CompanyBank', companyBankSchema);
const Bank = mongoose.model('Bank', bankSchema);

module.exports = { CompanyBank, Bank };
