#!/bin/bash
while :
do
    git pull
    echo "Bot: Pulled from git"
    npm run build
    echo "Bot: Built typescript bot"
    npm run start
    echo ""
    echo "Bot: Process exited by itself, waiting for 5s, use Ctrl + C to exit the process"
    sleep 5s
    echo "Bot: Restarting..."
    echo ""
done