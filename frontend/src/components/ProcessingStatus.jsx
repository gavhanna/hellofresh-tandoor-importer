export default function ProcessingStatus({ status, error }) {
  if (!status) return null;

  const statusConfig = {
    uploading: {
      color: 'blue',
      icon: '⏫',
      message: 'Uploading images...',
    },
    processing: {
      color: 'yellow',
      icon: '🔄',
      message: 'Extracting recipe data with AI...',
    },
    checking: {
      color: 'purple',
      icon: '🔍',
      message: 'Checking for duplicates...',
    },
    importing: {
      color: 'indigo',
      icon: '📥',
      message: 'Importing to Tandoor...',
    },
    success: {
      color: 'green',
      icon: '✅',
      message: 'Recipe imported successfully!',
    },
    error: {
      color: 'red',
      icon: '❌',
      message: error || 'An error occurred',
    },
  };

  const config = statusConfig[status] || statusConfig.processing;

  const bgColor = `bg-${config.color}-50`;
  const borderColor = `border-${config.color}-200`;
  const textColor = `text-${config.color}-800`;

  return (
    <div
      className={`border rounded-lg p-4 ${bgColor} ${borderColor} ${textColor}`}
    >
      <div className="flex items-center">
        <span className="text-2xl mr-3">{config.icon}</span>
        <div className="flex-1">
          <p className="font-medium">{config.message}</p>
          {status === 'processing' && (
            <p className="text-sm mt-1 opacity-75">
              This may take up to 30 seconds...
            </p>
          )}
        </div>
        {status !== 'success' && status !== 'error' && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
        )}
      </div>
    </div>
  );
}
