// import React, { useState, useEffect, useContext, useRef } from "react";
// import { UserContext } from "../context/user.context";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "../config/axios";
// import {
//   initializeSocket,
//   receiveMessage,
//   sendMessage,
// } from "../config/socket";
// import Markdown from "markdown-to-jsx";
// import hljs from "highlight.js";
// import { getWebContainer } from "../config/webcontainer";

// function SyntaxHighlightedCode(props) {
//   const ref = useRef(null);

//   React.useEffect(() => {
//     if (ref.current && props.className?.includes("lang-") && window.hljs) {
//       window.hljs.highlightElement(ref.current);
//       ref.current.removeAttribute("data-highlighted");
//     }
//   }, [props.className, props.children]);

//   return <code {...props} ref={ref} />;
// }

// const Project = () => {
//   const location = useLocation();
//   const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedUserId, setSelectedUserId] = useState(new Set());
//   const [project, setProject] = useState(location.state.project);
//   const [message, setMessage] = useState("");
//   const { user } = useContext(UserContext);
//   const messageBox = React.createRef();

//   const [users, setUsers] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [fileTree, setFileTree] = useState({});
//   const [currentFile, setCurrentFile] = useState(null);
//   const [openFiles, setOpenFiles] = useState([]);
//   const [webContainer, setWebContainer] = useState(null);
//   const [iframeUrl, setIframeUrl] = useState(null);
//   const [runProcess, setRunProcess] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [socketInitialized, setSocketInitialized] = useState(false);
//   const [messagesLoading, setMessagesLoading] = useState(true);
  
//   // New state for tracking online users and removal loading
//   const [onlineUsers, setOnlineUsers] = useState(new Set());
//   const [removingUserId, setRemovingUserId] = useState(null);
  
//   // State for responsive file explorer
//   const [isExplorerMinimized, setIsExplorerMinimized] = useState(false);

//   console.log("user is:", user);

//   if (!user?.email) {
//     return <div>Loading user...</div>;
//   }

//   const handleUserClick = (id) => {
//     setSelectedUserId((prevSelectedUserId) => {
//       const newSelectedUserId = new Set(prevSelectedUserId);
//       if (newSelectedUserId.has(id)) {
//         newSelectedUserId.delete(id);
//       } else {
//         newSelectedUserId.add(id);
//       }
//       return newSelectedUserId;
//     });
//   };

//   function addCollaborators() {
//     setIsLoading(true);
//     axios
//       .put("/projects/add-user", {
//         projectId: location.state.project._id,
//         users: Array.from(selectedUserId),
//       })
//       .then((res) => {
//         console.log(res.data);
//         setIsModalOpen(false);
//         setSelectedUserId(new Set());
//         // Refresh project data to get updated collaborators list
//         fetchProjectData();
//       })
//       .catch((err) => {
//         console.log(err);
//       })
//       .finally(() => {
//         setIsLoading(false);
//       });
//   }

//   // New function to remove collaborator
//   function removeCollaborator(userId) {
//     setRemovingUserId(userId);
//     axios
//       .put("/projects/remove-user", {
//         projectId: project._id,
//         userId: userId,
//       })
//       .then((res) => {
//         console.log("User removed:", res.data);
//         // Update local project state to remove the user
//         setProject((prevProject) => ({
//           ...prevProject,
//           users: prevProject.users.filter((u) => u._id !== userId)
//         }));
//       })
//       .catch((err) => {
//         console.error("Error removing user:", err);
//         // You might want to show a toast notification here
//         alert("Failed to remove collaborator. Please try again.");
//       })
//       .finally(() => {
//         setRemovingUserId(null);
//       });
//   }

//   // Function to fetch project data
//   const fetchProjectData = () => {
//     axios
//       .get(`/projects/get-project/${project._id}`)
//       .then((res) => {
//         console.log("Project data:", res.data.project);
//         setProject(res.data.project);
//         setFileTree(res.data.project.fileTree || {});
//       })
//       .catch((err) => {
//         console.error("Error fetching project:", err);
//       });
//   };

//   // Function to load messages from database
//   const loadMessages = async () => {
//     try {
//       setMessagesLoading(true);
//       const response = await axios.get(`/messages/project/${project._id}`);
//       if (response.data.success) {
//         setMessages(response.data.messages);
//       }
//     } catch (error) {
//       console.error('Error loading messages:', error);
//     } finally {
//       setMessagesLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       send();
//     }
//   };

//   const send = () => {
//     console.log("inside send function");
//     console.log("message trim is:", message.trim());
//     console.log("user is:", user);
//     console.log("socket initialized:", socketInitialized);
    
//     if (!message.trim()) return;
//     if (!socketInitialized) {
//       console.warn("Socket not initialized yet!");
//       return;
//     }
//     if (!user?.email) {
//       console.warn("User not loaded yet!");
//       return;
//     }

//     console.log("Sending message...");

//     // Send message via socket (socket will handle saving to DB)
//     sendMessage("project-message", {
//       message: message.trim(),
//       sender: {
//         email: user.email,
//         name: user.name || user.email,
//         _id: 'user'
//       },
//       projectId: project._id
//     });

//     // Add message to local state immediately for better UX (will be confirmed by socket)
//     const newMessage = {
//       message: message.trim(),
//       sender: {
//         email: user.email,
//         name: user.name || user.email,
//         _id: 'user'
//       },
//       timestamp: new Date()
//     };
//     setMessages((prevMessages) => [...prevMessages, newMessage]);
    
//     setMessage("");
    
//     // Scroll to bottom after adding message
//     setTimeout(scrollToBottom, 100);
//   };

//   function WriteAiMessage(message) {
//   if (!message) return <p>Invalid message</p>;
  
//   // First, check if message is already an object
//   if (typeof message === 'object') {
//     return (
//       <div className="overflow-auto bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg p-4 shadow-lg border border-slate-700">
//         <Markdown
//           children={message.text || message.content || JSON.stringify(message)}
//           options={{
//             overrides: {
//               code: SyntaxHighlightedCode,
//             },
//           }}
//         />
//       </div>
//     );
//   }

//   // If it's a string, try to parse as JSON
//   if (typeof message === 'string') {
//     // First, try to parse as JSON
//     try {
//       const messageObject = JSON.parse(message);
//       return (
//         <div className="overflow-auto bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg p-4 shadow-lg border border-slate-700">
//           <Markdown
//             children={messageObject.text || messageObject.content || ""}
//             options={{
//               overrides: {
//                 code: SyntaxHighlightedCode,
//               },
//             }}
//           />
//         </div>
//       );
//     } catch (error) {
//       console.error("Error parsing AI message as JSON:", error);
//       console.log("Raw message content:", message.substring(0, 200) + "...");
      
//       // If JSON parsing fails, treat as plain text/markdown
//       return (
//         <div className="overflow-auto bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg p-4 shadow-lg border border-slate-700">
//           <Markdown
//             children={message}
//             options={{
//               overrides: {
//                 code: SyntaxHighlightedCode,
//               },
//             }}
//           />
//         </div>
//       );
//     }
//   }

