# HelloFresh Recipe Card to Tandoor Importer

## Project Overview

A web application that automatically extracts recipe information from HelloFresh recipe card images using AI vision models and imports them into your self-hosted Tandoor Recipe Manager instance.

---

## Goals

- Upload front and back images of HelloFresh recipe cards
- Extract all recipe data using AI vision (OCR + structured data extraction)
- Preview and edit extracted data before import
- Automatically import recipes into Tandoor with images, ingredients, instructions, and nutrition data
- Keep all processing local except for the vision API calls

---

## Technology Stack

### Frontend
- **Framework**: React with Vite
- **Styling**: Tailwind CSS
- **Image Upload**: react-dropzone
- **HTTP Client**: Axios
- **UI Components**: Headless UI or shadcn/ui

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Image Processing**: Sharp (resize, enhance, format conversion)
- **Vision Model**: Mistral Pixtral 12B (free tier API)
- **Tandoor Integration**: Axios
- **File Upload**: Multer
- **Environment Config**: dotenv
- **Validation**: Zod

### Infrastructure
- **Deployment**: Docker containers
- **Reverse Proxy**: Nginx (optional)
- **Storage**: Local filesystem for temporary images

---

## Architecture

```
┌─────────────────┐
│   Web Browser   │
│  (Upload Cards) │
└────────┬────────┘
         │ POST /upload (multipart/form-data)
         ▼
┌─────────────────────────────┐
│   Node.js Backend (Express) │
│                             │
│  1. Receive images          │
│  2. Preprocess with Sharp   │
│  3. Send to Mistral Pixtral │◄─────┐
│  4. Parse JSON response     │      │
│  5. Return to user          │      │
│  6. On confirm: POST to     │      │
│     Tandoor API             │      │
└────┬───────────────┬────────┘      │
     │               │                │
     │               │           ┌────┴──────────┐
     │               │           │  Mistral AI   │
     │               │           │  Pixtral 12B  │
     │               │           │  (Free Tier)  │
     │               │           └───────────────┘
     ▼               ▼
┌──────────────┐  ┌──────────────┐
│   Tandoor    │  │ User Preview │
│   API        │  │ & Editing    │
│  (Unraid)    │  │              │
└──────────────┘  └──────────────┘
```

---

## Data Flow

1. **User uploads** front + back card images via web UI
2. **Backend receives** images and stores temporarily
3. **Image preprocessing** (orientation correction, contrast enhancement, compression)
4. **Images sent to Mistral Pixtral** with structured prompt requesting JSON output
5. **AI extracts:**
   - Recipe title
   - Cooking time (prep + cook)
   - Servings
   - Difficulty level
   - Ingredients list with quantities and units
   - Step-by-step instructions
   - Nutrition information (calories, protein, carbs, fat, etc.)
   - Dietary tags (vegetarian, spicy, etc.)
   - Recipe card images (for storage)
6. **Backend returns** extracted JSON to frontend
7. **User reviews** data in preview interface
8. **User edits** any incorrect fields (optional)
9. **User confirms** import
10. **Backend formats** data for Tandoor API schema
11. **POST to** `/api/recipe/` endpoint with Bearer token
12. **Upload images** to Tandoor (if supported)
13. **Return success** confirmation to user
14. **Cleanup** temporary files

---

## Project Structure

```
hellofresh-importer/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js                 # Environment variables
│   │   ├── middleware/
│   │   │   ├── upload.js              # Multer configuration
│   │   │   ├── errorHandler.js        # Global error handling
│   │   │   └── validateRequest.js     # Request validation
│   │   ├── services/
│   │   │   ├── imageProcessor.js      # Sharp image preprocessing
│   │   │   ├── mistralService.js      # Mistral API integration
│   │   │   ├── dataExtractor.js       # Parse Mistral response
│   │   │   └── tandoorClient.js       # Tandoor API client
│   │   ├── routes/
│   │   │   ├── upload.js              # POST /api/upload
│   │   │   ├── import.js              # POST /api/import
│   │   │   └── health.js              # GET /api/health
│   │   ├── models/
│   │   │   └── recipe.schema.js       # Zod schemas for validation
│   │   ├── utils/
│   │   │   ├── logger.js              # Winston or Pino
│   │   │   └── tempFiles.js           # Temp file management
│   │   └── server.js                  # Express app entry point
│   ├── uploads/                       # Temporary upload directory
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUploader.jsx      # Drag-drop upload
│   │   │   ├── RecipePreview.jsx      # Display extracted data
│   │   │   ├── EditableField.jsx      # Inline editing
│   │   │   ├── ProcessingStatus.jsx   # Loading states
│   │   │   └── ImportButton.jsx       # Confirm import
│   │   ├── services/
│   │   │   └── api.js                 # Axios API client
│   │   ├── hooks/
│   │   │   └── useRecipeImport.js     # Custom hook for workflow
│   │   ├── utils/
│   │   │   └── formatters.js          # Data formatting helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── PROJECT_PLAN.md (this file)
```

