# Project Overview

This project consists of a full-stack application with the following components:

## Services

### 1. Frontend (React)
- **Container Name**: `frontend-react`
- **Description**: A React-based frontend application.
- **Port**: Accessible at `http://localhost:6000/`.
- **Dockerfile**: Located at `./frontend/Dockerfile`.
- **Development**: Hot-reloading enabled via volume mounting.

### 2. Backend (PHP)
- **Container Name**: `backend-php`
- **Description**: A PHP backend application using Symfony.
- **Dockerfile**: Located at `./backend/docker/php/Dockerfile`.
- **Environment Variables**:
  - `XDEBUG_MODE`: Debugging mode (default: `off`).

### 3. Nginx
- **Container Name**: `backend-nginx`
- **Description**: Nginx server to serve the backend application.
- **Port**: Accessible at `http://localhost:5000/`.
- **Configuration**: Custom Nginx configuration at `./backend/docker/nginx/default.conf`.

### 4. Database (PostgreSQL)
- **Container Name**: `backend-database`
- **Description**: PostgreSQL database for the backend.
- **Port**: Accessible at `localhost:5432`.
- **Environment Variables**:
  - `POSTGRES_DB`: Database name (default: `backend`).
  - `POSTGRES_USER`: Database user (default: `root`).
  - `POSTGRES_PASSWORD`: Database password (default: `root`).

## How to Run

1. **Build and Start Services**:
   ```bash
   make up
   ```

2. **Access Services**:
   - Frontend: [http://localhost:6000/](http://localhost:6000/)
   - Backend: [http://localhost:5000/](http://localhost:5000/)

3. **Stop Services**:
   ```bash
   make down
   ```

## Development Notes

- **Frontend**:
  - Hot-reloading is enabled via volume mounting.
  - Modify files in `./frontend` to see changes in real-time.

- **Backend**:
  - Symfony development server is configured.
  - Modify files in `./backend` to see changes.

- **Database**:
  - Data is persisted in the `database_data` volume.
  - To reset the database, remove the volume:
    ```bash
    docker volume rm arc_database_data
    ```

## Troubleshooting

- If you encounter issues with ports, ensure no other services are running on `3000`, `5000`, or `5432`.
- Check container logs for debugging:
  ```bash
  docker-compose logs <service-name>
  ```

## File Structure

```
.
├── frontend/                # React frontend application
├── backend/                 # PHP backend application
│   ├── docker/nginx/        # Nginx configuration
│   └── docker/php/          # PHP Dockerfile
├── compose.yaml             # Docker Compose configuration
└── README.md                # Project documentation
```

fix flights creation
addd comand to run