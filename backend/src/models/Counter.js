const mongoose = require('mongoose');

// Stores running sequence numbers, used to generate Task IDs like TSK-001, TSK-002 ...
// findOneAndUpdate with $inc is atomic, so two tasks created at the same time
// will never get the same number.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // name of the sequence, e.g. "task"
  seq: { type: Number, default: 0 },
});

counterSchema.statics.getNextSequence = async function getNextSequence(name) {
  const counter = await this.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return counter.seq;
};

module.exports = mongoose.model('Counter', counterSchema);
