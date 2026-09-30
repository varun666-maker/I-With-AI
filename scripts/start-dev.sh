#!/bin/bash
# Start the Next.js dev server fully detached so it survives the parent shell.
# Uses double-fork technique: parent exits immediately, child runs in its own
# session via setsid, grandchild is the actual dev server.

cd /home/z/my-project

# Kill any existing dev server on port 3000
pkill -f "next dev" 2>/dev/null
sleep 1

# Start the dev server in a new session, fully detached
setsid bash -c './node_modules/.bin/next dev -p 3000 > /tmp/dev-persistent.log 2>&1' &
# Don't wait — exit immediately so the parent shell closes and the child
# gets reparented to PID 1 (init), which keeps it alive.
exit 0