//   // Fallback for any other type
//   return (
//     <div className="overflow-auto bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg p-4 shadow-lg border border-slate-700">
//       <p className="text-yellow-400">Unsupported message format</p>
//     </div>
//   );
// }

//   // Check if a user is online
//   const isUserOnline = (userEmail) => {
//     return onlineUsers.has(userEmail);
//   };

//   // Check if current user is project owner (assuming first user is owner or you have an owner field)
//   const isProjectOwner = () => {
//     // You might need to adjust this logic based on how you determine project ownership
//     return project.createdBy === user._id || project.owner === user._id || 
//           (project.users && project.users[0]?.email === user.email);
//   };

//   // Initialize socket and setup message listeners
//   useEffect(() => {
//     if (!project._id || !user?.email) return;

//     console.log("Initializing socket for project:", project._id);
    
//     // Initialize socket
//     const socket = initializeSocket(project._id);
//     setSocketInitialized(true);

//     // Setup message listener
//     receiveMessage("project-message", (data) => {
//       console.log("Received message:", data);

//       // Safety check for data structure
//       if (!data || !data.sender) {
//         console.error("Invalid message data received:", data);
//         return;
//       }

//       // Handle received messages (including our own from socket confirmation)
//       if (data.sender._id === "ai") {
//         try {
//           const messageContent = JSON.parse(data.message);
//           console.log("AI message:", messageContent);
//           webContainer?.mount(messageContent.fileTree);

//           if (messageContent.fileTree) {
//             setFileTree(messageContent.fileTree || {});
//           }
          
//           // For AI messages, always add to state (no duplication concern)
//           setMessages((prevMessages) => [...prevMessages, data]);
//         } catch (error) {
//           console.error("Error parsing AI message:", error);
//           setMessages((prevMessages) => [...prevMessages, data]);
//         }
//       } else {
//         // For user messages, check if it's not from current user to avoid duplication
//         if (data.sender.email !== user.email) {
//           setMessages((prevMessages) => [...prevMessages, data]);
//         } else {
//           // If it's our own message, update the local message with DB info (ID, timestamp)
//           setMessages((prevMessages) => {
//             const updated = [...prevMessages];
//             const lastIndex = updated.length - 1;
//             if (lastIndex >= 0 && updated[lastIndex].sender.email === user.email && !updated[lastIndex]._id) {
//               updated[lastIndex] = { ...updated[lastIndex], ...data };
//             }
//             return updated;
//           });
//         }
//       }
      
//       // Scroll to bottom after receiving message
//       setTimeout(scrollToBottom, 100);
//     });

//     // Listen for user online/offline events
//     receiveMessage("user-online", (data) => {
//       console.log("User came online:", data.userEmail);
//       setOnlineUsers((prev) => new Set([...prev, data.userEmail]));
//     });

//     receiveMessage("user-offline", (data) => {
//       console.log("User went offline:", data.userEmail);
//       setOnlineUsers((prev) => {
//         const newSet = new Set(prev);
//         newSet.delete(data.userEmail);
//         return newSet;
//       });
//     });

//     // Listen for initial online users list
//     receiveMessage("online-users", (data) => {
//       console.log("Initial online users:", data.users);
//       setOnlineUsers(new Set(data.users));
//     });

//     // Request current online users when socket connects
//     sendMessage("get-online-users", { projectId: project._id });

//     // Load existing messages
//     loadMessages();

//     // Fetch project data
//     fetchProjectData();

//     // Initialize WebContainer
//     if (!webContainer) {
//       getWebContainer().then((container) => {
//         setWebContainer(container);
//         console.log("WebContainer started");
//       });
//     }

//     // Fetch all users
//     axios
//       .get("/users/all")
//       .then((res) => {
//         setUsers(res.data.users);
//       })
//       .catch((err) => {
//         console.log("Error fetching users:", err);
//       });

//     // Cleanup on unmount
//     return () => {
//       if (socket) {
//         socket.disconnect();
//         setSocketInitialized(false);
//       }
//     };
//   }, [project._id, user?.email]); // Dependencies

//   function saveFileTree(ft) {
//     axios
//       .put("/projects/update-file-tree", {
//         projectId: project._id,
//         fileTree: ft,
//       })
//       .then((res) => {
//         console.log("File tree saved:", res.data);
//       })
//       .catch((err) => {
//         console.error("Error saving file tree:", err);
//       });
//   }

//   function scrollToBottom() {
//     if (messageBox.current) {
//       messageBox.current.scrollTop = messageBox.current.scrollHeight;
//     }
//   }