---

## API Endpoints

### Backend API

#### `POST /api/upload`
- **Description**: Upload recipe card images and extract data
- **Request**: `multipart/form-data`
  - `frontImage`: File (required)
  - `backImage`: File (required)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "title": "Creamy Tuscan Chicken",
      "servings": 2,
      "prepTime": 10,
      "cookTime": 25,
      "totalTime": 35,
      "difficulty": "easy",
      "ingredients": [
        {
          "name": "chicken breast",
          "amount": "2",
          "unit": "pieces"
        }
      ],
      "instructions": [
        {
          "step": 1,
          "text": "Preheat oven to 400°F..."
        }
      ],
      "nutrition": {
        "calories": 680,
        "protein": "45g",
        "carbs": "52g",
        "fat": "28g"
      },
      "tags": ["italian", "chicken"],
      "images": {
        "front": "/uploads/front-123.jpg",
        "back": "/uploads/back-123.jpg"
      }
    },
    "sessionId": "uuid-here"
  }
  ```

#### `POST /api/import`
- **Description**: Import recipe to Tandoor
- **Request**:
  ```json
  {
    "sessionId": "uuid-here",
    "recipeData": { /* edited recipe data */ }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "tandoorRecipeId": 123,
    "url": "http://your-tandoor/view/recipe/123"
  }
  ```

#### `GET /api/health`
- **Description**: Health check
- **Response**: `{ "status": "ok" }`

---

## Tandoor API Integration

### Authentication
- **Method**: Bearer Token
- **Header**: `Authorization: Bearer <API_TOKEN>`
- **Token Source**: Generated in Tandoor Settings > API

### Create Recipe Endpoint
- **URL**: `POST http://your-tandoor-instance/api/recipe/`
- **Headers**:
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Body** (example):
  ```json
  {
    "name": "Creamy Tuscan Chicken",
    "description": "A delicious Italian-inspired chicken dish",
    "servings": 2,
    "working_time": 10,
    "waiting_time": 25,
    "steps": [
      {
        "instruction": "Preheat oven to 400°F...",
        "order": 1
      }
    ],
    "keywords": [
      {"name": "Italian"},
      {"name": "Chicken"}
    ]
  }
  ```

**Note**: The exact schema needs to be verified against your Tandoor instance's API documentation at `http://your-tandoor-instance/docs/api/`

---

## Mistral Pixtral Integration

### API Details
- **Endpoint**: `https://api.mistral.ai/v1/chat/completions`
- **Model**: `pixtral-12b-2409`
- **Authentication**: API Key (free tier)
- **Rate Limits**: TBD (check free tier limits)

### Prompt Strategy

```javascript
const prompt = `Analyze these HelloFresh recipe card images (front and back) and extract ALL recipe information into structured JSON.

Return ONLY valid JSON in this exact format:
{
  "title": "Recipe name",
  "servings": 2,
  "prepTime": 10,
  "cookTime": 25,
  "totalTime": 35,
  "difficulty": "easy|medium|hard",
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": "quantity",
      "unit": "unit of measurement"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "text": "Full instruction text"
    }
  ],
  "nutrition": {
    "calories": 680,
    "protein": "45g",
    "carbohydrates": "52g",
    "fat": "28g",
    "saturatedFat": "12g",
    "sugar": "8g",
    "fiber": "4g",
    "sodium": "850mg"
  },
  "tags": ["tag1", "tag2"],
  "description": "Brief description if available"
}

Extract ALL visible information. Be precise with measurements and quantities.`;
```

---

## Implementation Phases

### Phase 1: MVP - Core Functionality (Week 1)
- [ ] Set up Node.js backend with Express
- [ ] Set up React frontend with Vite
- [ ] Implement image upload endpoint with Multer
- [ ] Integrate Mistral Pixtral API
- [ ] Basic data extraction and parsing
- [ ] Simple preview UI
- [ ] Test Tandoor API integration (manual testing)

