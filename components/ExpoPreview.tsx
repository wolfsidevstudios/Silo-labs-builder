import React, { useState, useEffect } from 'react';

interface ExpoPreviewProps {
  previewData: string;
}

const ExpoPreview: React.FC<ExpoPreviewProps> = ({ previewData }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [snackUrl, setSnackUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createSnack = async () => {
      setIsLoading(true);
      setError(null);
      setQrCodeUrl(null);
      setSnackUrl(null);
      
      try {
        if (!previewData || previewData.trim() === '') {
          // Don't attempt to parse if there's no data yet. This happens during generation.
          setIsLoading(true);
          setError('Waiting for AI to generate app files...');
          return;
        }
        
        let data;
        try {
            data = JSON.parse(previewData);
        } catch (e) {
            console.error("Failed to parse previewData JSON:", previewData);
            throw new Error('Invalid data format for Expo preview. Waiting for complete data...');
        }
        
        if (data.type !== 'expo' || !data.files || !data.files['App.tsx'] || !data.files['package.json'] || !data.files['app.json']) {
          throw new Error('Invalid or incomplete data structure for Expo preview. Missing one or more required files (App.tsx, package.json, app.json).');
        }

        const packageJson = JSON.parse(data.files['package.json']);
        const appJson = JSON.parse(data.files['app.json']);
        
        const expoVersion = packageJson.dependencies?.expo;
        if (!expoVersion) {
            throw new Error('Expo version not found in package.json');
        }
        // Extract SDK version from package version, e.g., "~51.0.21" -> "51.0.0"
        const sdkVersion = expoVersion.replace(/[\^~]/, '').split('.').slice(0, 2).join('.') + '.0';

        const manifest = {
            ...appJson.expo,
            sdkVersion: sdkVersion,
        };

        const response = await fetch('https://exp.host/--/api/v2/snack/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            code: data.files,
            dependencies: packageJson.dependencies,
            manifest: manifest,
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create Expo Snack: ${errorText}`);
        }

        const result = await response.json();
        const snackId = result.id;
        const projectUrl = `https://expo.dev/${snackId}`;
        const editorUrl = `https://snack.expo.dev/${snackId}`;
        
        setSnackUrl(editorUrl);
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(projectUrl)}`);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    createSnack();
  }, [previewData]);

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-lg overflow-hidden items-center justify-center p-8 text-center">
      {isLoading && !qrCodeUrl && (
        <div>
            <div className="w-12 h-12 border-4 border-t-transparent border-indigo-400 rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-slate-300">Generating Expo Snack...</p>
            {error && <p className="text-sm text-slate-500 mt-2">{error}</p>}
        </div>
      )}
      {!isLoading && error && !qrCodeUrl && (
        <div className="text-red-400">
            <p>Error creating QR Code:</p>
            <p className="text-sm mt-2">{error}</p>
        </div>
      )}
      {qrCodeUrl && (
        <>
          <h2 className="text-2xl font-bold text-white mb-4">Scan with Expo Go</h2>
          <div className="p-4 bg-white rounded-lg shadow-lg">
            <img src={qrCodeUrl} alt="Expo Go QR Code" width="250" height="250" />
          </div>
          <p className="text-slate-400 mt-4 max-w-sm">Open the Expo Go app on your iOS or Android device and scan the QR code to run your app.</p>
          {snackUrl && <a href={snackUrl} target="_blank" rel="noopener noreferrer" className="mt-4 text-indigo-400 hover:underline">Or open in Snack Editor</a>}
        </>
      )}
    </div>
  );
};
export default ExpoPreview;