//   // Scroll to bottom whenever messages change
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const getFileIcon = (filename) => {
//     const ext = filename.split(".").pop()?.toLowerCase();
//     switch (ext) {
//       case "js":
//         return "ri-javascript-fill text-yellow-500";
//       case "jsx":
//         return "ri-reactjs-fill text-blue-400";
//       case "ts":
//       case "tsx":
//         return "ri-file-code-fill text-blue-600";
//       case "css":
//         return "ri-css3-fill text-blue-500";
//       case "html":
//         return "ri-html5-fill text-orange-500";
//       case "json":
//         return "ri-file-code-fill text-green-500";
//       case "md":
//         return "ri-markdown-fill text-gray-600";
//       default:
//         return "ri-file-text-fill text-gray-500";
//     }
//   };

//   const getUserInitials = (email) => {
//     return email ? email.charAt(0).toUpperCase() : "U";
//   };

//   const getStatusColor = (isOnline = false) => {
//     return isOnline ? "bg-green-400" : "bg-gray-400";
//   };

//   return (
//     <main className="h-screen w-screen flex bg-gray-50 font-inter">
//       {/* Chat Panel - Always visible on mobile, responsive width on desktop */}
//       <section className={`left relative flex flex-col h-screen transition-all duration-300 ease-in-out bg-white border-r border-gray-200 shadow-sm ${
//         // On mobile: full width, on desktop: responsive width based on explorer state
//         'w-full md:w-80 lg:w-96 xl:w-[28rem]'
//       } min-w-0`}>
        
//         {/* Simplified Header */}
//         <header className="flex-shrink-0 px-4 py-3 bg-white border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             {/* Project title */}
//             <div className="flex-1 min-w-0">
//               <h1 className="text-lg font-semibold text-gray-900 truncate">
//                 {project?.name || 'Untitled Project'}
//               </h1>
//               <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
//                 <span>{project?.users?.length || 0} members</span>
//                 <span className="text-green-600 font-medium">{onlineUsers.size} online</span>
//               </div>
//             </div>

//             {/* Action buttons */}
//             <div className="flex items-center gap-2 ml-3">
//               <button
//                 onClick={() => setIsModalOpen(true)}
//                 className="hidden sm:flex px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm items-center gap-1.5"
//               >
//                 <i className="ri-user-add-line text-sm"></i>
//                 <span>Add</span>
//               </button>
              
//               <button
//                 onClick={() => setIsModalOpen(true)}
//                 className="sm:hidden p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
//               >
//                 <i className="ri-user-add-line text-sm"></i>
//               </button>

//               <button
//                 onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
//                 className="p-2 hover:bg-gray-100 rounded-md transition-colors relative"
//               >
//                 <i className="ri-team-line text-gray-600"></i>
//                 {onlineUsers.size > 0 && (
//                   <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
//                 )}
//               </button>
//             </div>
//           </div>
//         </header>

//         {/* Chat Messages */}
//         <div className="conversation-area flex-grow flex flex-col h-full relative overflow-hidden">
//           <div
//             ref={messageBox}
//             className="message-box p-3 md:p-4 flex-grow flex flex-col gap-2 md:gap-3 overflow-y-auto"
//           >
//             {messagesLoading && (
//               <div className="text-center text-gray-500 py-8">
//                 <div className="flex items-center justify-center gap-2">
//                   <i className="ri-loader-4-line animate-spin"></i>
//                   <p>Loading messages...</p>
//                 </div>
//               </div>
//             )}

//             {!messagesLoading && messages.length === 0 && (
//               <div className="text-center text-gray-500 py-8">
//                 <p>Start the conversation!</p>
//               </div>
//             )}

//             {!messagesLoading && messages.map((msg, index) => (
//               <div
//                 key={index}
//                 className={`message flex flex-col ${
//                   msg.sender.email === user.email
//                     ? "items-end"
//                     : "items-start"
//                 }`}
//               >
//                 <div
//                   className={`max-w-[85%] sm:max-w-xs lg:max-w-sm xl:max-w-md ${
//                     msg.sender._id === "ai" ? "max-w-full" : ""
//                   } ${
//                     msg.sender.email === user.email
//                       ? "bg-blue-600 text-white rounded-2xl rounded-tr-md"
//                       : msg.sender._id === "ai"
//                       ? "bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl"
//                       : "bg-gray-100 text-gray-900 rounded-2xl rounded-tl-md"
//                   } p-3 shadow-sm`}
//                 >
//                   <small
//                     className={`text-xs mb-1 block ${
//                       msg.sender.email === user.email
//                         ? "text-blue-100"
//                         : msg.sender._id === "ai"
//                         ? "text-gray-300"
//                         : "text-gray-500"
//                     }`}
//                   >
//                     {msg.sender._id === "ai" ? "AI Assistant" : (msg.sender.email ? msg.sender.email.split('@')[0] : 'Unknown')}
//                   </small>
//                   <div className="text-sm leading-relaxed">
//                     {msg.sender._id === "ai" ? (
//                       WriteAiMessage(msg.message)
//                     ) : (
//                       <p>{msg.message}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Input Field */}
//           <div className="inputField flex-shrink-0 p-3 md:p-4 bg-white border-t border-gray-100">
//             <div className="flex gap-2">
//               <input
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 className="flex-grow p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
//                 type="text"
//                 placeholder={socketInitialized ? "Type your message..." : "Connecting..."}
//                 disabled={!socketInitialized}
//               />
//               <button
//                 onClick={send}
//                 disabled={!message.trim() || !socketInitialized}
//                 className="px-3 md:px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 shadow-sm"
//               >
//                 <i className="ri-send-plane-fill text-sm"></i>
//               </button>
//             </div>
//             {!socketInitialized && (
//               <p className="text-xs text-gray-500 mt-1">Connecting to chat...</p>
//             )}
//           </div>
//         </div>

//         {/* Collaborators Side Panel */}
//         <div
//           className={`sidePanel w-full h-full flex flex-col bg-white absolute transition-all duration-300 ease-in-out ${
//             isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
//           } top-0 shadow-lg border-r border-gray-200 z-20`}
//         >
//           <header className="flex-shrink-0 flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
//             <h1 className="font-semibold text-lg text-gray-900">
//               Team Members
//             </h1>
//             <button
//               onClick={() => setIsSidePanelOpen(false)}
//               className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
//             >
//               <i className="ri-close-line text-gray-600"></i>
//             </button>
//           </header>
//           <div className="users flex flex-col p-4 gap-3 overflow-y-auto flex-grow">
//             {project.users &&
//               project.users.map((projectUser, index) => {
//                 const userIsOnline = isUserOnline(projectUser.email);
//                 const canRemove = isProjectOwner() && projectUser.email !== user.email;
//                 const isRemoving = removingUserId === projectUser._id;
                
//                 return (
//                   <div
//                     key={index}
//                     className="user hover:bg-gray-50 p-3 rounded-lg flex gap-3 items-center transition-colors duration-200 group"
//                   >
//                     <div className="relative flex-shrink-0">
//                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
//                         {getUserInitials(projectUser.email)}
//                       </div>
//                       <div
//                         className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(
//                           userIsOnline
//                         )} rounded-full border-2 border-white`}
//                       ></div>
//                     </div>
//                     <div className="flex-grow min-w-0">
//                       <h1 className="font-medium text-gray-900 truncate">
//                         {projectUser.email ? projectUser.email.split('@')[0] : 'Unknown User'}
//                       </h1>
//                       <p className="text-xs text-gray-500">
//                         {userIsOnline ? "Online" : "Offline"}
//                         {projectUser.email === user.email && " (You)"}
//                       </p>
//                     </div>
                    
//                     {/* Remove button - only show for project owner and not for self */}
//                     {canRemove && (
//                       <button
//                         onClick={() => {
//                           if (window.confirm(`Remove ${projectUser.email ? projectUser.email.split('@')[0] : 'this user'} from this project?`)) {
//                             removeCollaborator(projectUser._id);
//                           }
//                         }}
//                         disabled={isRemoving}
//                         className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                         title="Remove collaborator"
//                       >
//                         {isRemoving ? (
//                           <i className="ri-loader-4-line animate-spin text-sm"></i>
//                         ) : (
//                           <i className="ri-user-unfollow-line text-sm"></i>
//                         )}
//                       </button>
//                     )}
//                   </div>
//                 );
//               })}
//           </div>
//         </div>
//       </section>

//       {/* Code Editor Section - Hidden on mobile */}
//       <section className="right hidden md:flex flex-grow h-full min-w-0">
//         {/* File Explorer - With minimize option */}
//         <div className={`explorer h-full bg-gray-800 text-white border-r border-gray-700 transition-all duration-300 ${
//           isExplorerMinimized ? 'w-12' : 'w-64'
//         } flex-shrink-0`}>
//           <div className="p-3 border-b border-gray-700 flex items-center justify-between">
//             {!isExplorerMinimized && (
//               <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
//                 Files
//               </h3>
//             )}
//             <button
//               onClick={() => setIsExplorerMinimized(!isExplorerMinimized)}
//               className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-gray-200"
//               title={isExplorerMinimized ? "Expand Explorer" : "Minimize Explorer"}
//             >
//               <i className={`${isExplorerMinimized ? 'ri-arrow-right-s-line' : 'ri-arrow-left-s-line'} text-sm`}></i>
//             </button>
//           </div>
          
//           {!isExplorerMinimized && (
//             <div className="file-tree">
//               {Object.keys(fileTree).map((file, index) => (
//                 <button
//                   key={index}
//                   onClick={() => {
//                     setCurrentFile(file);
//                     setOpenFiles([...new Set([...openFiles, file])]);
//                   }}
//                   className={`tree-element w-full text-left p-3 px-4 flex items-center gap-3 hover:bg-gray-700 transition-colors duration-200 ${
//                     currentFile === file
//                       ? "bg-gray-700 border-r-2 border-blue-500"
//                       : ""
//                   }`}
//                 >
//                   <i className={`${getFileIcon(file)} text-sm flex-shrink-0`}></i>
//                   <p className="text-sm font-medium truncate">{file}</p>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Code Editor */}
//         <div className="code-editor flex flex-col flex-grow h-full min-w-0">
//           {/* Editor Header */}
//           <div className="top flex justify-between items-center bg-gray-100 border-b border-gray-200 min-h-0 flex-shrink-0">
//             <div className="files flex overflow-x-auto flex-grow">
//               {openFiles.map((file, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setCurrentFile(file)}
//                   className={`open-file flex-shrink-0 p-2 px-3 flex items-center gap-2 border-r border-gray-200 hover:bg-gray-50 transition-colors duration-200 ${
//                     currentFile === file
//                       ? "bg-white border-b-2 border-blue-500"
//                       : ""
//                   }`}
//                 >
//                   <i className={`${getFileIcon(file)} text-sm`}></i>
//                   <p className="text-sm font-medium truncate">{file}</p>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       const newOpenFiles = openFiles.filter((f) => f !== file);
//                       setOpenFiles(newOpenFiles);
//                       if (currentFile === file && newOpenFiles.length > 0) {
//                         setCurrentFile(newOpenFiles[newOpenFiles.length - 1]);
//                       } else if (currentFile === file) {
//                         setCurrentFile(null);
//                       }
//                     }}
//                     className="ml-1 p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
//                   >
//                     <i className="ri-close-line text-xs"></i>
//                   </button>
//                 </button>
//               ))}
//             </div>

//             <div className="actions flex gap-2 p-2 flex-shrink-0">
//               <button
//                 onClick={async () => {
//                   setIsLoading(true);
//                   try {
//                     // First check if we have a valid fileTree with package.json
//                     if (!fileTree || Object.keys(fileTree).length === 0) {
//                       alert("No files to run. Please create some files first.");
//                       return;
//                     }

//                     // Check if package.json exists
//                     if (!fileTree['package.json']) {
//                       alert("No package.json found. Please create a package.json file with your project dependencies.");
//                       return;
//                     }

//                     // Mount the file tree
//                     await webContainer.mount(fileTree);

//                     console.log("Installing dependencies...");
                    
//                     // Install dependencies
//                     const installProcess = await webContainer.spawn("npm", ["install"]);
                    
//                     // Create a more detailed output handler
//                     let installOutput = "";
//                     installProcess.output.pipeTo(
//                       new WritableStream({
//                         write(chunk) {
//                           const text = new TextDecoder().decode(chunk);
//                           installOutput += text;
//                           console.log("Install output:", text);
//                         },
//                       })
//                     );

//                     // Wait for installation to complete
//                     const installExitCode = await installProcess.exit;
                    
//                     if (installExitCode !== 0) {
//                       console.error("Installation failed with exit code:", installExitCode);
//                       console.error("Install output:", installOutput);
//                       alert("Failed to install dependencies. Check console for details.");
//                       return;
//                     }

//                     console.log("Dependencies installed successfully. Starting application...");

//                     // Kill any existing process
//                     if (runProcess) {
//                       runProcess.kill();
//                     }

//                     // Determine what command to run
//                     let startCommand = ["start"];
                    
//                     // Check if package.json has scripts defined
//                     try {
//                       const packageJsonContent = JSON.parse(fileTree['package.json'].file.contents);
//                       if (packageJsonContent.scripts) {
//                         if (packageJsonContent.scripts.dev) {
//                           startCommand = ["run", "dev"];
//                         } else if (packageJsonContent.scripts.start) {
//                           startCommand = ["start"];
//                         } else {
//                           // If no start script, try to run index.js directly
//                           startCommand = ["run", "node", "index.js"];
//                         }
//                       }
//                     } catch (error) {
//                       console.warn("Could not parse package.json, using default start command");
//                     }

//                     // Start the application
//                     let tempRunProcess = await webContainer.spawn("npm", startCommand);
                    
//                     tempRunProcess.output.pipeTo(
//                       new WritableStream({
//                         write(chunk) {
//                           const text = new TextDecoder().decode(chunk);
//                           console.log("App output:", text);
//                         },
//                       })
//                     );

//                     setRunProcess(tempRunProcess);

//                     // Listen for server ready event
//                     webContainer.on("server-ready", (port, url) => {
//                       console.log("Server ready on port:", port, "URL:", url);
//                       setIframeUrl(url);
//                     });

//                   } catch (error) {
//                     console.error("Error running project:", error);
//                     alert(`Error running project: ${error.message}`);
//                   } finally {
//                     setIsLoading(false);
//                   }
//                 }}
//                 disabled={isLoading}
//                 className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm"
//               >
//                 {isLoading ? (
//                   <>
//                     <i className="ri-loader-4-line animate-spin"></i>
//                     <span className="hidden lg:inline">Running...</span>
//                   </>
//                 ) : (
//                   <>
//                     <i className="ri-play-fill"></i>
//                     <span className="hidden lg:inline">Run</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Editor Content */}
//           <div className="bottom flex flex-grow min-h-0 overflow-hidden">
//             {fileTree[currentFile] && fileTree[currentFile].file && fileTree[currentFile].file.contents ? (
//               <div className="code-editor-area h-full flex-grow bg-gray-900 text-gray-100 overflow-auto">
//                 <pre className="hljs h-full text-sm leading-relaxed">
//                   <code
//                     className="hljs h-full block p-4 md:p-6 outline-none"
//                     contentEditable
//                     suppressContentEditableWarning
//                     onBlur={(e) => {
//                       const updatedContent = e.target.innerText;
//                       const ft = {
//                         ...fileTree,
//                         [currentFile]: {
//                           file: {
//                             contents: updatedContent,
//                           },
//                         },
//                       };
//                       setFileTree(ft);
//                       saveFileTree(ft);
//                     }}
//                     dangerouslySetInnerHTML={{
//                       __html: hljs.highlight(
//                         "javascript",
//                         fileTree[currentFile].file.contents
//                       ).value,
//                     }}
//                     style={{
//                       whiteSpace: "pre-wrap",
//                       paddingBottom: "25rem",
//                       counterSet: "line-numbering",
//                     }}
//                   />
//                 </pre>
//               </div>
//             ) : (
//               <div className="flex-grow flex items-center justify-center bg-gray-50">
//                 <div className="text-center text-gray-500 p-4">
//                   <i className="ri-file-text-line text-4xl md:text-6xl mb-4 text-gray-300"></i>
//                   <p className="text-lg font-medium mb-2">
//                     {currentFile ? "File content not available" : "No file selected"}
//                   </p>
//                   <p className="text-sm">
//                     {currentFile 
//                       ? "This file may be empty or have an invalid structure" 
//                       : "Select a file from the explorer to start editing"
//                     }
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Preview Panel */}
//         {iframeUrl && webContainer && (
//           <div className="preview-panel flex min-w-0 w-96 flex-col h-full border-l border-gray-200 bg-white">
//             <div className="preview-header p-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
//               <div className="flex items-center gap-2">
//                 <i className="ri-eye-line text-gray-500 flex-shrink-0"></i>
//                 <input
//                   type="text"
//                   onChange={(e) => setIframeUrl(e.target.value)}
//                   value={iframeUrl}
//                   className="flex-grow p-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
//                 />
//               </div>
//             </div>
//             <iframe src={iframeUrl} className="w-full h-full border-0 flex-grow"></iframe>
//           </div>
//         )}
//       </section>