### Phase 2: Full Integration (Week 2)
- [ ] Complete Tandoor API client
- [ ] Implement recipe import workflow
- [ ] Add image preprocessing (Sharp)
- [ ] Error handling and validation
- [ ] Loading states and user feedback
- [ ] Edit functionality for extracted data

### Phase 3: Polish & Deploy (Week 3)
- [ ] Dockerize backend and frontend
- [ ] Create docker-compose for easy deployment
- [ ] Add comprehensive error messages
- [ ] Improve UI/UX
- [ ] Add batch processing (multiple cards)
- [ ] Add success/failure notifications
- [ ] Documentation and README

### Phase 4: Optional Enhancements (Future)
- [ ] Support for Ollama (local vision models)
- [ ] Recipe history/database
- [ ] Export to other formats (JSON, PDF)
- [ ] Mobile-friendly UI
- [ ] OCR confidence scoring
- [ ] Manual OCR correction tools
- [ ] Support for other recipe card formats

---

## Configuration Requirements

### Environment Variables

#### Backend `.env`
```bash
# Server
PORT=3001
NODE_ENV=development

# Mistral AI
MISTRAL_API_KEY=your_mistral_api_key_here

# Tandoor
TANDOOR_URL=http://192.168.1.100:8080
TANDOOR_API_TOKEN=your_tandoor_api_token_here

# Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=./uploads
```

#### Frontend `.env`
```bash
VITE_API_URL=http://localhost:3001/api
```

---

## Hardware Considerations

### RTX 2060 6GB
Your RTX 2060 with 6GB VRAM is **not sufficient** for running Llama 3.2 Vision 11B (requires 8GB+), but could run:
- **LLaVA 7B** (with quantization, ~5GB VRAM) - *Moderate OCR accuracy*
- **Smaller 3B models** - *Lower accuracy*

**Decision**: Use **Mistral Pixtral (free tier)** for better accuracy and reliability. Ollama support can be added later as an optional feature.

---

## Estimated Effort

- **MVP**: 8-12 hours
- **Full Featured**: 20-30 hours
- **Polish & Deploy**: 10-15 hours
- **Total**: ~40-50 hours

---

## Success Metrics

- Extract recipe data with >90% accuracy
- Process a recipe card in <30 seconds
- Successfully import to Tandoor with all fields populated
- Handle 10+ cards in a batch without errors

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Mistral API rate limits | High | Implement retry logic, queue system, or add Ollama fallback |
| OCR accuracy issues | Medium | Add manual edit interface, test with multiple cards |
| Tandoor API changes | Medium | Version lock, test against specific Tandoor version |
| Image quality varies | Medium | Add preprocessing, allow manual OCR retry |
| HelloFresh card format changes | Low | Make prompts flexible, allow template customization |

---

## Testing Strategy

1. **Unit Tests**: Service functions (image processing, data parsing)
2. **Integration Tests**: API endpoints, Tandoor client
3. **Manual Testing**:
   - Test with 10+ different HelloFresh cards
   - Test with various image qualities (photo, scan, poor lighting)
   - Test Tandoor import with real instance
4. **Error Cases**:
   - Missing/corrupted images
   - API failures
   - Invalid data formats
   - Network issues

---

## Future Enhancements

- **Multi-language support** (if HelloFresh cards are in different languages)
- **Recipe editing** after import (update Tandoor recipe)
- **Duplicate detection** (check if recipe already exists)
- **Ingredient mapping** (standardize ingredient names)
- **Shopping list integration** (if Tandoor supports it)
- **Mobile app** (React Native or PWA)
- **OCR training** (fine-tune model on HelloFresh cards specifically)
- **Alternative vision providers** (Google Cloud Vision, Azure Computer Vision)

---

## Getting Started

### Prerequisites
- Node.js 18+
- Docker (optional, for deployment)
- Tandoor instance running (with API token)
- Mistral API key (free tier)

### Quick Start
```bash
# Clone repository
git clone <repo-url>
cd hellofresh-importer

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173` and start uploading recipe cards!

---

## Resources

- [Tandoor API Documentation](https://docs.tandoor.dev/)
- [Mistral AI Documentation](https://docs.mistral.ai/)
- [Mistral Pixtral Vision](https://docs.mistral.ai/capabilities/vision)
- [Ollama Vision Models](https://ollama.com/blog/vision-models)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)

---

## License

MIT

---

## Contributing

This is a personal project, but suggestions and improvements are welcome!

---

**Last Updated**: 2025-10-21
