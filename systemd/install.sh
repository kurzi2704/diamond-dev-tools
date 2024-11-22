
echo "" > /usr/bin/dmd-dev-tools-watchdog.sh
echo "#!/bin/bash" >> /usr/bin/dmd-dev-tools-watchdog.sh
echo "cd /path/to/your/project && npm run your-script >> /path/to/output.txt" >> /usr/bin/dmd-dev-tools-watchdog.sh
chmod +x /usr/bin/dmd-dev-tools-watchdog.sh