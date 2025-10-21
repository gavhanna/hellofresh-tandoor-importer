import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function DropzoneArea({ dropzone, label, image }) {
  const inputProps = dropzone.getInputProps();

  return (
    <div>
      <div
        {...dropzone.getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dropzone.isDragActive
            ? 'border-blue-500 bg-blue-50'
            : image
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          {...inputProps}
          capture="environment"
        />
      {image ? (
        <div>
          <img
            src={URL.createObjectURL(image)}
            alt={label}
            className="max-h-48 mx-auto mb-4 rounded select-none"
            draggable={false}
          />
          <p className="text-sm text-gray-600 select-none">
            {image.name}
          </p>
          <p className="text-xs text-gray-500 mt-2 select-none">
            Click or drag to replace
          </p>
        </div>
      ) : (
        <div>
          <div className="flex justify-center gap-4 mb-3">
            {/* Camera icon */}
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {/* Image icon */}
            <svg
              className="h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {dropzone.isDragActive ? (
              <span className="text-blue-600">Drop the image here</span>
            ) : (
              <>
                <span className="font-semibold">{label}</span>
                <br />
                <span className="text-xs">
                  Click to capture with camera or select image
                  <br />
                  <span className="text-gray-500">Drag & drop also works on desktop</span>
                </span>
              </>
            )}
          </p>
        </div>
      )}
      </div>
    </div>
  );
}

export default function ImageUploader({ onImagesSelected, frontImage, backImage }) {
  const onDrop = useCallback(
    (acceptedFiles, field) => {
      if (acceptedFiles?.length > 0) {
        onImagesSelected(field, acceptedFiles[0]);
      }
    },
    [onImagesSelected]
  );

  const frontDropzone = useDropzone({
    onDrop: (acceptedFiles) => {
      onDrop(acceptedFiles, 'front');
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
    },
    maxFiles: 1,
    multiple: false,
    useFsAccessApi: false,
  });

  const backDropzone = useDropzone({
    onDrop: (acceptedFiles) => {
      onDrop(acceptedFiles, 'back');
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
    },
    maxFiles: 1,
    multiple: false,
    useFsAccessApi: false,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DropzoneArea
        dropzone={frontDropzone}
        label="Front of Recipe Card"
        image={frontImage}
      />
      <DropzoneArea
        dropzone={backDropzone}
        label="Back of Recipe Card"
        image={backImage}
      />
    </div>
  );
}
