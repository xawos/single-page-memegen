from flask import Flask, render_template, jsonify, request, make_response
from flask_cors import CORS, cross_origin
from flask_restful import Api, Resource
from pathlib import Path
from io import BytesIO
from PIL import Image
from random import *
import base64

app = Flask(__name__)
cors = CORS(app)

app.config['JSON_AS_ASCII'] = False
api = Api(app)

UPLOAD_FOLDER = '/mnt/glusterfs/memes'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/upload', methods=['POST','OPTIONS'])
@cross_origin()
def uploadImage():
    if request.method == 'POST':
        base64_png =  request.json['image']
        code = base64.b64decode(base64_png.split(',')[1])
        image_decoded = Image.open(BytesIO(code))
        image_decoded.save(Path(app.config['UPLOAD_FOLDER']) / request.json['name'])
        return make_response(jsonify({'result': 'success'}))
    else:
        return make_response(jsonify({'result': 'invalid method'}), 400)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3333)
