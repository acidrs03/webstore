#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# build-and-push.sh — Build the Docker image and push it to Docker Hub.
#
# Usage:
#   bash scripts/build-and-push.sh <dockerhub-username> [tag]
#
# Examples:
#   bash scripts/build-and-push.sh johndoe
#   bash scripts/build-and-push.sh johndoe 1.2.0
#
# The image will be tagged as:
#   <username>/handcraft-store:<tag>    (default tag: latest)
#   <username>/handcraft-store:latest  (always added alongside a version tag)
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

DOCKERHUB_USER="${1:-}"
TAG="${2:-latest}"
IMAGE_NAME="handcraft-store"

if [ -z "$DOCKERHUB_USER" ]; then
  echo "Usage: bash scripts/build-and-push.sh <dockerhub-username> [tag]"
  echo "Example: bash scripts/build-and-push.sh johndoe 1.0.0"
  exit 1
fi

FULL_IMAGE="$DOCKERHUB_USER/$IMAGE_NAME"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTEXT_DIR="$SCRIPT_DIR/.."

echo ""
echo "▶ Building image: $FULL_IMAGE:$TAG"
docker build \
  --platform linux/amd64 \
  --tag "$FULL_IMAGE:$TAG" \
  --file "$CONTEXT_DIR/Dockerfile" \
  "$CONTEXT_DIR"

# Always tag :latest as well when pushing a versioned tag
if [ "$TAG" != "latest" ]; then
  docker tag "$FULL_IMAGE:$TAG" "$FULL_IMAGE:latest"
fi

echo "  ✓ Image built."
echo ""

echo "▶ Logging in to Docker Hub..."
docker login

echo ""
echo "▶ Pushing $FULL_IMAGE:$TAG ..."
docker push "$FULL_IMAGE:$TAG"

if [ "$TAG" != "latest" ]; then
  echo "▶ Pushing $FULL_IMAGE:latest ..."
  docker push "$FULL_IMAGE:latest"
fi

echo ""
echo "══════════════════════════════════════════════════════"
echo "  Image pushed!"
echo ""
echo "  Pull with:  docker pull $FULL_IMAGE:$TAG"
echo ""
echo "  Update docker-compose.yml image line to:"
echo "    image: $FULL_IMAGE:$TAG"
echo "══════════════════════════════════════════════════════"
echo ""
