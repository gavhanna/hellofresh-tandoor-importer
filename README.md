# HelloFresh Recipe Card Importer

A web application that automatically extracts recipe information from HelloFresh recipe card images using AI vision models and imports them into your self-hosted Tandoor Recipe Manager instance.

## Features

- 📸 Upload front and back images of HelloFresh recipe cards
- 📱 Mobile camera support for easy scanning
- 🤖 AI-powered data extraction using Mistral Pixtral vision model
- ✏️ Review and edit extracted data before importing
- 📥 Automatic import to Tandoor with all recipe details
- 🎯 Extracts: title, ingredients, instructions, nutrition, cooking times, and more
- 🖼️ Beautiful, responsive web interface

## Technology Stack

- **Backend**: Node.js + Express
- **Frontend**: React + Vite + Tailwind CSS
- **Vision AI**: Mistral Pixtral 12B (free tier)
- **Image Processing**: Sharp
- **Target**: Tandoor Recipe Manager

## Prerequisites

- Node.js 18+ (for development)
- Docker & Docker Compose (for deployment)
- Tandoor Recipe Manager instance (running locally or remotely)
- Mistral API key (free tier available at [https://console.mistral.ai/](https://console.mistral.ai/))

## Quick Start (Development)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd hellofresh-importer
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
MISTRAL_API_KEY=your_mistral_api_key_here
TANDOOR_URL=http://192.168.1.100:8080
TANDOOR_API_TOKEN=your_tandoor_api_token_here
```

Start the backend:
```bash
npm run dev
```

The backend will run on [http://localhost:3001](http://localhost:3001)

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env` if needed (default should work for local development):
```env
VITE_API_URL=http://localhost:3001/api
```

Start the frontend:
```bash
npm run dev
```

The frontend will run on [http://localhost:5173](http://localhost:5173)

### 4. Access the application

Open your browser and navigate to [http://localhost:5173](http://localhost:5173)

## Quick Start (Docker)

### Using the deployment script (easiest)

```bash
./deploy.sh
```

Follow the prompts to configure and deploy the application.

### Manual Docker deployment

#### 1. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env`:
```env
MISTRAL_API_KEY=your_mistral_api_key_here
TANDOOR_URL=http://192.168.1.100:8080
TANDOOR_API_TOKEN=your_tandoor_api_token_here
```

#### 2. Build and run with Docker Compose

```bash
docker-compose up -d --build
```

The application will be available at:
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3001](http://localhost:3001)

#### 3. View logs

```bash
docker-compose logs -f
```

#### 4. Stop the application

```bash
docker-compose down
```

## Deploying on Unraid

For detailed instructions on deploying to Unraid, see [UNRAID-DEPLOYMENT.md](UNRAID-DEPLOYMENT.md).

## Configuration

### Getting a Mistral API Key

1. Go to [https://console.mistral.ai/](https://console.mistral.ai/)
2. Sign up for a free account
3. Navigate to API keys section
4. Generate a new API key
5. Copy the key to your `.env` file

### Getting a Tandoor API Token

1. Open your Tandoor instance
2. Go to Settings → API
3. Click "Generate" to create a new API token
4. Copy the token to your `.env` file

## Usage

1. **Upload Images**: Drag and drop or click to select the front and back images of your HelloFresh recipe card
2. **Extract Data**: Click "Extract Recipe Data" and wait for the AI to process the images (usually 15-30 seconds)
3. **Review**: Check the extracted recipe data and edit any fields that need correction
4. **Import**: Click "Import to Tandoor" to save the recipe to your Tandoor instance
5. **View**: Click "View in Tandoor" to see your newly imported recipe

## API Endpoints

### Backend API

- `GET /api/health` - Health check
- `GET /api/health/tandoor` - Check Tandoor connection
- `POST /api/upload` - Upload recipe card images and extract data
- `POST /api/import` - Import recipe to Tandoor
- `GET /api/upload/session/:sessionId` - Get session data

## Project Structure

```
hellofresh-importer/
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── config/            # Configuration
│   │   ├── middleware/        # Express middleware
│   │   ├── services/          # Business logic
│   │   ├── routes/            # API routes
│   │   ├── models/            # Data schemas
│   │   ├── utils/             # Utilities
│   │   └── server.js          # Entry point
│   ├── uploads/               # Temporary uploads
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API client
│   │   ├── App.jsx            # Main app
│   │   └── main.jsx           # Entry point
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
├── PROJECT_PLAN.md
└── README.md
```

## Troubleshooting

### Backend won't start

- Check that all environment variables are set correctly
- Ensure Tandoor is accessible from your machine
- Verify your Mistral API key is valid

### Frontend can't connect to backend

- Check that the backend is running on port 3001
- Verify `VITE_API_URL` in frontend/.env is correct
- Check browser console for CORS errors

### Mistral API rate limit errors

- The free tier has rate limits
- Wait a few minutes before trying again
- Consider upgrading to a paid tier if needed

### Poor OCR accuracy

- Ensure images are clear and well-lit
- Try taking photos in good lighting conditions
- Make sure the recipe card is flat and not wrinkled
- Review and edit the extracted data before importing

### Tandoor import fails

- Check that your Tandoor API token is valid
- Verify the Tandoor URL is correct
- Check Tandoor logs for errors
- Ensure your Tandoor instance is running

## Development

### Running tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Future Enhancements

- [ ] Support for Ollama (local vision models)
- [ ] Batch processing (multiple cards at once)
- [ ] Recipe history and database
- [ ] Mobile app (React Native or PWA)
- [ ] Support for other recipe card formats
- [ ] OCR confidence scoring
- [ ] Export to other formats (JSON, PDF)

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT

## Acknowledgments

- HelloFresh for the recipe cards
- [Tandoor Recipe Manager](https://docs.tandoor.dev/)
- [Mistral AI](https://mistral.ai/) for the Pixtral vision model
- [Ollama](https://ollama.com/) for local vision model support (future)

---

Made with ❤️ for HelloFresh recipe card collectors
