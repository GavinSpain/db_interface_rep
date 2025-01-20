#!/bin/bash

# Check if an argument is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <service directory>"
    exit 1
fi

# Assign the first argument to server_dir
server_dir="$1"

# Check if the source directory exists
if [ ! -d "Services/$server_dir" ]; then
    echo "Error: Directory 'Services/$server_dir' does not exist"
    exit 1
fi

# SSH key path
key_path=".ssh/AWS-KeyPair-SydneyRegion.pem"

# Check if the SSH key exists
if [ ! -f "$key_path" ]; then
    echo "Error: SSH key not found at $key_path"
    exit 1
fi

# Ensure correct permissions on SSH key
chmod 600 "$key_path"

# Remote server details
remote_host="ubuntu@ec2-13-239-33-227.ap-southeast-2.compute.amazonaws.com"
remote_path="~/services"

# Sync local directory to remote server
rsync -avz --exclude 'node_modules' --exclude '.git' \
    -e "ssh -i $key_path" \
    "Services/$server_dir/" "$remote_host:$remote_path/$server_dir/"