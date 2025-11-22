// Google Drive API service for syncing data

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const FILE_NAME = 'm-track-data.json';
const FILE_MIME_TYPE = 'application/json';

let gapiLoaded = false;
let gisLoaded = false;

interface GoogleDriveFile {
  id?: string;
  name: string;
  mimeType: string;
}

export const googleDriveService = {
  // Initialize Google API
  init: async (): Promise<void> => {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }

    // If API key is not configured, silently fail (Google Drive is optional)
    if (!GOOGLE_API_KEY) {
      console.warn('Google Drive API key not configured. Google Drive sync will be disabled.');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      let gapiReady = false;
      let gisReady = false;

      const checkReady = () => {
        if (gapiReady && gisReady) {
          resolve();
        }
      };

      // Load GAPI
      if (window.gapi?.client) {
        // Already loaded and initialized
        gapiReady = true;
        checkReady();
      } else if (window.gapi) {
        // GAPI loaded but not initialized
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: GOOGLE_API_KEY,
              discoveryDocs: DISCOVERY_DOCS,
            });
            gapiLoaded = true;
            gapiReady = true;
            checkReady();
          } catch (error: any) {
            console.error('GAPI init error:', error);
            reject(new Error(error.message || 'Failed to initialize Google API client'));
          }
        });
      } else {
        // Need to load GAPI script
        const script1 = document.createElement('script');
        script1.src = 'https://apis.google.com/js/api.js';
        script1.async = true;
        script1.defer = true;
        script1.onload = () => {
          if (!window.gapi) {
            reject(new Error('Google API script loaded but gapi object not available'));
            return;
          }
          window.gapi.load('client', async () => {
            try {
              await window.gapi.client.init({
                apiKey: GOOGLE_API_KEY,
                discoveryDocs: DISCOVERY_DOCS,
              });
              gapiLoaded = true;
              gapiReady = true;
              checkReady();
            } catch (error: any) {
              console.error('GAPI init error (script load):', error);
              reject(new Error(error.message || 'Failed to initialize Google API client'));
            }
          });
        };
        script1.onerror = () => reject(new Error('Failed to load Google API script'));
        document.head.appendChild(script1);
      }

      // Load GIS
      if (window.google?.accounts?.oauth2) {
        // Already loaded
        gisLoaded = true;
        gisReady = true;
        checkReady();
      } else {
        // Need to load GIS script
        const script2 = document.createElement('script');
        script2.src = 'https://accounts.google.com/gsi/client';
        script2.async = true;
        script2.defer = true;
        script2.onload = () => {
          gisLoaded = true;
          gisReady = true;
          checkReady();
        };
        script2.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
        document.head.appendChild(script2);
      }
    });
  },

  // Check if user is signed in
  isSignedIn: (): boolean => {
    if (typeof window === 'undefined' || !window.gapi?.client) return false;
    const token = window.gapi.client.getToken();
    return token !== null && token !== undefined;
  },

  // Sign in to Google
  signIn: async (): Promise<void> => {
    if (typeof window === 'undefined') {
      throw new Error('Browser environment required');
    }

    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
    }

    await googleDriveService.init();

    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        reject(new Error('Google Identity Services not loaded'));
        return;
      }

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            console.error('Token client error:', tokenResponse);
            reject(new Error(tokenResponse.error));
            return;
          }
          try {
            if (window.gapi?.client) {
              // Ensure gapi client is initialized before setting token
              if (!gapiLoaded) {
                await googleDriveService.init();
              }
              window.gapi.client.setToken(tokenResponse);
            }
            resolve();
          } catch (error: any) {
            console.error('Set token error:', error);
            reject(new Error(error.message || 'Failed to set token'));
          }
        },
      });

      // Check if we already have a valid token
      const token = window.gapi?.client?.getToken();
      if (token === null || token === undefined) {
        // Request consent if no token
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        // Skip prompt if we might have a token (though it might be expired, 
        // usually we just request a new one without prompt if possible, 
        // but 'consent' is safer for first time or re-auth)
        // For better UX, let's try without prompt first, or just 'select_account'
        tokenClient.requestAccessToken({ prompt: '' });
      }
    });
  },

  // Sign out from Google
  signOut: async (): Promise<void> => {
    if (typeof window !== 'undefined' && window.gapi?.client) {
      const token = window.gapi.client.getToken();
      if (token !== null && token !== undefined) {
        if (window.google?.accounts?.oauth2) {
          window.google.accounts.oauth2.revoke(token.access_token, () => {
            window.gapi.client.setToken(null); // Use null instead of empty string
          });
        } else {
          window.gapi.client.setToken(null);
        }
      }
    }
  },

  // Find file in Google Drive
  findFile: async (): Promise<GoogleDriveFile | null> => {
    try {
      if (!window.gapi?.client?.drive) {
        // Try to load drive API if not present (should be loaded by init discoveryDocs)
        if (!gapiLoaded) await googleDriveService.init();
        if (!window.gapi?.client?.drive) throw new Error('Google Drive API not initialized');
      }
      const response = await window.gapi.client.drive.files.list({
        q: `name='${FILE_NAME}' and trashed=false`,
        fields: 'files(id, name, mimeType, modifiedTime)',
        spaces: 'appDataFolder',
      });

      const files = response.result.files;
      if (files && files.length > 0) {
        return files[0] as GoogleDriveFile;
      }
      return null;
    } catch (error) {
      console.error('Error finding file:', error);
      throw error;
    }
  },

  // Upload data to Google Drive
  uploadToDrive: async (data: any): Promise<void> => {
    try {
      if (!window.gapi?.client) {
        throw new Error('Google API client not initialized');
      }
      const token = window.gapi.client.getToken();
      if (!token || !token.access_token) {
        throw new Error('Not authenticated with Google Drive');
      }

      const existingFile = await googleDriveService.findFile();
      const fileData = JSON.stringify(data, null, 2);
      const blob = new Blob([fileData], { type: FILE_MIME_TYPE });

      if (existingFile?.id) {
        // Update existing file
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify({ name: FILE_NAME, mimeType: FILE_MIME_TYPE })], { type: 'application/json' }));
        form.append('file', blob);

        const response = await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token.access_token}`,
            },
            body: form,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to update file: ${response.status} ${response.statusText} - ${errorText}`);
        }
      } else {
        // Create new file
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify({
          name: FILE_NAME,
          parents: ['appDataFolder'],
          mimeType: FILE_MIME_TYPE
        })], { type: 'application/json' }));
        form.append('file', blob);

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
          body: form,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create file: ${response.status} ${response.statusText} - ${errorText}`);
        }
      }
    } catch (error: any) {
      console.error('Error uploading to Google Drive:', error);
      throw new Error(error.message || 'Failed to upload to Google Drive');
    }
  },

  // Download data from Google Drive
  downloadFromDrive: async (): Promise<any> => {
    try {
      if (!window.gapi?.client) {
        throw new Error('Google API client not initialized');
      }
      const token = window.gapi.client.getToken();
      if (!token || !token.access_token) {
        throw new Error('Not authenticated with Google Drive');
      }

      const file = await googleDriveService.findFile();
      if (!file?.id) {
        throw new Error('No backup file found in Google Drive');
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download from Google Drive: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error downloading from Google Drive:', error);
      throw new Error(error.message || 'Failed to download from Google Drive');
    }
  },

  // Sync data (upload local to Drive)
  syncToDrive: async (data: any): Promise<void> => {
    if (!googleDriveService.isSignedIn()) {
      throw new Error('Not signed in to Google Drive');
    }
    await googleDriveService.uploadToDrive(data);
  },

  // Sync data (download from Drive to local)
  syncFromDrive: async (): Promise<any> => {
    if (!googleDriveService.isSignedIn()) {
      throw new Error('Not signed in to Google Drive');
    }
    return await googleDriveService.downloadFromDrive();
  },
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