//       {/* Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col">
//             <header className="flex-shrink-0 flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
//               <h2 className="text-lg md:text-xl font-semibold text-gray-900">
//                 Add Collaborators
//               </h2>
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
//               >
//                 <i className="ri-close-line text-gray-500"></i>
//               </button>
//             </header>

//             <div className="users-list p-4 md:p-6 overflow-y-auto flex-grow">
//               {users
//                 .filter((modalUser) => 
//                   // Only show users who are not already collaborators
//                   !project.users?.some((projectUser) => projectUser._id === modalUser._id)
//                 )
//                 .map((modalUser) => {
//                 const modalUserIsOnline = isUserOnline(modalUser.email);
//                 return (
//                   <div
//                     key={modalUser._id}
//                     className={`user cursor-pointer rounded-lg p-3 flex gap-3 items-center transition-all duration-200 mb-2 ${
//                       Array.from(selectedUserId).includes(modalUser._id)
//                         ? "bg-blue-50 border-2 border-blue-200"
//                         : "hover:bg-gray-50 border-2 border-transparent"
//                     }`}
//                     onClick={() => handleUserClick(modalUser._id)}
//                   >
//                     <div className="relative flex-shrink-0">
//                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
//                         {getUserInitials(modalUser.email)}
//                       </div>
//                       {Array.from(selectedUserId).includes(modalUser._id) && (
//                         <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
//                           <i className="ri-check-line text-white text-xs"></i>
//                         </div>
//                       )}
//                       {/* Online/Offline indicator */}
//                       <div
//                         className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(
//                           modalUserIsOnline
//                         )} rounded-full border-2 border-white`}
//                       ></div>
//                     </div>
//                     <div className="flex-grow min-w-0">
//                       <h1 className="font-medium text-gray-900 truncate">
//                         {modalUser.email}
//                       </h1>
//                       <p className="text-xs text-gray-500">
//                         {modalUserIsOnline ? "Online" : "Offline"}
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })}
              
