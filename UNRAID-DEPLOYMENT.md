# Deploying HelloFresh Importer on Unraid

This guide will help you deploy the HelloFresh Recipe Importer on your Unraid server.

## Prerequisites

- Unraid 6.9+ with Docker support
- Docker Compose Manager plugin (recommended) OR manual docker container setup
- Tandoor Recipe Manager running on Unraid
- Either:
  - Mistral API key (free tier available at https://console.mistral.ai/) for cloud AI
  - OR Ollama running locally or in a Docker container for local AI

## Method 1: Using Docker Compose Manager (Recommended)

### Step 1: Install Docker Compose Manager

1. Go to **Apps** tab in Unraid
2. Search for "Compose Manager" or "Docker Compose Manager"
3. Install the plugin

### Step 2: Prepare the Project

1. Copy this entire project folder to your Unraid server (e.g., `/mnt/user/appdata/hellofresh-importer/`)
2. Navigate to the project directory via SSH or Unraid terminal

### Step 3: Configure Environment Variables

1. Copy the `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your values:
   ```bash
   nano .env
   ```

   Required values:
   - Choose ONE AI provider:
     - `MISTRAL_API_KEY` - Your Mistral AI API key (for cloud AI)
     - OR `OLLAMA_BASE_URL` - Your Ollama URL (e.g., `http://172.17.0.1:11434`) for local AI
     - AND `OLLAMA_MODEL` - Model name (default: `qwen3-vl:4b`)
   - `TANDOOR_URL` - URL to your Tandoor instance (e.g., `http://192.168.1.100:8080`)
   - `TANDOOR_API_TOKEN` - Your Tandoor API token (get from Tandoor Settings > API)

### Step 4: Deploy with Docker Compose

1. Open **Docker Compose Manager** in Unraid
2. Click **Add New Stack**
3. Give it a name: `hellofresh-importer`
4. Set the compose file path to: `/mnt/user/appdata/hellofresh-importer/docker-compose.yml`
5. Click **Compose Up**

### Step 5: Access the Application

Once deployed, access the app at:
- **Frontend**: `http://your-unraid-ip:5173`
- **Backend API**: `http://your-unraid-ip:3001`

## Method 2: Manual Docker Container Setup

If you prefer not to use Docker Compose Manager, you can create individual containers:

### Backend Container

1. Go to **Docker** tab
2. Click **Add Container**
3. Configure:
   - **Name**: `hellofresh-backend`
   - **Repository**: Build from Dockerfile (see build instructions below)
   - **Network Type**: `bridge`
   - **Port Mapping**: `3001:3001`
   - **Environment Variables**:
     - Choose ONE AI provider:
       - `MISTRAL_API_KEY=your_key_here` (for Mistral cloud)
       - OR `OLLAMA_BASE_URL=http://172.17.0.1:11434` and `OLLAMA_MODEL=qwen3-vl:4b` (for Ollama local)
     - `TANDOOR_URL=http://192.168.1.100:8080`
     - `TANDOOR_API_TOKEN=your_token_here`
     - `NODE_ENV=production`
     - `PORT=3001`
   - **Path Mapping**:
     - Container Path: `/app/uploads`
     - Host Path: `/mnt/user/appdata/hellofresh-importer/uploads`

### Frontend Container

1. Go to **Docker** tab
2. Click **Add Container**
3. Configure:
   - **Name**: `hellofresh-frontend`
   - **Repository**: Build from Dockerfile (see build instructions below)
   - **Network Type**: `bridge`
   - **Port Mapping**: `5173:80`

## Building Docker Images

If you need to build the images manually:

### Build Backend Image
```bash
cd /mnt/user/appdata/hellofresh-importer
docker build -t hellofresh-backend:latest ./backend
```

### Build Frontend Image
```bash
cd /mnt/user/appdata/hellofresh-importer
docker build -t hellofresh-frontend:latest ./frontend
```

## Updating the Application

### With Docker Compose Manager:
1. Pull latest code changes
2. In Docker Compose Manager, select your stack
3. Click **Compose Down**
4. Click **Compose Up --build** (this rebuilds the images)

### Manual Method:
1. Rebuild the images using the build commands above
2. Stop the old containers
3. Remove the old containers
4. Start new containers with the updated images

## Troubleshooting

### Cannot Connect to Backend
- Ensure both containers are on the same Docker network
- Check that port 3001 is not in use by another application
- Verify the backend container logs: `docker logs hellofresh-backend`

### Images Not Uploading
- Check the uploads directory has correct permissions: `chmod -R 777 /mnt/user/appdata/hellofresh-importer/uploads`
- Verify the volume mapping in your container configuration

### Cannot Import to Tandoor
- Verify your Tandoor URL is accessible from the backend container
- Test: `docker exec hellofresh-backend wget -O- http://your-tandoor-url/api/`
- Ensure your Tandoor API token is valid

### Mobile Camera Not Working
- Ensure you're accessing via HTTPS or localhost (browsers require secure context for camera)
- Check browser permissions for camera access

## Network Configuration

For better mobile access, you may want to:

1. Set up a reverse proxy (e.g., SWAG, Nginx Proxy Manager)
2. Use HTTPS for secure camera access
3. Set a custom domain/subdomain

Example Nginx Proxy Manager configuration:
```nginx
location / {
    proxy_pass http://your-unraid-ip:5173;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Getting Your Tandoor API Token

1. Log into Tandoor Recipe Manager
2. Go to **Settings** (gear icon)
3. Click on **API**
4. Click **Generate Token** or copy existing token
5. Copy the token to your `.env` file

## Getting a Mistral API Key

1. Go to https://console.mistral.ai/
2. Sign up for a free account
3. Navigate to **API Keys**
4. Create a new API key
5. Copy the key to your `.env` file

**Note**: The free tier of Mistral should be sufficient for personal use.

## Performance Tips

- The backend processes images which can be CPU intensive
- Consider limiting concurrent uploads if your server is under heavy load
- The uploads directory will grow over time - set up periodic cleanup if needed

## Support

For issues or questions:
- Check the application logs: `docker logs hellofresh-backend` or `docker logs hellofresh-frontend`
- Review the main README.md for application usage
- Check Unraid forums for Docker-specific issues
