#!/bin/sh

echo "Starting Final Rendezvous Jenkins Build Script"
sudo git pull origin master
sudo npm install --production
sudo npm run build
echo "Final Rendezvous Build Script Finished"
exit
