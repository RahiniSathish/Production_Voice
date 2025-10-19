#!/usr/bin/env python3
"""
Wrapper script to run the agent with psutil compatibility fixes
"""
import sys
import os

# Monkey-patch psutil before importing livekit
try:
    import psutil
    original_cpu_count = psutil.cpu_count
    
    def patched_cpu_count(logical=True):
        try:
            return original_cpu_count(logical=logical)
        except SystemError:
            # Fallback for sandboxed environments
            return 4  # Default to 4 cores
    
    psutil.cpu_count = patched_cpu_count
except:
    pass

# Disable CPU monitoring to avoid psutil issues
os.environ['LIVEKIT_DISABLE_CPU_MONITOR'] = '1'

# Now import and run the agent
if __name__ == '__main__':
    # Add the project root to the path
    sys.path.insert(0, '/Users/sathishk/Documents/Production_Voice')
    
    # Import the agent module
    from agent.agent import agent
    
    # Run the agent
    import asyncio
    from livekit.agents import cli
    
    # Run CLI
    cli.run_app(agent)
