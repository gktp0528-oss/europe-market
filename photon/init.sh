#!/bin/bash

# Directory for data
DATA_DIR="./photon_data"
mkdir -p $DATA_DIR

# 1. Download Europe Data (Note: This is large ~60GB uncompressed, lighter in PBF)
# Using Geofabrik's latest Europe PBF.
# For testing purpose, you might want to switch to a smaller country like 'hungary-latest.osm.pbf' first.
PBF_FILE="europe-latest.osm.pbf"
URL="https://download.geofabrik.de/$PBF_FILE"

echo "Downloading Europe data from $URL..."
echo "WARNING: This assumes you have enough disk space!"
curl -L $URL -o "$DATA_DIR/europe-latest.osm.pbf"

if [ -f "$DATA_DIR/europe-latest.osm.pbf" ]; then
    echo "Download complete."
else
    echo "Download failed."
    exit 1
fi

# 2. Import Data into Photon
echo "Starting data import. This can take several hours depending on hardware..."
docker run -it --rm \
  -v $(pwd)/photon_data:/photon/photon_data \
  komoot/photon \
  -nominatim-import /photon/photon_data/europe-latest.osm.pbf

echo "Import finished. Starting Photon service..."
docker-compose up -d

echo "Photon is running at http://localhost:2322"
