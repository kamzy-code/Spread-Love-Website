#!/bin/bash

CONTAINER_NAME="local-mongo"
PORT="27017"
VOLUME_NAME="mongodb_data"
# Using your specific internal path requirement:
INTERNAL_PATH="/data/spread_love" 
IMAGE="mongodb/mongodb-community-server:latest"

echo "Checking for existing MongoDB container..."

# 1. Kill and remove the container if it exists (running or stopped)
if [ "$(docker ps -aq -f name=^/${CONTAINER_NAME}$)" ]; then
    echo "Found existing container '${CONTAINER_NAME}'. Stopping and removing..."
    docker rm -f $CONTAINER_NAME >/dev/null
fi

# 2. Ensure the Docker volume exists
if ! docker volume inspect $VOLUME_NAME >/dev/null 2>&1; then
    echo "Creating Docker volume '${VOLUME_NAME}'..."
    docker volume create $VOLUME_NAME
fi

# 3. Start the container with your custom path mapping
echo "Starting a fresh MongoDB container..."
docker run \
  --name "$CONTAINER_NAME" \
  -d \
  -p "${PORT}:${PORT}" \
  -v "${VOLUME_NAME}:${INTERNAL_PATH}" \
  "$IMAGE"

# 4. Wait for MongoDB to be ready to accept connections
echo "Waiting for MongoDB to initialize..."
until docker exec "$CONTAINER_NAME" mongosh --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1; do
    sleep 1
done

echo "🎉 MongoDB is up and running on port ${PORT}!"