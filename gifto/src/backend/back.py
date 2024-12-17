from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import gpt_req
import image_analyzer

app = Flask(__name__)
CORS(app)

@app.route('/product_text', methods=['POST'])
def product_text():
    data = request.get_json()
    input_value = data.get('inputValue', '')

    print(f"Gift text description submitted: {input_value}")

    output = gpt_req.llm_suggestion(input_value)

    print(f"GPT Response: {output}")

    return jsonify({"message": "Input received!", "input": output})

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route('/product_img', methods=['POST'])
def product_img():

    brands = None
    objects = None

    def allowed_file(file):
        filename = file.filename
        format = '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico', 'tiff', 'mpo'}
        size = False #image must be less than 20 megabytes (MB)
        dimensions = False #must be greater than 50 x 50 pixels and less than 16,000 x 16,000 pixels

    if 'image' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file):
        image_binary = file.read()
        response = image_analyzer.image_analysis(image_binary)
        brands = response[0]
        objects = response[1]

        return jsonify({'message': response}), 200

    return jsonify({'error': 'File type not allowed'}), 400


def get_products(products):

    # call products.py
    return None


if __name__ == '__main__':
    app.run(debug=True, port=5000)
