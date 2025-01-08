import base64
import json
import requests
import os

sandbox_settings = {
    'client_id': os.getenv('Ebay_Sandbox_Client_ID'),
    'client_secret': os.getenv('Ebay_Sandbox_Client_Secret'),
}

production_settings = {
    'client_id': os.getenv('Ebay_Production_Client_ID'),
    'client_secret': os.getenv('Ebay_Production_Client_Secret'),
}

# Demo response JSON file for testing
with open('./ebay_search.json') as f:
# with open('backend/ebay_search.json') as f:
    demo_ebay_response = json.load(f)

def get_oauth_token():
    """
    Get OAuth token for eBay API
    
    Returns
    -------
    str
        The OAuth token
    """
    oauth_url_sandbox = "https://api.sandbox.ebay.com/identity/v1/oauth2/token"
    oauth_url_production = "https://api.ebay.com/identity/v1/oauth2/token"
    response = requests.post(oauth_url_production, headers={"Content-Type": "application/x-www-form-urlencoded", "Authorization": 'Basic {}'.format(base64.b64encode("{}:{}".format(production_settings.get('client_id'), production_settings.get('client_secret')).encode()).decode())}, data={"grant_type": "client_credentials", "scope": "https://api.ebay.com/oauth/api_scope"})
    if response.status_code == 200:
        access_token = response.json()["access_token"]
        return access_token
    else: 
        raise Exception(f"Error {response.status_code}: {response.text}")

def search_query(access_token, query):
    """
    Search for a query on eBay
    
    Parameters
    ----------
    access_token : str
        The OAuth token
    query : str
        The item(s) to search for
    
    Returns
    -------
    dict
        The search results
    """
    search_url_sandbox = "https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search"
    search_url_production = "https://api.ebay.com/buy/browse/v1/item_summary/search"
    response = requests.get(search_url_production, headers={"Authorization": f"Bearer {access_token}","Content-Type": "application/json","X-EBAY-C-MARKETPLACE-ID": "EBAY_UK"}, params={"q": query,"limit": 50, "offset": 0}) # Specify UK market in X-EBAY-C-MARKETPLACE-ID
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error {response.status_code}: {response.text}")
        raise Exception(f"Error {response.status_code}: {response.text}")

def search(query):
    """
    Search for a query on eBay
    
    Parameters
    ----------
    query : str
        The item(s) to search for

    Returns
    -------
    dict
        The search results
    """
    try: 
        # products = search_query(get_oauth_token(), query)['itemSummaries']
        products = demo_ebay_response['itemSummaries']
        return products
    except Exception as e : 
        return e
    
def parse_search_results(products):
    products_info = []
    for product in products:
        product_info = {}
        product_info['name'] = product['title']
        product_info['price'] = product['price']['value']
        product_info['currency'] = product['price']['currency']
        product_info['product_url'] = product['itemWebUrl']
        product_info['image_url'] = product['image']['imageUrl']
        products_info.append(product_info)
    return products_info