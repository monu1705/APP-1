# Google Drive Integration Setup

To enable Google Drive sync in M-track, you need to set up Google OAuth credentials.

## Steps to Set Up Google Drive:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project**
   - Click on the project dropdown
   - Click "New Project"
   - Enter a project name (e.g., "M-track")
   - Click "Create"

3. **Enable Google Drive API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click on it and click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - Choose "External"
     - Fill in the required information
     - Add scopes: `https://www.googleapis.com/auth/drive.file`
     - Add your email as a test user
   - For Application type, choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production URL (for production)
   - Add authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - Your production URL (for production)
   - Click "Create"
   - Copy the **Client ID** (you'll need this)

5. **Create API Key (Optional but Recommended)**
   - Still in Credentials
   - Click "Create Credentials" > "API key"
   - Copy the API key
   - (Optional) Restrict the API key to only Google Drive API

6. **Set Environment Variables**
   Create a `.env` file in the root directory:
   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id-here
   VITE_GOOGLE_API_KEY=your-api-key-here
   ```

## How It Works:

- **Local Storage**: All data is stored locally in your browser by default
- **Google Drive Sync**: When you connect Google Drive, your data is backed up to your Google Drive
- **Cross-Device Access**: You can sync your data from Google Drive on any device
- **Security**: Your data is stored in your Google Drive's App Data folder (private, not visible in regular Drive)

## Usage:

1. Open Settings
2. Click "Google Drive Sync"
3. Click "Connect to Google Drive"
4. Sign in with your Google account
5. Grant permissions
6. Your data will be automatically synced

## Syncing:

- **Upload to Drive**: Uploads your local data to Google Drive
- **Download from Drive**: Downloads data from Google Drive to your local storage (overwrites local data)

## Important Notes:

- Data is stored in Google Drive's App Data folder (hidden from regular Drive view)
- Only you can access your data
- Local storage always takes precedence
- Sync manually using the upload/download buttons

