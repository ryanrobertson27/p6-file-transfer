require('dotenv').config();
const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { get } = require('https');

// Path to your credentials file
const CREDENTIALS_PATH = path.join(__dirname, '../config/credentials.json');
console.log(CREDENTIALS_PATH)
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Create an auth client using the service account key
const auth = new GoogleAuth({
    credentials: credentials,
    scopes: SCOPES,
});

// Replace 'your-folder-id' with the actual folder ID
const FOLDER_ID = '0AAeHyu_zTN6nUk9PVA';    

// Function to list folders in a Google Drive folder
async function listFolders() {
    const client = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: client });

    console.log(`Looking for folders in directory with ID: ${FOLDER_ID}`);

    try {
        const res = await drive.files.list({
            q: `'${FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder'`,
            pageSize: 1000,
            orderBy: 'name',
            fields: 'nextPageToken, files(id, name, description)',
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
        });

        // console.log('Full API Response:', res.data);

        const folders = res.data.files;
        if (folders.length) {
            folders.map((folder) => {
                console.log(`${folder.name} - ${folder.id} - ${folder.description}`);
            });
        } else {
            console.log('No folders found in the specified directory.');
        }
    } catch (error) {
        console.error('Error listing folders:', error);
    }
}

// Sample functions for getting SSD paths and recorded files
function getSSDPath(parentPath) {
    try {
        const entries = fs.readdirSync(parentPath, { withFileTypes: true });
        for (const dirent of entries) {
            const matchingSSDName = /^P6SxK-\d+$/;
            if (matchingSSDName.test(dirent.name)) {
                return path.join(parentPath, dirent.name);
            }
        }
    } catch (err) {
        console.log(`There was an error getting path to SSD: ${err}`);
    }
    return null;
}

function getRecordedFiles(ssdPath) {
    const entries = fs.readdirSync(ssdPath, { withFileTypes: true });

    const folders = entries
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name);

    return folders;
}

const ssdPath = getSSDPath('/Volumes')
if (ssdPath) {
    const recordedFiles = getRecordedFiles(ssdPath)
    console.log(recordedFiles)
}


// Example usage
listFolders().then(() => {
    console.log('Listing folders completed.');
}).catch((err) => {
    console.error('Error:', err);
});
