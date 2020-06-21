#!/bin/bash
bot() {
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
}

dashboard() {
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
}

bot &
dashboard &
wait