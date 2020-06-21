#!/bin/bash
while :
do
    git pull
    echo "React: Pulled from git"
    cd dashboard
    npm run build
    echo "React: Built react dashboard"
    cd ..
    PORT=5432 serve dashboard/build
    echo ""
    echo "React: Process exited by itself, waiting for 5s, use Ctrl + C to exit the process"
    sleep 5s
    echo "React: Restarting..."
    echo ""
done