#!/bin/bash

rm -rf .parcel-cache/

$(npm bin)/parcel build src/index.html

gcloud compute scp --recurse dist metagachas-com:/home/brian --zone=asia-southeast1-b
gcloud compute ssh metagachas-com --zone=asia-southeast1-b --command="sudo rm -rf /var/www/selfies/dist"
gcloud compute ssh metagachas-com --zone=asia-southeast1-b --command="sudo cp -r dist/ /var/www/selfies"