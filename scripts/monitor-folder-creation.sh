#!/bin/bash

# AccessLink Folder Creation Monitor
# Monitors for unwanted folder creation and alerts immediately

WATCH_DIR="/workspaces/AccessLink-LGBTQ"
LOG_FILE="$WATCH_DIR/docs/folder-creation.log"

echo "🔍 Starting AccessLink folder monitor..."
echo "Watching directory: $WATCH_DIR"
echo "Log file: $LOG_FILE"

# Create log file if it doesn't exist
touch "$LOG_FILE"

# Function to handle folder creation events
handle_creation() {
    local path="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Check if it's an AccessLink-related folder
    if [[ "$path" =~ (AccessLink|access-link|accesslink) ]]; then
        echo "🚨 ALERT: Suspicious folder detected!"
        echo "Path: $path"
        echo "Time: $timestamp"
        
        # Log the incident
        echo "[$timestamp] SUSPICIOUS FOLDER CREATED: $path" >> "$LOG_FILE"
        
        # Get file details
        if [ -d "$path" ]; then
            echo "Folder details:"
            stat "$path" 2>/dev/null || echo "Could not stat folder"
            
            # Check contents
            echo "Contents:"
            ls -la "$path" 2>/dev/null || echo "Could not list contents"
            
            # Log to file
            echo "[$timestamp] Folder details:" >> "$LOG_FILE"
            stat "$path" >> "$LOG_FILE" 2>&1
            echo "[$timestamp] Contents:" >> "$LOG_FILE"
            ls -la "$path" >> "$LOG_FILE" 2>&1
        fi
        
        # Show recent commands from history
        echo "Recent terminal commands:"
        history | tail -5
        
        echo ""
        echo "🛑 RECOMMENDATION: Stop current work and investigate!"
        echo "To remove: rm -rf \"$path\""
        echo "To continue monitoring: Press Ctrl+C to stop this monitor"
        
        # Optional: Auto-remove (uncomment if desired)
        # echo "Auto-removing suspicious folder..."
        # rm -rf "$path"
        # echo "Folder removed automatically"
    fi
}

# Use inotifywait to monitor folder creation
if command -v inotifywait >/dev/null 2>&1; then
    echo "Using inotifywait for real-time monitoring..."
    inotifywait -m -r "$WATCH_DIR" -e create --format '%w%f' 2>/dev/null | while read path; do
        handle_creation "$path"
    done
else
    echo "inotifywait not available, using periodic check..."
    while true; do
        # Check for AccessLink folders every 5 seconds
        find "$WATCH_DIR" -maxdepth 1 -name "*AccessLink*" -type d 2>/dev/null | while read path; do
            if [ -n "$path" ]; then
                handle_creation "$path"
            fi
        done
        sleep 5
    done
fi
