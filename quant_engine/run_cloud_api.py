"""
run_cloud_api.py
================
Run the Brent Quant Engine Cloud API server.
"""

import sys
from pathlib import Path
import uvicorn

if __name__ == "__main__":
    sys.path.insert(0, str(Path(__file__).parent))
    print("=" * 65)
    print("  BRENT QUANT ENGINE - CLOUD API SERVER")
    print("  Listening at: http://0.0.0.0:8000")
    print("  Interactive Docs: http://localhost:8000/docs")
    print("=" * 65)
    uvicorn.run("server.api:app", host="0.0.0.0", port=8000, reload=False)
