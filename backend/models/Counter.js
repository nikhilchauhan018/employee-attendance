const mongoose = require('mongoose');

// simple counter collection for auto-incrementing sequences
// uses findOneAndUpdate with $inc — atomic operation, no race conditions
const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  seq: {
    type: Number,
    default: 0
  }
});

/**
 * Get the next value in a sequence.
 * Uses findOneAndUpdate with upsert + $inc which is an atomic operation
 * in MongoDB — safe for concurrent requests, no duplicates possible.
 */
counterSchema.statics.getNextSequence = async function(name) {
  let counter = await this.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

module.exports = mongoose.model('Counter', counterSchema);
