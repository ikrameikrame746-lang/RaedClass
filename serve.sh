#!/bin/sh
cd "$(dirname "$0")"
echo "RaedClass: http://localhost:8000   Admin: http://localhost:8000/admin/"
python3 -m http.server 8000
