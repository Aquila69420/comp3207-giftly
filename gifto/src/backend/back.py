from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import gpt_req
import image_analyzer
import products

app = Flask(__name__)
CORS(app)

@app.route('/product_text', methods=['POST'])
def product_text():
    data = request.get_json()
    input_value = data.get('inputValue', '')

    print(f"Gift text description submitted: {input_value}")

    output = gpt_req.llm_suggestion(input_value)

    # run get_products(output)
    # return the get_products output

    print(f"GPT Response: {output}")

    return jsonify({"response": output}), 200

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

        print(f"Image Analyzer Response: {response}")

        # run get_products(output)
        # return the get_products output

        return jsonify({'response': response}), 200

    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/product_types', methods=['POST'])
def product_types():
    data = request.get_json()
    occassions = [item.strip() for item in data['Occasions'].split(",")]
    recipient = data['Recipient'].strip()
    price = data['Price'].strip()
    themes = [item.strip() for item in data['Themes'].split(",")]

    input = "I want a gift for my {recipient} that matches ocassions {ocassions}, that suits the themes of {themes}."

    print(f"Gift selections submitted: {input}")

    output = gpt_req.llm_suggestion(input)

    # run get_products_with_price_limitation(output, price)
    # return the get_products output

    print(f"GPT Response: {output}")

    return jsonify({"response": output}), 200

def get_products(products):

    # call products.py
    return None

if __name__ == '__main__':
    app.run(debug=True, port=5000)
