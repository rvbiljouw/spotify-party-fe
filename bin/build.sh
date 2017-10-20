#!/bin/bash
set -x;

ENV_FILE=$1

PROJECT="panel"
VERSION="1.1.0-SNAPSHOT"

if [ -n "$ENV_FILE" ]; then
    source $ENV_FILE
fi

cd ..

npm run build:prod

if [ $? -ne 0 ]; then
    echo "Angular packaging failed"
    exit 253
fi

cd docker

mkdir ./tmp

cp -r ../dist/* ./tmp

docker build -t "${GCP_REGISTRY}/${GCP_PROJECT_ID}/${PROJECT}:${VERSION}" \
    --build-arg project=${PROJECT} \
    --build-arg version=${VERSION} .

docker push "${GCP_REGISTRY}/${GCP_PROJECT_ID}/${PROJECT}:${VERSION}"

rm -rf ./tmp

set +x;
