from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
from urllib.parse import parse_qs, urlparse

class AudioVizHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for all responses
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        SimpleHTTPRequestHandler.end_headers(self)

    def do_GET(self):
        try:
            # Handle static files
            return SimpleHTTPRequestHandler.do_GET(self)
        except Exception as e:
            self.send_error_response(500, str(e))

    def do_POST(self):
        try:
            # Parse URL to get query parameters
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            
            if parsed_url.path == '/save-sample':
                # Get filename from query parameters
                filename = query_params.get('name', ['sample.wav'])[0]
                
                # Read content length and request body
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                # Ensure samples directory exists
                samples_dir = 'samples'
                if not os.path.exists(samples_dir):
                    os.makedirs(samples_dir)
                
                # Save the file
                filepath = os.path.join(samples_dir, filename)
                with open(filepath, 'wb') as f:
                    f.write(post_data)
                
                # Send success response
                self.send_json_response(200, {
                    'status': 'success',
                    'message': f'Saved {filename}'
                })
            else:
                # Handle unknown POST endpoints
                self.send_json_response(404, {
                    'status': 'error',
                    'message': 'Endpoint not found'
                })
        except Exception as e:
            self.send_error_response(500, str(e))
    
    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.end_headers()

    def send_json_response(self, code, data):
        """Send a JSON response with the given status code and data."""
        try:
            self.send_response(code)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(data).encode())
        except Exception as e:
            self.send_error_response(500, f'Error sending JSON response: {str(e)}')

    def send_error_response(self, code, message):
        """Send an error response with the given status code and message."""
        try:
            self.send_response(code)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_data = {
                'status': 'error',
                'code': code,
                'message': message
            }
            self.wfile.write(json.dumps(error_data).encode())
        except Exception as e:
            # Last resort error handling
            self.send_response(500)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(f'Critical error: {str(e)}'.encode())

def run(server_class=HTTPServer, handler_class=AudioVizHandler, port=8000):
    try:
        server_address = ('', port)
        httpd = server_class(server_address, handler_class)
        print(f'Starting server on port {port}...')
        httpd.serve_forever()
    except Exception as e:
        print(f'Error starting server: {str(e)}')
        raise

if __name__ == '__main__':
    try:
        run()
    except KeyboardInterrupt:
        print('\nShutting down server...')
    except Exception as e:
        print(f'Fatal error: {str(e)}')
