// models/message.model.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  sender: {
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  messageType: {
    type: String,
    enum: ['user', 'ai'],
    default: 'user'
  },
  // For AI messages that might contain structured data
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Index for faster queries
messageSchema.index({ project: 1, createdAt: 1 });

const messageModel = mongoose.model('Message', messageSchema);

export default messageModel;