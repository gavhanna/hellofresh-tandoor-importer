# Quick Start Guide for Unraid

This is a simplified guide to get HelloFresh Importer running on Unraid as quickly as possible.

## Prerequisites

- Tandoor Recipe Manager already running on Unraid
- Either:
  - Mistral API key ([get one free here](https://console.mistral.ai/)) for cloud AI
  - OR Ollama running locally or in a Docker container on Unraid for local AI

## Step-by-Step Instructions

### 1. Copy Project to Unraid

Transfer this entire project folder to your Unraid server. Suggested location:
```
/mnt/user/appdata/hellofresh-importer/
```

You can use:
- SMB/Network share
- WinSCP or FileZilla
- `git clone` directly on Unraid terminal

### 2. Configure Environment Variables

SSH into your Unraid server and run:

```bash
cd /mnt/user/appdata/hellofresh-importer
cp .env.example .env
nano .env
```

Update these values:
```env
# Choose one AI provider (Mistral cloud or Ollama local):
MISTRAL_API_KEY=sk-xxxxxxxxxxxxxxxxx    # Your Mistral API key
# OR
OLLAMA_BASE_URL=http://192.168.1.50:11434  # Your Ollama URL (if using Ollama)
OLLAMA_MODEL=qwen3-vl:4b                # Ollama model name

# Required:
TANDOOR_URL=http://192.168.1.100:8080  # Your Tandoor URL
TANDOOR_API_TOKEN=Token_xxxxxxxxxxxxxx # Your Tandoor API token

# Optional: Change ports if needed (defaults shown)
BACKEND_PORT=3001
FRONTEND_PORT=5173
```

**Note:** If using Ollama in Docker on Unraid, you can use `http://172.17.0.1:11434` or the container name as the URL.

**How to get Tandoor API token:**
1. Open Tandoor web UI
2. Settings (gear icon) → API
3. Click "Generate Token" or copy existing

Save and exit (Ctrl+X, then Y, then Enter)

### 3. Deploy with Docker Compose

Still in SSH:

```bash
cd /mnt/user/appdata/hellofresh-importer
docker-compose up -d --build
```

Wait 2-5 minutes for the build to complete.

### 4. Access the App

Open your browser and go to:
```
http://YOUR-UNRAID-IP:5173
```

For example: `http://192.168.1.50:5173`

## That's It!

You should now see the HelloFresh Importer interface. Try uploading a recipe card!

## Using on Mobile

1. Make sure your phone is on the same WiFi network
2. Open browser on phone
3. Go to `http://YOUR-UNRAID-IP:5173`
4. Tap the upload areas to use your camera

## Troubleshooting

### "Can't connect" or blank page
```bash
# Check if containers are running
docker ps | grep hellofresh

# View logs
docker logs hellofresh-backend
docker logs hellofresh-frontend
```

### Images won't upload
```bash
# Fix permissions
chmod -R 777 /mnt/user/appdata/hellofresh-importer/backend/uploads
```

### Can't import to Tandoor
- Check your Tandoor URL is correct and accessible
- Verify your API token is valid (try generating a new one)
- Make sure Tandoor container is running

### Need to restart
```bash
cd /mnt/user/appdata/hellofresh-importer
docker-compose restart
```

### Need to update/rebuild
```bash
cd /mnt/user/appdata/hellofresh-importer
docker-compose down
docker-compose up -d --build
```

## Using the Deployment Script (Optional)

For easier management, you can use the included script:

```bash
cd /mnt/user/appdata/hellofresh-importer
./deploy.sh
```

This gives you a menu for:
- Starting containers
- Stopping containers
- Viewing logs
- Checking status
- Rebuilding

## Advanced: Using Docker Compose Manager

If you have the Docker Compose Manager plugin:

1. Install "Compose Manager" from Community Applications
2. Open Compose Manager in Unraid UI
3. Add New Stack → name it `hellofresh-importer`
4. Point to: `/mnt/user/appdata/hellofresh-importer/docker-compose.yml`
5. Click "Compose Up"

This gives you a nice UI to manage the containers.

## Port Reference

- **5173** - Frontend web interface
- **3001** - Backend API (you don't need to access this directly)

If these ports conflict with other containers, edit `docker-compose.yml` and change the port mappings.

## Need More Help?

See the detailed [UNRAID-DEPLOYMENT.md](UNRAID-DEPLOYMENT.md) guide.
