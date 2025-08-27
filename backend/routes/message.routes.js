// // routes/message.routes.js
// import express from 'express';
// import messageModel from '../models/message.model.js';
// import mongoose from 'mongoose';

// const router = express.Router();

// // Get all messages for a project
// router.get('/project/:projectId', async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { page = 1, limit = 100 } = req.query;

//     // Validate projectId
//     if (!mongoose.Types.ObjectId.isValid(projectId)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid project ID'
//       });
//     }

//     const messages = await messageModel.find({ project: projectId })
//       .sort({ createdAt: 1 }) // Sort by oldest first
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .lean();

//     // Transform messages to match your frontend format
//     const formattedMessages = messages.map(msg => ({
//       _id: msg._id,
//       message: msg.content,
//       sender: {
//         email: msg.sender.email,
//         name: msg.sender.name,
//         _id: msg.messageType === 'ai' ? 'ai' : 'user'
//       },
//       timestamp: msg.createdAt
//     }));

//     res.json({
//       success: true,
//       messages: formattedMessages,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total: await messageModel.countDocuments({ project: projectId })
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching messages:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch messages'
//     });
//   }
// });

// // Delete a message (optional)
// router.delete('/:messageId', async (req, res) => {
//   try {
//     const { messageId } = req.params;
    
//     if (!mongoose.Types.ObjectId.isValid(messageId)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid message ID'
//       });
//     }
    
//     const deletedMessage = await messageModel.findByIdAndDelete(messageId);
    
//     if (!deletedMessage) {
//       return res.status(404).json({
//         success: false,
//         error: 'Message not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Message deleted successfully'
//     });

//   } catch (error) {
//     console.error('Error deleting message:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to delete message'
//     });
//   }
// });

// export default router;



import express from 'express';
import messageModel from '../models/message.model.js';
import mongoose from 'mongoose';

const router = express.Router();

// Create a new message
router.post('/', async (req, res) => {
  try {
    const { content, sender, project, messageType, metadata } = req.body;

    // Validate required fields
    if (!content || !sender || !project) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: content, sender, project'
      });
    }

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID'
      });
    }

    // Create new message
    const newMessage = new messageModel({
      content,
      sender: {
        email: sender.email,
        name: sender.name || sender.email
      },
      project,
      messageType: messageType || 'user',
      metadata
    });

    const savedMessage = await newMessage.save();

    // Transform to match frontend format
    const formattedMessage = {
      _id: savedMessage._id,
      message: savedMessage.content,
      sender: {
        email: savedMessage.sender.email,
        name: savedMessage.sender.name,
        _id: savedMessage.messageType === 'ai' ? 'ai' : 'user'
      },
      timestamp: savedMessage.createdAt
    };

    res.status(201).json({
      success: true,
      message: formattedMessage
    });

  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create message'
    });
  }
});

// Get all messages for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 100 } = req.query;

    // Validate projectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID'
      });
    }

    const messages = await messageModel.find({ project: projectId })
      .sort({ createdAt: 1 }) // Sort by oldest first
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Transform messages to match your frontend format
    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      message: msg.content,
      sender: {
        email: msg.sender.email,
        name: msg.sender.name,
        _id: msg.messageType === 'ai' ? 'ai' : 'user'
      },
      timestamp: msg.createdAt
    }));

    res.json({
      success: true,
      messages: formattedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await messageModel.countDocuments({ project: projectId })
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
});

// Delete a message (optional)
router.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
   
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid message ID'
      });
    }
   
    const deletedMessage = await messageModel.findByIdAndDelete(messageId);
   
    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete message'
    });
  }
});

export default router;