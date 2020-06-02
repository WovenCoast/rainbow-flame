while :
do
    git pull
    npm run build
    npm run start
    echo ""
    echo "Process exited by itself, waiting for 5s, use Ctrl + C to exit the process"
    sleep 5s
    echo "Restarting..."
    echo ""
done