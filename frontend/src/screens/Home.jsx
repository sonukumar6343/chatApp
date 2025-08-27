import React, { useContext, useState, useEffect } from "react";
import {
  Plus,
  Users,
  MessageCircle,
  Folder,
  CheckCircle,
  XCircle,
  X,
  LogOut,
  User,
} from "lucide-react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState(null);
  const [project, setProject] = useState([]);
  const [toast, setToast] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  // Toast functions
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const hideToast = () => {
    setToast(null);
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
      
      // Clear user context
      setUser(null);
      
      // Clear any stored tokens
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      // Show success message
      showToast("Logged out successfully!", "success");
      
      // Navigate to login page after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout request fails, clear local data
      setUser(null);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      showToast("Logged out successfully!", "success");
      
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    }
  };

  function createProject(e) {
    e.preventDefault();

    // Validate input
    if (!projectName || !projectName.trim()) {
      showToast("Please enter a project name", "error");
      return;
    }

    console.log({ projectName });
    axios
      .post("/projects/create", {
        name: projectName.trim(),
      })
      .then((res) => {
        console.log("Success:", res);
        setIsModalOpen(false);
        setProjectName(null);
        showToast("Project created successfully!", "success");
        // Refresh projects list after creation
        loadProjects();
      })
      .catch((error) => {
        console.error("Create project error:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to create project";
        showToast(errorMessage, "error");
      });
  }

  const loadProjects = () => {
    axios
      .get("/projects/all")
      .then((res) => {
        setProject(res.data.projects);
      })
      .catch((err) => {
        console.error("Load projects error:", err);
        showToast("Failed to load projects", "error");
      });
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">DevChat</h1>
                <p className="text-sm text-slate-500">Developer Collaboration</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="relative user-menu">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-700">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user?.email || ""}
                  </p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-200">
                    <p className="text-sm font-medium text-slate-700">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user?.email || ""}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-slate-800">Your Projects</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </button>
          </div>
          <p className="text-slate-600">
            Manage and collaborate on your team projects
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {project.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <Folder className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-500 mb-2">
                No projects yet
              </h3>
              <p className="text-slate-400 mb-6">
                Create your first project to start collaborating with your team
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </button>
            </div>
          ) : (
            project.map((proj) => (
              <div
                key={proj._id}
                onClick={() => {
                  navigate(`/project`, {
                    state: { project: proj },
                  });
                }}
                className="group bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {proj.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      Collaborators: {proj.users ? proj.users.length : 0}
                    </span>
                  </div>
                  <div className="flex -space-x-2">
                    {proj.users &&
                      proj.users.slice(0, 3).map((member, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-white flex items-center justify-center"
                        >
                          <span className="text-xs font-medium text-white">
                            {member.name ? member.name.charAt(0) : "?"}
                          </span>
                        </div>
                      ))}
                    {proj.users && proj.users.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-medium text-slate-600">
                          +{proj.users.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  Create New Project
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Project Name
                  </label>
                  <input
                    onChange={(e) => setProjectName(e.target.value)}
                    value={projectName || ""}
                    type="text"
                    placeholder="Enter project name..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        createProject(e);
                      }
                    }}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createProject}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`flex items-center p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
              toast.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex-shrink-0">
              {toast.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div className="ml-3 flex-1">
              <p
                className={`text-sm font-medium ${
                  toast.type === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {toast.message}
              </p>
            </div>
            <button
              onClick={hideToast}
              className={`ml-4 inline-flex text-sm ${
                toast.type === "success"
                  ? "text-green-400 hover:text-green-600"
                  : "text-red-400 hover:text-red-600"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
// import React, { useContext, useState, useEffect } from "react";
// import {
//   Plus,
//   Users,
//   MessageCircle,
//   Folder,
//   CheckCircle,
//   XCircle,
//   X,
// } from "lucide-react";
// import { UserContext } from "../context/user.context";
// import axios from "../config/axios";
// import { useNavigate } from "react-router-dom";

// const Home = () => {
//   const { user } = useContext(UserContext);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [projectName, setProjectName] = useState(null);
//   const [project, setProject] = useState([]);
//   const [toast, setToast] = useState(null);
//   const navigate = useNavigate();

//   // Toast functions
//   const showToast = (message, type = "success") => {
//     setToast({ message, type });
//     setTimeout(() => setToast(null), 4000);
//   };

//   const hideToast = () => {
//     setToast(null);
//   };

//   function createProject(e) {
//     e.preventDefault();

//     // Validate input
//     if (!projectName || !projectName.trim()) {
//       showToast("Please enter a project name", "error");
//       return;
//     }

//     console.log({ projectName });
//     axios
//       .post("/projects/create", {
//         name: projectName.trim(),
//       })
//       .then((res) => {
//         console.log("Success:", res);
//         setIsModalOpen(false);
//         setProjectName(null);
//         showToast("Project created successfully!", "success");
//         // Refresh projects list after creation
//         loadProjects();
//       })
//       .catch((error) => {
//         console.error("Create project error:", error);
//         const errorMessage =
//           error.response?.data?.message || "Failed to create project";
//         showToast(errorMessage, "error");
//       });
//   }

//   const loadProjects = () => {
//     axios
//       .get("/projects/all")
//       .then((res) => {
//         setProject(res.data.projects);
//       })
//       .catch((err) => {
//         console.error("Load projects error:", err);
//         showToast("Failed to load projects", "error");
//       });
//   };

//   useEffect(() => {
//     loadProjects();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b border-slate-200">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
//               <MessageCircle className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-slate-800">DevChat</h1>
//               <p className="text-sm text-slate-500">Developer Collaboration</p>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-6 py-8">
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-2">
//             <h2 className="text-2xl font-bold text-slate-800">Your Projects</h2>
//             <button
//               onClick={() => setIsModalOpen(true)}
//               className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
//             >
//               <Plus className="w-4 h-4 mr-2" />
//               New Project
//             </button>
//           </div>
//           <p className="text-slate-600">
//             Manage and collaborate on your team projects
//           </p>
//         </div>

//         {/* Projects Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {project.length === 0 ? (
//             <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
//               <Folder className="w-16 h-16 text-slate-300 mb-4" />
//               <h3 className="text-lg font-medium text-slate-500 mb-2">
//                 No projects yet
//               </h3>
//               <p className="text-slate-400 mb-6">
//                 Create your first project to start collaborating with your team
//               </p>
//               <button
//                 onClick={() => setIsModalOpen(true)}
//                 className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 <Plus className="w-4 h-4 mr-2" />
//                 Create Project
//               </button>
//             </div>
//           ) : (
//             project.map((proj) => (
//               <div
//                 key={proj._id}
//                 onClick={() => {
//                   navigate(`/project`, {
//                     state: { project: proj },
//                   });
//                 }}
//                 className="group bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
//               >
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex-1">
//                     <h3 className="font-semibold text-lg text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
//                       {proj.name}
//                     </h3>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between mt-4">
//                   <div className="flex items-center space-x-2">
//                     <Users className="w-4 h-4 text-slate-400" />
//                     <span className="text-sm text-slate-600">
//                       Collaborators: {proj.users ? proj.users.length : 0}
//                     </span>
//                   </div>
//                   <div className="flex -space-x-2">
//                     {proj.users &&
//                       proj.users.slice(0, 3).map((member, index) => (
//                         <div
//                           key={index}
//                           className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-white flex items-center justify-center"
//                         >
//                           <span className="text-xs font-medium text-white">
//                             {member.name ? member.name.charAt(0) : "?"}
//                           </span>
//                         </div>
//                       ))}
//                     {proj.users && proj.users.length > 3 && (
//                       <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
//                         <span className="text-xs font-medium text-slate-600">
//                           +{proj.users.length - 3}
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </main>

//       {/* Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-xl font-bold text-slate-800">
//                   Create New Project
//                 </h2>
//                 <button
//                   onClick={() => setIsModalOpen(false)}
//                   className="text-slate-400 hover:text-slate-600 transition-colors"
//                 >
//                   <svg
//                     className="w-6 h-6"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 </button>
//               </div>

//               <div>
//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Project Name
//                   </label>
//                   <input
//                     onChange={(e) => setProjectName(e.target.value)}
//                     value={projectName || ""}
//                     type="text"
//                     placeholder="Enter project name..."
//                     className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
//                     required
//                     onKeyPress={(e) => {
//                       if (e.key === "Enter") {
//                         e.preventDefault();
//                         createProject(e);
//                       }
//                     }}
//                   />
//                 </div>

//                 <div className="flex space-x-3">
//                   <button
//                     type="button"
//                     className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
//                     onClick={() => setIsModalOpen(false)}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={createProject}
//                     className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg"
//                   >
//                     Create
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Toast Notification */}
//       {toast && (
//         <div className="fixed top-4 right-4 z-50">
//           <div
//             className={`flex items-center p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
//               toast.type === "success"
//                 ? "bg-green-50 border border-green-200"
//                 : "bg-red-50 border border-red-200"
//             }`}
//           >
//             <div className="flex-shrink-0">
//               {toast.type === "success" ? (
//                 <CheckCircle className="w-5 h-5 text-green-500" />
//               ) : (
//                 <XCircle className="w-5 h-5 text-red-500" />
//               )}
//             </div>
//             <div className="ml-3 flex-1">
//               <p
//                 className={`text-sm font-medium ${
//                   toast.type === "success" ? "text-green-800" : "text-red-800"
//                 }`}
//               >
//                 {toast.message}
//               </p>
//             </div>
//             <button
//               onClick={hideToast}
//               className={`ml-4 inline-flex text-sm ${
//                 toast.type === "success"
//                   ? "text-green-400 hover:text-green-600"
//                   : "text-red-400 hover:text-red-600"
//               }`}
//             >
//               <X className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Home;