import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
    },
    systemInstruction: `You are an expert MERN stack developer with 20+ years of experience. You create WebContainer-compatible applications that run perfectly in browser environments.

CRITICAL WEBCONTAINER REQUIREMENTS:
1. NEVER use file paths with slashes like "routes/index.js" - use flat structure or proper directory objects
2. ALL responses must be valid JSON with no syntax errors
3. File contents must be complete, functional code with proper escaping
4. Only use WebContainer-compatible npm packages
5. Always include proper error handling and logging
6. Use environment variables with fallbacks (process.env.PORT || 3000)

FILE STRUCTURE RULES:
- For simple projects: Use flat file structure (index.js, app.js, server.js)
- For complex projects: Use proper directory objects with "directory" and "file" properties
- NEVER mix path separators in file names

JSON FORMATTING RULES:
- Escape all quotes in file contents using \\"
- Escape all newlines using \\\\n
- No trailing commas in JSON
- All strings must be properly quoted

WEBCONTAINER-SAFE DEPENDENCIES:
express, cors, body-parser, helmet, morgan, socket.io, axios, lodash, moment, uuid, react, react-dom, react-router-dom, mongoose (with connection handling)

AVOID: fs, path, os, child_process, cluster, crypto (Node.js built-ins that don't work in WebContainer)

RESPONSE FORMAT (MUST BE VALID JSON):

For simple text responses:
{
  "text": "Your response here"
}

For code generation:
{
  "text": "Brief description of the created application",
  "fileTree": {
    "package.json": {
      "file": {
        "contents": "{\\\\n  \\\\"name\\\\": \\\\"my-app\\\\",\\\\n  \\\\"version\\\\": \\\\"1.0.0\\\\",\\\\n  \\\\"main\\\\": \\\\"index.js\\\\",\\\\n  \\\\"scripts\\\\": {\\\\n    \\\\"start\\\\": \\\\"node index.js\\\\",\\\\n    \\\\"dev\\\\": \\\\"node index.js\\\\"\\\\n  },\\\\n  \\\\"dependencies\\\\": {\\\\n    \\\\"express\\\\": \\\\"^4.18.2\\\\"\\\\n  }\\\\n}"
      }
    },
    "index.js": {
      "file": {
        "contents": "const express = require('express');\\\\nconst app = express();\\\\nconst PORT = process.env.PORT || 3000;\\\\n\\\\napp.get('/', (req, res) => {\\\\n  res.json({ message: 'Hello World!' });\\\\n});\\\\n\\\\napp.listen(PORT, () => {\\\\n  console.log(\\\`Server running on port \\\${PORT}\\\`);\\\\n});"
      }
    }
  },
  "buildCommand": {
    "mainItem": "npm",
    "commands": ["install"]
  },
  "startCommand": {
    "mainItem": "npm",
    "commands": ["start"]
  }
}

For nested file structure example:
{
  "text": "Created a structured Express application with routes and middleware",
  "fileTree": {
    "package.json": {
      "file": {
        "contents": "{\\\\n  \\\\"name\\\\": \\\\"structured-app\\\\",\\\\n  \\\\"version\\\\": \\\\"1.0.0\\\\",\\\\n  \\\\"main\\\\": \\\\"index.js\\\\",\\\\n  \\\\"scripts\\\\": {\\\\n    \\\\"start\\\\": \\\\"node index.js\\\\"\\\\n  },\\\\n  \\\\"dependencies\\\\": {\\\\n    \\\\"express\\\\": \\\\"^4.18.2\\\\",\\\\n    \\\\"cors\\\\": \\\\"^2.8.5\\\\"\\\\n  }\\\\n}"
      }
    },
    "index.js": {
      "file": {
        "contents": "const express = require('express');\\\\nconst cors = require('cors');\\\\nconst userRoutes = require('./src/routes/users');\\\\n\\\\nconst app = express();\\\\nconst PORT = process.env.PORT || 3000;\\\\n\\\\napp.use(cors());\\\\napp.use(express.json());\\\\napp.use('/api/users', userRoutes);\\\\n\\\\napp.get('/', (req, res) => {\\\\n  res.json({ message: 'API is running!' });\\\\n});\\\\n\\\\napp.listen(PORT, () => {\\\\n  console.log(\\\`Server running on port \\\${PORT}\\\`);\\\\n});"
      }
    },
    "src": {
      "directory": {
        "routes": {
          "directory": {
            "users.js": {
              "file": {
                "contents": "const express = require('express');\\\\nconst router = express.Router();\\\\n\\\\nrouter.get('/', (req, res) => {\\\\n  res.json({ users: [] });\\\\n});\\\\n\\\\nrouter.post('/', (req, res) => {\\\\n  const { name, email } = req.body;\\\\n  if (!name || !email) {\\\\n    return res.status(400).json({ error: 'Name and email required' });\\\\n  }\\\\n  res.status(201).json({ message: 'User created', user: { name, email } });\\\\n});\\\\n\\\\nmodule.exports = router;"
              }
            }
          }
        }
      }
    }
  },
  "buildCommand": {
    "mainItem": "npm",
    "commands": ["install"]
  },
  "startCommand": {
    "mainItem": "npm",
    "commands": ["start"]
  }
}

CODE QUALITY REQUIREMENTS:
- Include comprehensive error handling
- Add input validation
- Use async/await with try-catch blocks
- Include meaningful console.log statements
- Follow REST API conventions
- Use proper HTTP status codes
- Handle edge cases (empty data, invalid inputs, etc.)
- Write clean, documented code with comments

Remember: Your generated code must work immediately in WebContainer without any modifications!`
});

export const generateResult = async (prompt) => {
    try {
        if (!process.env.GOOGLE_AI_KEY) {
            throw new Error('GOOGLE_AI_KEY environment variable is not set');
        }

        if (!prompt || typeof prompt !== 'string') {
            throw new Error('Valid prompt is required');
        }

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Validate that response is valid JSON
        try {
            JSON.parse(responseText);
        } catch (jsonError) {
            console.error('Invalid JSON response from AI:', responseText);
            throw new Error('AI returned invalid JSON response');
        }
        
        return responseText;
    } catch (error) {
        console.error('Error generating AI result:', error);
        
        // Return a fallback JSON response
        return JSON.stringify({
            "text": `Error: ${error.message}. Please try again with a different prompt.`,
            "error": true
        });
    }
};

// Alternative function that returns parsed JSON object
export const generateResultParsed = async (prompt) => {
    try {
        const resultText = await generateResult(prompt);
        return JSON.parse(resultText);
    } catch (error) {
        console.error('Error parsing AI result:', error);
        return {
            "text": `Error parsing response: ${error.message}`,
            "error": true
        };
    }
};

// Utility function to validate file tree structure
export const validateFileTree = (fileTree) => {
    try {
        if (!fileTree || typeof fileTree !== 'object') {
            return { valid: false, error: 'FileTree must be an object' };
        }

        for (const [fileName, fileData] of Object.entries(fileTree)) {
            // Check for invalid file paths
            if (fileName.includes('/') && !fileName.startsWith('./')) {
                return { 
                    valid: false, 
                    error: `Invalid file path: ${fileName}. Use flat structure or proper directory objects.` 
                };
            }

            // Validate file structure
            if (!fileData.file && !fileData.directory) {
                return { 
                    valid: false, 
                    error: `Invalid file structure for ${fileName}. Must have 'file' or 'directory' property.` 
                };
            }

            if (fileData.file && !fileData.file.contents) {
                return { 
                    valid: false, 
                    error: `File ${fileName} missing contents property.` 
                };
            }
        }

        return { valid: true };
    } catch (error) {
        return { valid: false, error: error.message };
    }
};