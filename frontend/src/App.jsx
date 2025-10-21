import { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import RecipePreview from './components/RecipePreview';
import ProcessingStatus from './components/ProcessingStatus';
import { uploadRecipeCards, importRecipe } from './services/api';

export default function App() {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [recipeData, setRecipeData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [tandoorUrl, setTandoorUrl] = useState(null);

  const handleImagesSelected = useCallback((field, file) => {
    console.log('App: handleImagesSelected called', { field, fileName: file?.name });
    if (field === 'front') {
      setFrontImage(file);
    } else {
      setBackImage(file);
    }
    // Reset state when new images are selected
    setRecipeData(null);
    setStatus(null);
    setError(null);
    setTandoorUrl(null);
  }, []);

  const handleUpload = async () => {
    if (!frontImage || !backImage) {
      setError('Please select both front and back images');
      setStatus('error');
      return;
    }

    try {
      setStatus('uploading');
      setError(null);

      const response = await uploadRecipeCards(frontImage, backImage);

      setStatus('processing');

      if (response.success) {
        setRecipeData(response.data);
        setSessionId(response.sessionId);
        setStatus(null);
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to process images');
      setStatus('error');
    }
  };

  const handleImport = async () => {
    if (!sessionId || !recipeData) {
      setError('No recipe data to import');
      setStatus('error');
      return;
    }

    try {
      setStatus('importing');
      setError(null);

      const response = await importRecipe(sessionId, recipeData);

      if (response.success) {
        // Show success briefly, then reset to allow re-import
        setTandoorUrl(response.url);

        // Show success message for 3 seconds, then allow re-import
        setTimeout(() => {
          setStatus(null);
          setTandoorUrl(null);
        }, 3000);
      } else {
        throw new Error(response.message || 'Import failed');
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to import recipe');
      setStatus('error');
    }
  };

  const handleRecipeEdit = (updatedData) => {
    setRecipeData(updatedData);
  };

  const handleReset = () => {
    setFrontImage(null);
    setBackImage(null);
    setRecipeData(null);
    setSessionId(null);
    setStatus(null);
    setError(null);
    setTandoorUrl(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            HelloFresh Recipe Importer
          </h1>
          <p className="text-gray-600">
            Scan your HelloFresh recipe cards and import them to Tandoor
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Image Uploader */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Step 1: Upload Recipe Cards
            </h2>
            <ImageUploader
              onImagesSelected={handleImagesSelected}
              frontImage={frontImage}
              backImage={backImage}
            />

            {frontImage && backImage && !recipeData && (
              <div className="mt-6">
                <button
                  onClick={handleUpload}
                  disabled={status === 'uploading' || status === 'processing'}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Extract Recipe Data
                </button>
              </div>
            )}
          </div>

          {/* Processing Status */}
          {status && <ProcessingStatus status={status} error={error} />}

          {/* Success Message with Link */}
          {status === 'success' && tandoorUrl && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Recipe imported successfully!
                </h3>
                <a
                  href={tandoorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 bg-green-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  View in Tandoor
                </a>
                <button
                  onClick={handleReset}
                  className="inline-block mt-4 ml-4 bg-gray-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Import Another Recipe
                </button>
              </div>
            </div>
          )}

          {/* Recipe Preview */}
          {recipeData && status !== 'success' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Step 2: Review & Import
              </h2>
              <RecipePreview
                recipeData={recipeData}
                onEdit={handleRecipeEdit}
                onImport={handleImport}
                importing={status === 'importing'}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Made with ❤️ for HelloFresh recipe card collectors
          </p>
        </div>
      </div>
    </div>
  );
}
