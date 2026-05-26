# .claude/hooks/notify.sh
#!/bin/bash
sleep 10
osascript -e 'display notification "Claude 가 응답을 기다리고 있어요" with title "Claude Code" sound name "Ping"'