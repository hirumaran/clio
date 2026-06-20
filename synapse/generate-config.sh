#!/bin/bash
# Run this ONCE to generate the Synapse homeserver.yaml
# Usage: bash synapse/generate-config.sh

docker run --rm \
  -v "$(pwd)/synapse/data:/data" \
  -e SYNAPSE_SERVER_NAME=matrix.calliope.bsd405.org \
  -e SYNAPSE_REPORT_STATS=no \
  ghcr.io/element-hq/synapse:v1.155.0 generate

echo ""
echo "Config generated at synapse/data/homeserver.yaml"
echo "Now edit it to add your database connection and shared secret."
