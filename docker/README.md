# Docker Setup for Quinoa

This directory contains Docker configuration files for running the Quinoa application in containers.

## Files

- **Dockerfile**: Multi-stage Docker build configuration for the application
- **docker-compose.yml**: Orchestration file for running the app with PostgreSQL
- **.dockerignore**: Files to exclude from Docker build context
- **.env.example**: Template for environment variables

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API keys:
   ```bash
   # Required: Add your OpenAI API key
   OPENAI_API_KEY=sk-...
   
   # Required: Generate a random session secret
   SESSION_SECRET=$(openssl rand -base64 32)
   ```

3. Start the services:
   ```bash
   docker-compose up -d
   ```

4. Initialize the database:
   ```bash
   docker-compose exec app npm run db:push
   ```

5. (Optional) Seed with sample data:
   ```bash
   docker-compose exec app npx tsx server/seed.ts
   ```

6. Access the application at http://localhost:5000

## Services

### Application (app)
- **Image**: Built from parent directory using multi-stage Dockerfile
- **Port**: 5000 (configurable via `APP_PORT` in `.env`)
- **Dependencies**: PostgreSQL database
- **Health Check**: HTTP endpoint at `/api/health`

### Database (postgres)
- **Image**: PostgreSQL 16 Alpine
- **Port**: 5432 (configurable via `POSTGRES_PORT` in `.env`)
- **Volume**: `postgres_data` for persistent storage
- **Health Check**: `pg_isready` command

## Environment Variables

All environment variables are configured in the `.env` file:

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `POSTGRES_USER` | No | Database username | `nutritrackr` |
| `POSTGRES_PASSWORD` | No | Database password | `nutritrackr_password` |
| `POSTGRES_DB` | No | Database name | `nutritrackr` |
| `POSTGRES_PORT` | No | Database port (host) | `5432` |
| `APP_PORT` | No | Application port (host) | `5000` |
| `OPENAI_API_KEY` | **Yes** | OpenAI API key for AI features | - |
| `SESSION_SECRET` | **Yes** | Secret for session encryption | - |

## Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Application only
docker-compose logs -f app

# Database only
docker-compose logs -f postgres
```

### Stop Services
```bash
# Stop containers (keeps data)
docker-compose down

# Stop and remove volumes (deletes all data)
docker-compose down -v
```

### Rebuild Application
```bash
# After making code changes
docker-compose up -d --build app
```

### Database Operations
```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U nutritrackr -d nutritrackr

# Backup database
docker-compose exec postgres pg_dump -U nutritrackr nutritrackr > backup.sql

# Restore database
docker-compose exec -T postgres psql -U nutritrackr -d nutritrackr < backup.sql
```

### Execute Commands in Container
```bash
# Run any npm command
docker-compose exec app npm run <command>

# Access container shell
docker-compose exec app sh
```

## Troubleshooting

### Port Already in Use
If you get a port conflict error, change the ports in `.env`:
```env
APP_PORT=5001
POSTGRES_PORT=5433
```

### Database Connection Issues
1. Check if PostgreSQL is healthy:
   ```bash
   docker-compose ps
   ```

2. View database logs:
   ```bash
   docker-compose logs postgres
   ```

3. Verify connection string in app logs:
   ```bash
   docker-compose logs app | grep DATABASE
   ```

### Application Won't Start
1. Check build logs:
   ```bash
   docker-compose logs app
   ```

2. Rebuild from scratch:
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Reset Everything
To start fresh (⚠️ deletes all data):
```bash
docker-compose down -v
rm -rf postgres_data
docker-compose up -d
docker-compose exec app npm run db:push
```

## Production Considerations

For production deployments:

1. **Use secrets management**: Don't commit `.env` files
2. **Set strong passwords**: Generate secure random passwords
3. **Enable SSL**: Configure PostgreSQL SSL and HTTPS
4. **Resource limits**: Add memory/CPU limits to docker-compose.yml
5. **Logging**: Configure log rotation and centralized logging
6. **Backups**: Set up automated database backups
7. **Monitoring**: Add health check monitoring and alerts
8. **Updates**: Keep Docker images updated for security patches

## Architecture

The Docker setup uses:
- **Multi-stage builds**: Separate build and runtime stages for smaller images
- **Alpine Linux**: Minimal base images (~50MB vs ~1GB)
- **Non-root user**: Application runs as unprivileged user
- **Health checks**: Automatic service health monitoring
- **Named volumes**: Persistent database storage
- **Bridge network**: Isolated network for service communication
- **Signal handling**: Proper shutdown with dumb-init

## Support

For more information, see the main [README.md](../README.md) in the project root.
