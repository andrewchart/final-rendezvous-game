#!/bin/sh

echo "Starting Final Rendezvous Jenkins Build Script"
git pull origin master
npm install --production
npm run build
pm2 restart all
echo "Final Rendezvous Build Script Finished"
exit
