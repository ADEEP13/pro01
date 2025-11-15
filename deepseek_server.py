#!/usr/bin/env python3
"""
Simple Flask server to proxy DeepSeek API calls and bypass CORS issues
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)

DEEPSEEK_API_KEY = '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'
DEEPSEEK_API_URL = 'https://openrouter.io/api/v1/chat/completions'

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    try:
        data = request.json
        messages = data.get('messages', [])
        
        headers = {
            'Authorization': f'Bearer {DEEPSEEK_API_KEY}',
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost',
            'X-Title': 'DeepSync'
        }
        
        payload = {
            'model': 'deepseek/deepseek-r1',
            'messages': messages,
            'temperature': 0.7,
            'max_tokens': 500
        }
        
        response = requests.post(DEEPSEEK_API_URL, json=payload, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return jsonify({
                'error': {
                    'message': response.text,
                    'status': response.status_code
                }
            }), response.status_code
        
        return jsonify(response.json()), 200
        
    except requests.exceptions.Timeout:
        return jsonify({'error': {'message': 'Request timeout - API is slow'}}), 504
    except requests.exceptions.RequestException as e:
        return jsonify({'error': {'message': str(e)}}), 500
    except Exception as e:
        return jsonify({'error': {'message': str(e)}}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    print('🚀 DeepSeek Proxy Server starting on http://localhost:3001')
    print('API Key configured:', DEEPSEEK_API_KEY[:20] + '...')
    app.run(debug=False, host='localhost', port=3001)
