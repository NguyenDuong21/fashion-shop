const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CounterSchema = new Schema({
  _id: String,
  seq: Number
})
CounterSchema.statics.increment = async function(counter) {
  const count = await this.findByIdAndUpdate(counter, { $inc: { seq: 1 } }, { new: true, upsert: true, select: { seq: 1 } });
  return count;
};
module.exports = { CounterSchema: mongoose.model('Counter', CounterSchema, 'Counter') };