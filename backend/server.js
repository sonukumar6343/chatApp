// import 'dotenv/config';
// import http from 'http';
// import app from './app.js';
// import { Server } from 'socket.io';
// import jwt from 'jsonwebtoken';
// import mongoose from 'mongoose';
// import projectModel from './models/project.model.js';
// import { generateResult } from './services/ai.service.js';

// const port = process.env.PORT || 3000;




// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: '*'
//     }
// });


// io.use(async (socket, next) => {

//     try {

//         const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[ 1 ];
//         const projectId = socket.handshake.query.projectId;

//         if (!mongoose.Types.ObjectId.isValid(projectId)) {
//             return next(new Error('Invalid projectId'));
//         }


//         socket.project = await projectModel.findById(projectId);


//         if (!token) {
//             return next(new Error('Authentication error'))
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         if (!decoded) {
//             return next(new Error('Authentication error'))
//         }


//         socket.user = decoded;

//         next();

//     } catch (error) {
//         next(error)
//     }

// })


// io.on('connection', socket => {
//     socket.roomId = socket.project._id.toString()


//     console.log('a user connected');



//     socket.join(socket.roomId);

//     socket.on('project-message', async data => {

//         const message = data.message;

//         const aiIsPresentInMessage = message.includes('@ai');
//         socket.broadcast.to(socket.roomId).emit('project-message', data)

//         if (aiIsPresentInMessage) {


//             const prompt = message.replace('@ai', '');

//             const result = await generateResult(prompt);


//             io.to(socket.roomId).emit('project-message', {
//                 message: result,
//                 sender: {
//                     _id: 'ai',
//                     email: 'AI'
//                 }
//             })


//             return
//         }


//     })

//     socket.on('disconnect', () => {
//         console.log('user disconnected');
//         socket.leave(socket.roomId)
//     });
// });




// server.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// })


import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import messageModel from './models/message.model.js'; // Import your message model
import { generateResult } from './services/ai.service.js';

const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});


// Store online users per project
const onlineUsers = new Map(); // projectId -> Set of user emails

// Helper function to get online users for a project
function getOnlineUsersForProject(projectId) {
    const users = onlineUsers.get(projectId.toString());
    return users ? Array.from(users) : [];
}

// Helper function to add user to online list
function addUserToProject(projectId, userEmail) {
    const projectKey = projectId.toString();
    if (!onlineUsers.has(projectKey)) {
        onlineUsers.set(projectKey, new Set());
    }
    onlineUsers.get(projectKey).add(userEmail);
}

// Helper function to remove user from online list
function removeUserFromProject(projectId, userEmail) {
    const projectKey = projectId.toString();
    if (onlineUsers.has(projectKey)) {
        onlineUsers.get(projectKey).delete(userEmail);
        // Clean up empty project sets
        if (onlineUsers.get(projectKey).size === 0) {
            onlineUsers.delete(projectKey);
        }
    }
}

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        const projectId = socket.handshake.query.projectId;
        
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid projectId'));
        }
        
        socket.project = await projectModel.findById(projectId);
        
        if (!token) {
            return next(new Error('Authentication error'));
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return next(new Error('Authentication error'));
        }
        
        socket.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
});

