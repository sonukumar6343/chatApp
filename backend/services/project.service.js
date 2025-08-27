import projectModel from '../models/project.model.js';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export const createProject = async ({
    name, userId
}) => {
    if (!name) {
        throw new Error('Name is required')
    }
    if (!userId) {
        throw new Error('UserId is required')
    }

    let project;
    try {
        project = await projectModel.create({
            name,
            users: [ userId ]
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Project name already exists');
        }
        throw error;
    }

    return project;

}


export const getAllProjectByUserId = async ({ userId }) => {
    if (!userId) {
        throw new Error('UserId is required')
    }

    const allUserProjects = await projectModel.find({
        users: userId
    })

    return allUserProjects
}

export const addUsersToProject = async ({ projectId, users, userId }) => {

    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!users) {
        throw new Error("users are required")
    }

    if (!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) {
        throw new Error("Invalid userId(s) in users array")
    }

    if (!userId) {
        throw new Error("userId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId")
    }


    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    })

    console.log(project)

    if (!project) {
        throw new Error("User not belong to this project")
    }

    const updatedProject = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        $addToSet: {
            users: {
                $each: users
            }
        }
    }, {
        new: true
    })

    return updatedProject



}

export const getProjectById = async ({ projectId }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    const project = await projectModel.findOne({
        _id: projectId
    }).populate('users')

    return project;
}

export const updateFileTree = async ({ projectId, fileTree }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!fileTree) {
        throw new Error("fileTree is required")
    }

    const project = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        fileTree
    }, {
        new: true
    })

    return project;
}




export const removeUserFromProject = async ({ projectId, userId, requesterEmail }) => {
    console.log("userID is:", userId);
    console.log("remove user from project is being hit");
    
    try {
        // Find the project and populate users
        const project = await projectModel.findById(projectId).populate('users');
        
        if (!project) {
            throw new Error('Project not found');
        }
        
        // Find the requester by email in the project's users
        const requester = project.users.find(user => user.email === requesterEmail);
        
        if (!requester) {
            throw new Error('You are not authorized to modify this project');
        }
        
        // Check if the user to be removed exists in the project
        const userToRemove = project.users.find(user => user._id.toString() === userId.toString());
        
        if (!userToRemove) {
            throw new Error('User is not a collaborator in this project');
        }
        
        // Prevent self-removal
        if (requester._id.toString() === userId.toString()) {
            throw new Error('You cannot remove yourself from the project');
        }
        
        console.log(`Removing user ${userToRemove.email} from project ${project._id}`);
        console.log("Users before removal:", project.users.map(u => ({ id: u._id.toString(), email: u.email })));
        console.log("UserID to remove:", userId, "Type:", typeof userId);
        
        // FIX 1: Convert userId to ObjectId and use direct reference removal
        const updatedProject = await projectModel.findByIdAndUpdate(
            projectId,
            {
                $pull: {
                    users: new ObjectId(userId) // Convert to ObjectId
                }
            },
            {
                new: true
            }
        ).populate('users');
        
    
        return updatedProject;
        
    } catch (error) {
        console.error("Error removing user from project:", error);
        throw error;
    }
};