//               {users.filter((modalUser) => 
//                 !project.users?.some((projectUser) => projectUser._id === modalUser._id)
//               ).length === 0 && (
//                 <div className="text-center text-gray-500 py-4">
//                   <p className="text-sm">All users are already collaborators on this project.</p>
//                 </div>
//               )}
//             </div>

//             <div className="flex-shrink-0 p-4 md:p-6 border-t border-gray-200">
//               <button
//                 onClick={addCollaborators}
//                 disabled={selectedUserId.size === 0 || isLoading}
//                 className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
//               >
//                 {isLoading ? (
//                   <>
//                     <i className="ri-loader-4-line animate-spin"></i>
//                     Adding...
//                   </>
//                 ) : (
//                   `Add ${selectedUserId.size} Collaborator${
//                     selectedUserId.size !== 1 ? "s" : ""
//                   }`
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// };

// export default Project;




import React, { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "../context/user.context";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js";
import { getWebContainer } from "../config/webcontainer";

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  React.useEffect(() => {
    if (ref.current && props.className?.includes("lang-") && window.hljs) {
      window.hljs.highlightElement(ref.current);
      ref.current.removeAttribute("data-highlighted");
    }
  }, [props.className, props.children]);

  return <code {...props} ref={ref} />;
}

const Project = () => {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState("");
  const { user } = useContext(UserContext);
  const messageBox = React.createRef();

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [runProcess, setRunProcess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(true);
  
  // New state for tracking online users and removal loading
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [removingUserId, setRemovingUserId] = useState(null);
  
  // State for responsive file explorer
  const [isExplorerMinimized, setIsExplorerMinimized] = useState(false);
  
  // State for remove confirmation modal
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);

  console.log("user is:", user);

  if (!user?.email) {
    return <div>Loading user...</div>;
  }

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }
      return newSelectedUserId;
    });
  };

  function addCollaborators() {
    setIsLoading(true);
    axios
      .put("/projects/add-user", {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        console.log(res.data);
        setIsModalOpen(false);
        setSelectedUserId(new Set());
        // Refresh project data to get updated collaborators list
        fetchProjectData();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  // New function to remove collaborator
  function removeCollaborator(userId) {
    setRemovingUserId(userId);
    axios
      .put("/projects/remove-user", {
        projectId: project._id,
        userId: userId,
      })
      .then((res) => {
        console.log("User removed:", res.data);
        // Update local project state to remove the user
        setProject((prevProject) => ({
          ...prevProject,
          users: prevProject.users.filter((u) => u._id !== userId)
        }));
      })
      .catch((err) => {
        console.error("Error removing user:", err);
        // You might want to show a toast notification here
        alert("Failed to remove collaborator. Please try again.");
      })
      .finally(() => {
        setRemovingUserId(null);
      });
  }

  // Function to fetch project data
  const fetchProjectData = () => {
    axios
      .get(`/projects/get-project/${project._id}`)
      .then((res) => {
        console.log("Project data:", res.data.project);
        setProject(res.data.project);
        setFileTree(res.data.project.fileTree || {});
      })
      .catch((err) => {
        console.error("Error fetching project:", err);
      });
  };

  // Function to load messages from database
  const loadMessages = async () => {
    try {
      setMessagesLoading(true);
      const response = await axios.get(`/messages/project/${project._id}`);
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const send = () => {
    console.log("inside send function");
    console.log("message trim is:", message.trim());
    console.log("user is:", user);
    console.log("socket initialized:", socketInitialized);
    
    if (!message.trim()) return;
    if (!socketInitialized) {
      console.warn("Socket not initialized yet!");
      return;
    }
    if (!user?.email) {
      console.warn("User not loaded yet!");
      return;
    }

    console.log("Sending message...");

    // Send message via socket (socket will handle saving to DB)
    sendMessage("project-message", {
      message: message.trim(),
      sender: {
        email: user.email,
        name: user.name || user.email,
        _id: 'user'
      },
      projectId: project._id
    });

    // Add message to local state immediately for better UX (will be confirmed by socket)
    const newMessage = {
      message: message.trim(),
      sender: {
        email: user.email,
        name: user.name || user.email,
        _id: 'user'
      },
      timestamp: new Date()
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    
    setMessage("");
    
    // Scroll to bottom after adding message
    setTimeout(scrollToBottom, 100);
  };

  function WriteAiMessage(message) {
  if (!message) return <p>Invalid message</p>;
  
  // First, check if message is already an object
  if (typeof message === 'object') {
    return (
      <div className="overflow-auto bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg p-4 shadow-lg border border-slate-700">
        <Markdown
          children={message.text || message.content || JSON.stringify(message)}
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        />
      </div>
    );
  }

  // If it's a string, try to parse as JSON
  if (typeof message === 'string') {
    // First, try to parse as JSON
    try {
      const messageObject = JSON.parse(message);
      return (
        <div className="overflow-auto bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg p-4 shadow-lg border border-slate-700">
          <Markdown
            children={messageObject.text || messageObject.content || ""}
            options={{
              overrides: {
                code: SyntaxHighlightedCode,
              },
            }}
          />
        </div>
      );
    } catch (error) {
      console.error("Error parsing AI message as JSON:", error);
      console.log("Raw message content:", message.substring(0, 200) + "...");
      
      // If JSON parsing fails, treat as plain text/markdown
      return (
        <div className="overflow-auto bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg p-4 shadow-lg border border-slate-700">
          <Markdown
            children={message}
            options={{
              overrides: {
                code: SyntaxHighlightedCode,
              },
            }}
          />
        </div>
      );
    }
  }

  // Fallback for any other type
  return (
    <div className="overflow-auto bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg p-4 shadow-lg border border-slate-700">
      <p className="text-yellow-400">Unsupported message format</p>
    </div>
  );
}

  // Check if a user is online
  const isUserOnline = (userEmail) => {
    return onlineUsers.has(userEmail);
  };

  // Check if current user is project owner (assuming first user is owner or you have an owner field)
  const isProjectOwner = () => {
    // You might need to adjust this logic based on how you determine project ownership
    return project.createdBy === user._id || project.owner === user._id || 
          (project.users && project.users[0]?.email === user.email);
  };

  // Initialize socket and setup message listeners
  useEffect(() => {
    if (!project._id || !user?.email) return;

    console.log("Initializing socket for project:", project._id);
    
    // Initialize socket
    const socket = initializeSocket(project._id);
    setSocketInitialized(true);

    // Setup message listener
    receiveMessage("project-message", (data) => {
      console.log("Received message:", data);

      // Safety check for data structure
      if (!data || !data.sender) {
        console.error("Invalid message data received:", data);
        return;
      }

      // Handle received messages (including our own from socket confirmation)
      if (data.sender._id === "ai") {
        try {
          const messageContent = JSON.parse(data.message);
          console.log("AI message:", messageContent);
          webContainer?.mount(messageContent.fileTree);

          if (messageContent.fileTree) {
            setFileTree(messageContent.fileTree || {});
          }
          
          // For AI messages, always add to state (no duplication concern)
          setMessages((prevMessages) => [...prevMessages, data]);
        } catch (error) {
          console.error("Error parsing AI message:", error);
          setMessages((prevMessages) => [...prevMessages, data]);
        }
      } else {
        // For user messages, check if it's not from current user to avoid duplication
        if (data.sender.email !== user.email) {
          setMessages((prevMessages) => [...prevMessages, data]);
        } else {
          // If it's our own message, update the local message with DB info (ID, timestamp)
          setMessages((prevMessages) => {
            const updated = [...prevMessages];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0 && updated[lastIndex].sender.email === user.email && !updated[lastIndex]._id) {
              updated[lastIndex] = { ...updated[lastIndex], ...data };
            }
            return updated;
          });
        }
      }
      
      // Scroll to bottom after receiving message
      setTimeout(scrollToBottom, 100);
    });

    // Listen for user online/offline events
    receiveMessage("user-online", (data) => {
      console.log("User came online:", data.userEmail);
      setOnlineUsers((prev) => new Set([...prev, data.userEmail]));
    });

    receiveMessage("user-offline", (data) => {
      console.log("User went offline:", data.userEmail);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userEmail);
        return newSet;
      });
    });

    // Listen for initial online users list
    receiveMessage("online-users", (data) => {
      console.log("Initial online users:", data.users);
      setOnlineUsers(new Set(data.users));
    });

    // Request current online users when socket connects
    sendMessage("get-online-users", { projectId: project._id });

    // Load existing messages
    loadMessages();

    // Fetch project data
    fetchProjectData();

    // Initialize WebContainer
    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container);
        console.log("WebContainer started");
      });
    }

    // Fetch all users
    axios
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.log("Error fetching users:", err);
      });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
        setSocketInitialized(false);
      }
    };
  }, [project._id, user?.email]); // Dependencies

  function saveFileTree(ft) {
    axios
      .put("/projects/update-file-tree", {
        projectId: project._id,
        fileTree: ft,
      })
      .then((res) => {
        console.log("File tree saved:", res.data);
      })
      .catch((err) => {
        console.error("Error saving file tree:", err);
      });
  }

  function scrollToBottom() {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  }

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
        return "ri-javascript-fill text-yellow-500";
      case "jsx":
        return "ri-reactjs-fill text-blue-400";
      case "ts":
      case "tsx":
        return "ri-file-code-fill text-blue-600";
      case "css":
        return "ri-css3-fill text-blue-500";
      case "html":
        return "ri-html5-fill text-orange-500";
      case "json":
        return "ri-file-code-fill text-green-500";
      case "md":
        return "ri-markdown-fill text-gray-600";
      default:
        return "ri-file-text-fill text-gray-500";
    }
  };

  const getUserInitials = (email) => {
    return email ? email.charAt(0).toUpperCase() : "U";
  };

  const getStatusColor = (isOnline = false) => {
    return isOnline ? "bg-green-400" : "bg-gray-400";
  };

  return (
    <main className="h-screen w-screen flex bg-gray-50 font-inter">
      {/* Chat Panel - Always visible on mobile, responsive width on desktop */}
      <section className={`left relative flex flex-col h-screen transition-all duration-300 ease-in-out bg-white border-r border-gray-200 shadow-sm ${
        // On mobile: full width, on desktop: responsive width based on explorer state
        'w-full md:w-80 lg:w-96 xl:w-[28rem]'
      } min-w-0`}>
        
        {/* Simplified Header */}
        <header className="flex-shrink-0 px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            {/* Project title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {project?.name || 'Untitled Project'}
              </h1>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                <span>{project?.users?.length || 0} members</span>
                <span className="text-green-600 font-medium">{onlineUsers.size} online</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 ml-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="hidden sm:flex px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm items-center gap-1.5"
              >
                <i className="ri-user-add-line text-sm"></i>
                <span>Add</span>
              </button>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="sm:hidden p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <i className="ri-user-add-line text-sm"></i>
              </button>

              <button
                onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors relative"
              >
                <i className="ri-team-line text-gray-600"></i>
                {onlineUsers.size > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="conversation-area flex-grow flex flex-col h-full relative overflow-hidden">
          <div
            ref={messageBox}
            className="message-box p-3 md:p-4 flex-grow flex flex-col gap-2 md:gap-3 overflow-y-auto"
          >
            {messagesLoading && (
              <div className="text-center text-gray-500 py-8">
                <div className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin"></i>
                  <p>Loading messages...</p>
                </div>
              </div>
            )}

            {!messagesLoading && messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p>Start the conversation!</p>
              </div>
            )}

            {!messagesLoading && messages.map((msg, index) => (
              <div
                key={index}
                className={`message flex flex-col ${
                  msg.sender.email === user.email
                    ? "items-end"
                    : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-xs lg:max-w-sm xl:max-w-md ${
                    msg.sender._id === "ai" ? "max-w-full" : ""
                  } ${
                    msg.sender.email === user.email
                      ? "bg-blue-600 text-white rounded-2xl rounded-tr-md"
                      : msg.sender._id === "ai"
                      ? "bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl"
                      : "bg-gray-100 text-gray-900 rounded-2xl rounded-tl-md"
                  } p-3 shadow-sm`}
                >
                  <small
                    className={`text-xs mb-1 block ${
                      msg.sender.email === user.email
                        ? "text-blue-100"
                        : msg.sender._id === "ai"
                        ? "text-gray-300"
                        : "text-gray-500"
                    }`}
                  >
                    {msg.sender._id === "ai" ? "AI Assistant" : (msg.sender.email ? msg.sender.email.split('@')[0] : 'Unknown')}
                  </small>
                  <div className="text-sm leading-relaxed">
                    {msg.sender._id === "ai" ? (
                      WriteAiMessage(msg.message)
                    ) : (
                      <p>{msg.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Field */}
          <div className="inputField flex-shrink-0 p-3 md:p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-grow p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                type="text"
                placeholder={socketInitialized ? "Type your message..." : "Connecting..."}
                disabled={!socketInitialized}
              />
              <button
                onClick={send}
                disabled={!message.trim() || !socketInitialized}
                className="px-3 md:px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 shadow-sm"
              >
                <i className="ri-send-plane-fill text-sm"></i>
              </button>
            </div>
            {!socketInitialized && (
              <p className="text-xs text-gray-500 mt-1">Connecting to chat...</p>
            )}
          </div>
        </div>

        {/* Collaborators Side Panel */}
        <div
          className={`sidePanel w-full h-full flex flex-col bg-white absolute transition-all duration-300 ease-in-out ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0 shadow-lg border-r border-gray-200 z-20`}
        >
          <header className="flex-shrink-0 flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
            <h1 className="font-semibold text-lg text-gray-900">
              Team Members
            </h1>
            <button
              onClick={() => setIsSidePanelOpen(false)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              <i className="ri-close-line text-gray-600"></i>
            </button>
          </header>
          <div className="users flex flex-col p-4 gap-3 overflow-y-auto flex-grow">
            {project.users &&
              project.users.map((projectUser, index) => {
                const userIsOnline = isUserOnline(projectUser.email);
                const canRemove = isProjectOwner() && projectUser.email !== user.email;
                const isRemoving = removingUserId === projectUser._id;
                
                return (
                  <div
                    key={index}
                    className="user hover:bg-gray-50 p-3 rounded-lg flex gap-3 items-center transition-colors duration-200 group"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
                        {getUserInitials(projectUser.email)}
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(
                          userIsOnline
                        )} rounded-full border-2 border-white`}
                      ></div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h1 className="font-medium text-gray-900 truncate">
                        {projectUser.email ? projectUser.email.split('@')[0] : 'Unknown User'}
                      </h1>
                      <p className="text-xs text-gray-500">
                        {userIsOnline ? "Online" : "Offline"}
                        {projectUser.email === user.email && " (You)"}
                      </p>
                    </div>
                    
                    {/* Remove button - only show for project owner and not for self */}
                    {canRemove && (
                      <button
                        onClick={() => {
                          setUserToRemove(projectUser);
                          setIsRemoveModalOpen(true);
                        }}
                        disabled={isRemoving}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove collaborator"
                      >
                        {isRemoving ? (
                          <i className="ri-loader-4-line animate-spin text-sm"></i>
                        ) : (
                          <i className="ri-user-unfollow-line text-sm"></i>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* Code Editor Section - Hidden on mobile */}
      <section className="right hidden md:flex flex-grow h-full min-w-0">
        {/* File Explorer - With minimize option */}
        <div className={`explorer h-full bg-gray-800 text-white border-r border-gray-700 transition-all duration-300 ${
          isExplorerMinimized ? 'w-12' : 'w-64'
        } flex-shrink-0`}>
          <div className="p-3 border-b border-gray-700 flex items-center justify-between">
            {!isExplorerMinimized && (
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Files
              </h3>
            )}
            <button
              onClick={() => setIsExplorerMinimized(!isExplorerMinimized)}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-gray-200"
              title={isExplorerMinimized ? "Expand Explorer" : "Minimize Explorer"}
            >
              <i className={`${isExplorerMinimized ? 'ri-arrow-right-s-line' : 'ri-arrow-left-s-line'} text-sm`}></i>
            </button>
          </div>
          
          {!isExplorerMinimized && (
            <div className="file-tree">
              {Object.keys(fileTree).map((file, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentFile(file);
                    setOpenFiles([...new Set([...openFiles, file])]);
                  }}
                  className={`tree-element w-full text-left p-3 px-4 flex items-center gap-3 hover:bg-gray-700 transition-colors duration-200 ${
                    currentFile === file
                      ? "bg-gray-700 border-r-2 border-blue-500"
                      : ""
                  }`}
                >
                  <i className={`${getFileIcon(file)} text-sm flex-shrink-0`}></i>
                  <p className="text-sm font-medium truncate">{file}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Code Editor */}
        <div className="code-editor flex flex-col flex-grow h-full min-w-0">
          {/* Editor Header */}
          <div className="top flex justify-between items-center bg-gray-100 border-b border-gray-200 min-h-0 flex-shrink-0">
            <div className="files flex overflow-x-auto flex-grow">
              {openFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFile(file)}
                  className={`open-file flex-shrink-0 p-2 px-3 flex items-center gap-2 border-r border-gray-200 hover:bg-gray-50 transition-colors duration-200 ${
                    currentFile === file
                      ? "bg-white border-b-2 border-blue-500"
                      : ""
                  }`}
                >
                  <i className={`${getFileIcon(file)} text-sm`}></i>
                  <p className="text-sm font-medium truncate">{file}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newOpenFiles = openFiles.filter((f) => f !== file);
                      setOpenFiles(newOpenFiles);
                      if (currentFile === file && newOpenFiles.length > 0) {
                        setCurrentFile(newOpenFiles[newOpenFiles.length - 1]);
                      } else if (currentFile === file) {
                        setCurrentFile(null);
                      }
                    }}
                    className="ml-1 p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </button>
                </button>
              ))}
            </div>

            <div className="actions flex gap-2 p-2 flex-shrink-0">
              <button
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    // First check if we have a valid fileTree with package.json
                    if (!fileTree || Object.keys(fileTree).length === 0) {
                      alert("No files to run. Please create some files first.");
                      return;
                    }

                    // Check if package.json exists
                    if (!fileTree['package.json']) {
                      alert("No package.json found. Please create a package.json file with your project dependencies.");
                      return;
                    }

                    // Mount the file tree
                    await webContainer.mount(fileTree);

                    console.log("Installing dependencies...");
                    
                    // Install dependencies
                    const installProcess = await webContainer.spawn("npm", ["install"]);
                    
                    // Create a more detailed output handler
                    let installOutput = "";
                    installProcess.output.pipeTo(
                      new WritableStream({
                        write(chunk) {
                          const text = new TextDecoder().decode(chunk);
                          installOutput += text;
                          console.log("Install output:", text);
                        },
                      })
                    );

                    // Wait for installation to complete
                    const installExitCode = await installProcess.exit;
                    
                    if (installExitCode !== 0) {
                      console.error("Installation failed with exit code:", installExitCode);
                      console.error("Install output:", installOutput);
                      alert("Failed to install dependencies. Check console for details.");
                      return;
                    }

                    console.log("Dependencies installed successfully. Starting application...");

                    // Kill any existing process
                    if (runProcess) {
                      runProcess.kill();
                    }

                    // Determine what command to run
                    let startCommand = ["start"];
                    
                    // Check if package.json has scripts defined
                    try {
                      const packageJsonContent = JSON.parse(fileTree['package.json'].file.contents);
                      if (packageJsonContent.scripts) {
                        if (packageJsonContent.scripts.dev) {
                          startCommand = ["run", "dev"];
                        } else if (packageJsonContent.scripts.start) {
                          startCommand = ["start"];
                        } else {
                          // If no start script, try to run index.js directly
                          startCommand = ["run", "node", "index.js"];
                        }
                      }
                    } catch (error) {
                      console.warn("Could not parse package.json, using default start command");
                    }

                    // Start the application
                    let tempRunProcess = await webContainer.spawn("npm", startCommand);
                    
                    tempRunProcess.output.pipeTo(
                      new WritableStream({
                        write(chunk) {
                          const text = new TextDecoder().decode(chunk);
                          console.log("App output:", text);
                        },
                      })
                    );

                    setRunProcess(tempRunProcess);

                    // Listen for server ready event
                    webContainer.on("server-ready", (port, url) => {
                      console.log("Server ready on port:", port, "URL:", url);
                      setIframeUrl(url);
                    });

                  } catch (error) {
                    console.error("Error running project:", error);
                    alert(`Error running project: ${error.message}`);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    <span className="hidden lg:inline">Running...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-play-fill"></i>
                    <span className="hidden lg:inline">Run</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="bottom flex flex-grow min-h-0 overflow-hidden">
            {fileTree[currentFile] && fileTree[currentFile].file && fileTree[currentFile].file.contents ? (
              <div className="code-editor-area h-full flex-grow bg-gray-900 text-gray-100 overflow-auto">
                <pre className="hljs h-full text-sm leading-relaxed">
                  <code
                    className="hljs h-full block p-4 md:p-6 outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updatedContent = e.target.innerText;
                      const ft = {
                        ...fileTree,
                        [currentFile]: {
                          file: {
                            contents: updatedContent,
                          },
                        },
                      };
                      setFileTree(ft);
                      saveFileTree(ft);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight(
                        "javascript",
                        fileTree[currentFile].file.contents
                      ).value,
                    }}
                    style={{
                      whiteSpace: "pre-wrap",
                      paddingBottom: "25rem",
                      counterSet: "line-numbering",
                    }}
                  />
                </pre>
              </div>
            ) : (
              <div className="flex-grow flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500 p-4">
                  <i className="ri-file-text-line text-4xl md:text-6xl mb-4 text-gray-300"></i>
                  <p className="text-lg font-medium mb-2">
                    {currentFile ? "File content not available" : "No file selected"}
                  </p>
                  <p className="text-sm">
                    {currentFile 
                      ? "This file may be empty or have an invalid structure" 
                      : "Select a file from the explorer to start editing"
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        {iframeUrl && webContainer && (
          <div className="preview-panel flex min-w-0 w-96 flex-col h-full border-l border-gray-200 bg-white">
            <div className="preview-header p-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <i className="ri-eye-line text-gray-500 flex-shrink-0"></i>
                <input
                  type="text"
                  onChange={(e) => setIframeUrl(e.target.value)}
                  value={iframeUrl}
                  className="flex-grow p-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
                />
              </div>
            </div>
            <iframe src={iframeUrl} className="w-full h-full border-0 flex-grow"></iframe>
          </div>
        )}
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col">
            <header className="flex-shrink-0 flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Add Collaborators
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <i className="ri-close-line text-gray-500"></i>
              </button>
            </header>

            <div className="users-list p-4 md:p-6 overflow-y-auto flex-grow">
              {users
                .filter((modalUser) => 
                  // Only show users who are not already collaborators
                  !project.users?.some((projectUser) => projectUser._id === modalUser._id)
                )
                .map((modalUser) => {
                const modalUserIsOnline = isUserOnline(modalUser.email);
                return (
                  <div
                    key={modalUser._id}
                    className={`user cursor-pointer rounded-lg p-3 flex gap-3 items-center transition-all duration-200 mb-2 ${
                      Array.from(selectedUserId).includes(modalUser._id)
                        ? "bg-blue-50 border-2 border-blue-200"
                        : "hover:bg-gray-50 border-2 border-transparent"
                    }`}
                    onClick={() => handleUserClick(modalUser._id)}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
                        {getUserInitials(modalUser.email)}
                      </div>
                      {Array.from(selectedUserId).includes(modalUser._id) && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <i className="ri-check-line text-white text-xs"></i>
                        </div>
                      )}
                      {/* Online/Offline indicator */}
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(
                          modalUserIsOnline
                        )} rounded-full border-2 border-white`}
                      ></div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h1 className="font-medium text-gray-900 truncate">
                        {modalUser.email}
                      </h1>
                      <p className="text-xs text-gray-500">
                        {modalUserIsOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {users.filter((modalUser) => 
                !project.users?.some((projectUser) => projectUser._id === modalUser._id)
              ).length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  <p className="text-sm">All users are already collaborators on this project.</p>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 p-4 md:p-6 border-t border-gray-200">
              <button
                onClick={addCollaborators}
                disabled={selectedUserId.size === 0 || isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Adding...
                  </>
                ) : (
                  `Add ${selectedUserId.size} Collaborator${
                    selectedUserId.size !== 1 ? "s" : ""
                  }`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Collaborator Confirmation Modal */}
      {isRemoveModalOpen && userToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <i className="ri-user-unfollow-line text-red-600 text-xl"></i>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Remove Collaborator
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to remove{" "}
                <span className="font-medium text-gray-900">
                  {userToRemove.email ? userToRemove.email.split('@')[0] : 'this user'}
                </span>{" "}
                from this project?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsRemoveModalOpen(false);
                    setUserToRemove(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    removeCollaborator(userToRemove._id);
                    setIsRemoveModalOpen(false);
                    setUserToRemove(null);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;