io.on('connection', socket => {
    socket.roomId = socket.project._id.toString();
    const userEmail = socket.user.email;
    const projectId = socket.project._id;
    
    console.log('a user connected:', userEmail);
    socket.join(socket.roomId);
    
    // Add user to online users list
    addUserToProject(projectId, userEmail);
    
    // Broadcast user online status to all users in the project (except the connecting user)
    socket.to(socket.roomId).emit('user-online', { 
        userEmail: userEmail,
        userName: socket.user.name || socket.user.email
    });
    
    // Handle get-online-users request
    socket.on('get-online-users', (data) => {
        const requestedProjectId = data.projectId || socket.project._id;
        socket.emit('online-users', { 
            users: getOnlineUsersForProject(requestedProjectId) 
        });
    });
    
    socket.on('project-message', async data => {
        try {
            const message = data.message;
            const aiIsPresentInMessage = message.includes('@ai');
            
            console.log('Received message:', data);
            
            // Save user message to database
            const userMessage = new messageModel({
                content: message.trim(),
                sender: {
                    email: data.sender.email,
                    name: data.sender.name || data.sender.email
                },
                project: socket.project._id,
                messageType: 'user'
            });
            
            const savedUserMessage = await userMessage.save();
            console.log('User message saved to DB:', savedUserMessage._id);
            
            // Prepare message data for broadcasting
            const messageToSend = {
                _id: savedUserMessage._id,
                message: data.message,
                sender: data.sender,
                timestamp: savedUserMessage.createdAt,
                projectId: socket.project._id
            };
            
            // Broadcast to all users in the room (including sender for confirmation)
            io.to(socket.roomId).emit('project-message', messageToSend);
            
            // Handle AI message if mentioned
            if (aiIsPresentInMessage) {
                const prompt = message.replace('@ai', '').trim();
                console.log('AI prompt:', prompt);
                
                try {
                    const result = await generateResult(prompt);
                    
                    // Save AI message to database
                    const aiMessage = new messageModel({
                        content: result,
                        sender: {
                            email: 'AI',
                            name: 'AI Assistant'
                        },
                        project: socket.project._id,
                        messageType: 'ai',
                        metadata: typeof result === 'string' ? null : result // Store structured data if needed
                    });
                    
                    const savedAiMessage = await aiMessage.save();
                    console.log('AI message saved to DB:', savedAiMessage._id);
                    
                    // Send AI response to all users
                    io.to(socket.roomId).emit('project-message', {
                        _id: savedAiMessage._id,
                        message: result,
                        sender: {
                            _id: 'ai',
                            email: 'AI'
                        },
                        timestamp: savedAiMessage.createdAt,
                        projectId: socket.project._id
                    });
                    
                } catch (aiError) {
                    console.error('Error generating AI response:', aiError);
                    
                    // Send error message
                    const errorMessage = new messageModel({
                        content: 'Sorry, I encountered an error while processing your request.',
                        sender: {
                            email: 'AI',
                            name: 'AI Assistant'
                        },
                        project: socket.project._id,
                        messageType: 'ai'
                    });
                    
                    const savedErrorMessage = await errorMessage.save();
                    
                    io.to(socket.roomId).emit('project-message', {
                        _id: savedErrorMessage._id,
                        message: 'Sorry, I encountered an error while processing your request.',
                        sender: {
                            _id: 'ai',
                            email: 'AI'
                        },
                        timestamp: savedErrorMessage.createdAt,
                        projectId: socket.project._id
                    });
                }
            }
            
        } catch (error) {
            console.error('Error handling project message:', error);
            
            // Send error back to sender
            socket.emit('message-error', {
                error: 'Failed to send message',
                originalMessage: data
            });
        }
    });
    
    socket.on('disconnect', () => {
        console.log('user disconnected:', userEmail);
        
        // Remove user from online users list
        removeUserFromProject(projectId, userEmail);
        
        // Broadcast user offline status to all remaining users in the project
        socket.to(socket.roomId).emit('user-offline', { 
            userEmail: userEmail,
            userName: socket.user.name || socket.user.email
        });
        
        socket.leave(socket.roomId);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// io.use(async (socket, next) => {
//     try {
//         const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
//         const projectId = socket.handshake.query.projectId;
        
//         if (!mongoose.Types.ObjectId.isValid(projectId)) {
//             return next(new Error('Invalid projectId'));
//         }
        
//         socket.project = await projectModel.findById(projectId);
        
//         if (!token) {
//             return next(new Error('Authentication error'));
//         }
        
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         if (!decoded) {
//             return next(new Error('Authentication error'));
//         }
        
//         socket.user = decoded;
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// io.on('connection', socket => {
//     socket.roomId = socket.project._id.toString();
//     console.log('a user connected');
//     socket.join(socket.roomId);
    
//     socket.on('project-message', async data => {
//         try {
//             const message = data.message;
//             const aiIsPresentInMessage = message.includes('@ai');
            
//             console.log('Received message:', data);
            
//             // Save user message to database
//             const userMessage = new messageModel({
//                 content: message.trim(),
//                 sender: {
//                     email: data.sender.email,
//                     name: data.sender.name || data.sender.email
//                 },
//                 project: socket.project._id,
//                 messageType: 'user'
//             });
            
//             const savedUserMessage = await userMessage.save();
//             console.log('User message saved to DB:', savedUserMessage._id);
            
//             // Prepare message data for broadcasting
//             const messageToSend = {
//                 _id: savedUserMessage._id,
//                 message: data.message,
//                 sender: data.sender,
//                 timestamp: savedUserMessage.createdAt,
//                 projectId: socket.project._id
//             };
            
//             // Broadcast to all users in the room (including sender for confirmation)
//             io.to(socket.roomId).emit('project-message', messageToSend);
            
//             // Handle AI message if mentioned
//             if (aiIsPresentInMessage) {
//                 const prompt = message.replace('@ai', '').trim();
//                 console.log('AI prompt:', prompt);
                
//                 try {
//                     const result = await generateResult(prompt);
                    
//                     // Save AI message to database
//                     const aiMessage = new messageModel({
//                         content: result,
//                         sender: {
//                             email: 'AI',
//                             name: 'AI Assistant'
//                         },
//                         project: socket.project._id,
//                         messageType: 'ai',
//                         metadata: typeof result === 'string' ? null : result // Store structured data if needed
//                     });
                    
//                     const savedAiMessage = await aiMessage.save();
//                     console.log('AI message saved to DB:', savedAiMessage._id);
                    
//                     // Send AI response to all users
//                     io.to(socket.roomId).emit('project-message', {
//                         _id: savedAiMessage._id,
//                         message: result,
//                         sender: {
//                             _id: 'ai',
//                             email: 'AI'
//                         },
//                         timestamp: savedAiMessage.createdAt,
//                         projectId: socket.project._id
//                     });
                    
//                 } catch (aiError) {
//                     console.error('Error generating AI response:', aiError);
                    
//                     // Send error message
//                     const errorMessage = new messageModel({
//                         content: 'Sorry, I encountered an error while processing your request.',
//                         sender: {
//                             email: 'AI',
//                             name: 'AI Assistant'
//                         },
//                         project: socket.project._id,
//                         messageType: 'ai'
//                     });
                    
//                     const savedErrorMessage = await errorMessage.save();
                    
//                     io.to(socket.roomId).emit('project-message', {
//                         _id: savedErrorMessage._id,
//                         message: 'Sorry, I encountered an error while processing your request.',
//                         sender: {
//                             _id: 'ai',
//                             email: 'AI'
//                         },
//                         timestamp: savedErrorMessage.createdAt,
//                         projectId: socket.project._id
//                     });
//                 }
//             }
            
//         } catch (error) {
//             console.error('Error handling project message:', error);
            
//             // Send error back to sender
//             socket.emit('message-error', {
//                 error: 'Failed to send message',
//                 originalMessage: data
//             });
//         }
//     });
    
//     socket.on('disconnect', () => {
//         console.log('user disconnected');
//         socket.leave(socket.roomId);
//     });
// });

// server.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });