// tools.js
const { Type } = require("@google/genai");
// We do not need to install fs or path.
// These are built-in core modules in Node.js. They come pre-installed with Node itself. We just need to import them.
const fs = require('fs').promises; // Use Async version of fs
const path = require('path');

// List Files Tool (Recursive) → Provides a list of file paths within the specified directory (folder)
async function listFiles({ directory_path }) {
    console.log(`📂 Scanning: ${directory_path}`);
    const files = [];
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json'];
  
    async function scan(dir) {
        try{
            const items = await fs.readdir(dir);
    
            for (const item of items) {
                // Suppose → dir (folder)=Tester and item=index.html, then fullPath=Tester/index.html
                const fullPath = path.join(dir, item);
                // Skip heavy folders
                if (fullPath.includes('node_modules') || fullPath.includes('dist') || fullPath.includes('build')){
                    continue;
                }    
      
                const stat = await fs.stat(fullPath);
      
                if (stat.isDirectory()) {
                    await scan(fullPath);
                } 
                else if (stat.isFile()) {
                    const ext = path.extname(item);
                    if (extensions.includes(ext) || item === 'package.json') {
                        files.push(fullPath);
                    }
                }
            }
        }
        catch(error){
            console.log(`Error scanning ${dir}:`, error.message);
            return { error: `Failed to scan ${dir}: ${error.message}` };
        }
    }
  
    await scan(directory_path);
    console.log(`🧾 Found ${files.length} files\n`);
    return { files };
}

// Read File Tool
async function readFile({ file_path }) {
    try {
        console.log(`🔍 Reading: ${file_path}`);
        const content = await fs.readFile(file_path, 'utf-8');
        return { content };
    } 
    catch (error) {
        return { error: `Failed to read file: ${error.message}` };
    }
}

// Write File Tool
async function writeFile({ file_path, content }) {
    try {
        await fs.writeFile(file_path, content, 'utf-8');
        console.log(`✔️  Fixed: ${file_path}`);
        return { success: true, message: "File updated successfully." };
    } 
    catch (error) {
        return { error: `Failed to write file: ${error.message}` };
    }
}

// List Files Tool Information
const listFilesToolInfo = {
    name: "listFiles",
    description: "List all relevant code files in a directory. Use this to understand the project structure.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            directory_path: {
                type: Type.STRING,
                description: "Directory path to scan"
            }
        },
        required: ["directory_path"]
    }
};

// Read File Tool Information
const readFileToolInfo = {
    name: "readFile",
    description: "Read the full content of a specific file.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            file_path: {
                type: Type.STRING,
                description: "Path to the file"
            }
        },
        required: ["file_path"]
    }
};

// Write File Tool Information
const writeFileToolInfo = {
    name: "writeFile",
    description: "Write fixed content back to a file",
    parameters: {
        type: Type.OBJECT,
        properties: {
            file_path: {
                type: Type.STRING,
                description: "Path to the file to write"
            },
            content: {
                type: Type.STRING,
                description: "The fixed/corrected content"
            }
        },
        required: ["file_path", "content"]
    }
};

// Tools Information
const toolsInfo = [{
    functionDeclarations: [listFilesToolInfo, readFileToolInfo, writeFileToolInfo]
}];

const toolFunctions = {
    "listFiles": listFiles,
    "readFile": readFile,
    "writeFile": writeFile
}

module.exports = {toolsInfo, toolFunctions};