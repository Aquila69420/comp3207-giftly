# run with: func start --port 5000
# IMPORTANT: file must be called "function_app.py" and route functions must have param "req"
import azure.functions as func #type:ignore
from azure.cosmos import CosmosClient, exceptions #type:ignore 
import os, json, logging
from helper import gpt_req
from helper import image_analyzer
from helper import login_register

app = func.FunctionApp()
client = CosmosClient.from_connection_string(os.getenv("AzureCosmosDBConnectionString"))
database = client.get_database_client(os.getenv("DatabaseName"))
user_container = database.get_container_client(os.getenv("UserContainer"))
suggestion_container = database.get_container_client(os.getenv("SuggestionContainer"))


def add_cors_headers(response: func.HttpResponse) -> func.HttpResponse:
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@app.function_name(name="register")
@app.route(route='register', methods=[func.HttpMethod.POST])
def register(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    username = data['username']
    password = data['password']
    output = login_register.register_user(username, password, user_container)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
        status_code=200
    )
    return add_cors_headers(response) 

    
@app.function_name(name="login")
@app.route(route='login', methods=[func.HttpMethod.POST])
def login(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    username = data['username']
    password = data['password']
    output = login_register.login_user(username, password, user_container)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
        status_code=200
    )
    return add_cors_headers(response) 

@app.function_name(name="product_text")
@app.route(route='/product_text', methods=[func.HttpMethod.POST])
def product_text(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    prompt = data['prompt']
    username = data['username'].strip()
    output = gpt_req.llm_suggestion(prompt, suggestion_container, username)
    # run get_products(output)
    # return the get_products output
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
        status_code=200
    )
    return add_cors_headers(response)

def allowed_file(file):
        filename = file.filename
        format = '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico', 'tiff', 'mpo'}
        size = False #image must be less than 20 megabytes (MB)
        dimensions = False #must be greater than 50 x 50 pixels and less than 16,000 x 16,000 pixels

@app.function_name(name="product_img")
@app.route(route='/product_img', methods=[func.HttpMethod.POST])
def product_img(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    username = data['username']
    img_data = data['img_data']
    brands = None
    objects = None
    if 'image' not in img_data.files:
        response = func.HttpResponse(
            body=json.dumps({'error': 'no File type'}),
            mimetype="application/json",
            status_code=400
        )
        return add_cors_headers(response)
    file = img_data.files['image']
    if file.filename == '':
        response = func.HttpResponse(
            body=json.dumps({'error': 'no file selected'}),
            mimetype="application/json",
            status_code=400
        )
        return add_cors_headers(response)
    if file and allowed_file(file):
        image_binary = file.read()
        output = image_analyzer.image_analysis(image_binary)
        brands = output[0]
        objects = output[1]
        suggestion = "rec:" + ','.join(objects)
        gpt_req.update_suggestion(suggestion_container, username, suggestion)
        # run get_products(output)
        # return the get_products output
        response = func.HttpResponse(
            body=json.dumps({"response": output}),
            mimetype="application/json",
            status_code=200
        )
        return add_cors_headers(response)
    response = func.HttpResponse(
        body=json.dumps({'error': 'File type not allowed'}),
        mimetype="application/json",
        status_code=400
    )
    return add_cors_headers(response)

@app.function_name(name="product_types")
@app.route(route='/product_types', methods=[func.HttpMethod.POST])
def product_types(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    username = data['Username'].strip()
    occassions = [item.strip() for item in data['Occasions'].split(",")]
    recipient = data['Recipient'].strip()
    price = data['Price'].strip()
    themes = [item.strip() for item in data['Themes'].split(",")]
    input = f"I want a gift for my {recipient} that matches ocassions {occassions}, that suits the themes of {themes}."
    output = gpt_req.llm_suggestion(input, suggestion_container, username)
    # run get_products_with_price_limitation(output, price)
    # return the get_products output
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
        status_code=200
    )

    return add_cors_headers(response)

