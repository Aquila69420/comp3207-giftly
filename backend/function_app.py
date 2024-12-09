import azure.functions as func
import logging
import os

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

@app.route(route="/")
def main_route(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python main_route trigger function processed a request.')

     # Get the current directory
    current_dir = os.path.dirname(os.path.realpath(__file__))
    
    # Construct the path to the HTML file
    html_file_path = os.path.join(current_dir, 'index.html')
    
    # Read the HTML file
    with open(html_file_path, 'r') as file:
        html_content = file.read()
    
    return func.HttpResponse(html_content, mimetype="text/html")