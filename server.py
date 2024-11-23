import http.server
import socketserver
from http import HTTPStatus
import json

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(HTTPStatus.NO_CONTENT)
        self.end_headers()

    def do_GET(self):
        # Handle audio data requests
        if self.path.startswith('/api/'):
            self.send_response(HTTPStatus.OK)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            # Mock audio data response
            response = {
                'frequency': 440,
                'amplitude': 0.5,
                'waveform': 'sine'
            }
            self.wfile.write(json.dumps(response).encode())
            return

        return super().do_GET()

if __name__ == '__main__':
    PORT = 8000
    
    print(f'Starting server on port {PORT}...')
    with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nShutting down server...')
            httpd.server_close()
