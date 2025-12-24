# Docker Setup Guide

## Services

This Docker Compose setup includes:

- **PostgreSQL 16.10** - Database server
- **MinIO** - Object storage for file uploads
- **MinIO Init** - Automatically creates the `uploads` bucket

## Quick Start

### 1. Start all services

```bash
docker compose up -d
```

### 2. Check services status

```bash
docker compose ps
```

### 3. View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f postgres
docker compose logs -f minio
```

## Service Details

### PostgreSQL

- **Port**: 5432
- **Database**: campuscard
- **Username**: campuscard_user
- **Password**: campuscard_password
- **Connection String**: `jdbc:postgresql://localhost:5432/campuscard`

### MinIO

- **API Port**: 9000
- **Console Port**: 9001 (Web UI)
- **Access Key**: minioadmin
- **Secret Key**: minioadmin123
- **Bucket**: uploads (auto-created)

### MinIO Console Access

Open your browser and go to: http://localhost:9001

Login credentials:

- Username: `minioadmin`
- Password: `minioadmin123`

## File Structure in MinIO

Files are organized in the `uploads` bucket with the following structure:

```
uploads/
├── 1/                          # User ID folder
│   ├── profile_photo.jpg       # Profile photo
│   └── national_id_scan.jpg    # National ID scan
├── 2/
│   ├── profile_photo.png
│   └── national_id_scan.png
└── ...
```

## API Endpoints for File Upload

### Upload Profile Photo

```bash
POST /api/profile/photo
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- file: <image file>
```

### Upload National ID Scan

```bash
POST /api/profile/national-id-scan
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- file: <image file>
```

## Testing with cURL

### Upload Profile Photo

```bash
curl -X POST http://localhost:8080/api/profile/photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/photo.jpg"
```

### Upload National ID Scan

```bash
curl -X POST http://localhost:8080/api/profile/national-id-scan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/id_scan.jpg"
```

## Docker Commands

### Stop all services

```bash
docker-compose down
```

### Stop and remove volumes (deletes all data)

```bash
docker compose down -v
```

### Restart a specific service

```bash
docker compose restart postgres
docker compose restart minio
```

### View container logs

```bash
docker compose logs -f minio
```

## Troubleshooting

### MinIO bucket not created

If the `uploads` bucket wasn't created automatically, you can create it manually:

1. Access MinIO console at http://localhost:9001
2. Login with minioadmin/minioadmin123
3. Click "Buckets" → "Create Bucket"
4. Name it "uploads" and save

Or use MinIO client (mc):

```bash
docker exec -it campuscard-minio-init mc mb myminio/uploads
```

### Connection Issues

If you can't connect to PostgreSQL or MinIO:

1. Check if services are running:

```bash
docker compose ps
```

2. Check service logs:

```bash
docker compose logs postgres
docker compose logs minio
```

3. Restart services:

```bash
docker compose restart
```

## Data Persistence

Data is stored in Docker volumes:

- `postgres_data`: PostgreSQL database files
- `minio_data`: MinIO object storage files

These volumes persist even after stopping containers. To completely remove data:

```bash
docker compose down -v
```

## Production Considerations

For production environments, you should:

1. **Change default credentials** in `docker-compose.yml`
2. **Use environment variables** instead of hardcoded values
3. **Enable HTTPS** for MinIO
4. **Set up proper backup** for both PostgreSQL and MinIO
5. **Configure resource limits** for containers
6. **Use Docker secrets** for sensitive data
