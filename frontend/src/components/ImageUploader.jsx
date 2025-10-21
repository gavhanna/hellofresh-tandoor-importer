import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function DropzoneArea({ dropzone, label, image }) {
  return (
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
      <input {...dropzone.getInputProps()} />
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
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <p className="mt-2 text-sm text-gray-600">
            {dropzone.isDragActive ? (
              <span className="text-blue-600">Drop the image here</span>
            ) : (
              <>
                <span className="font-semibold">{label}</span>
                <br />
                <span className="text-xs">Drag & drop or click to select</span>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ImageUploader({ onImagesSelected, frontImage, backImage }) {
  const onDrop = useCallback(
    (acceptedFiles, field) => {
      console.log('onDrop called:', { field, acceptedFiles });
      if (acceptedFiles?.length > 0) {
        console.log('File selected:', acceptedFiles[0].name);
        onImagesSelected(field, acceptedFiles[0]);
      } else {
        console.log('No files in acceptedFiles');
      }
    },
    [onImagesSelected]
  );

  const frontDropzone = useDropzone({
    onDrop: (files) => {
      console.log('Front dropzone onDrop:', files);
      onDrop(files, 'front');
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
    },
    maxFiles: 1,
    multiple: false,
    noClick: false,
    noKeyboard: false,
  });

  const backDropzone = useDropzone({
    onDrop: (files) => {
      console.log('Back dropzone onDrop:', files);
      onDrop(files, 'back');
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
    },
    maxFiles: 1,
    multiple: false,
    noClick: false,
    noKeyboard: false,
  });

  console.log('ImageUploader render:', {
    frontImage: frontImage?.name,
    backImage: backImage?.name,
    frontDropzone: { isDragActive: frontDropzone.isDragActive },
    backDropzone: { isDragActive: backDropzone.isDragActive }
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
