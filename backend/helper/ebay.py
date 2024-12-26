import base64
import json
import requests

with open('backend\\local.settings.json', 'r') as file:
    settings = json.load(file)

sandbox_settings = {
    'client_id': settings.get('Values').get('Ebay_Sandbox_Client_ID'),
    'client_secret': settings.get('Values').get('Ebay_Sandbox_Client_Secret'),
}

production_settings = {
    'client_id': settings.get('Values').get('Ebay_Production_Client_ID'),
    'client_secret': settings.get('Values').get('Ebay_Production_Client_Secret'),
}

def get_oauth_token():
    """
    Get OAuth token for eBay API
    return: str, the OAuth token
    """
    oauth_url_sandbox = "https://api.sandbox.ebay.com/identity/v1/oauth2/token"
    oauth_url_production = "https://api.ebay.com/identity/v1/oauth2/token"
    response = requests.post(oauth_url_production, headers={"Content-Type": "application/x-www-form-urlencoded", "Authorization": 'Basic {}'.format(base64.b64encode("{}:{}".format(production_settings.get('client_id'), production_settings.get('client_secret')).encode()).decode())}, data={"grant_type": "client_credentials", "scope": "https://api.ebay.com/oauth/api_scope"})
    if response.status_code == 200:
        access_token = response.json()["access_token"]
        return access_token
    else: 
        raise Exception(f"Error {response.status_code}: {response.text}")

def search_item(access_token, item):
    """
    Search for an item on eBay
    param access_token: str, the OAuth token
    param item: str, the item to search for
    return: list of 5 dictionaries, each containing the details of a product
    """
    search_url_sandbox = "https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search"
    search_url_production = "https://api.ebay.com/buy/browse/v1/item_summary/search"
    response = requests.get(search_url_production, headers={"Authorization": f"Bearer {access_token}","Content-Type": "application/json","X-EBAY-C-MARKETPLACE-ID": "EBAY_UK"}, params={"q": item,"limit": 5, "offset": 0}) # Specify UK market in X-EBAY-C-MARKETPLACE-ID
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error {response.status_code}: {response.text}")
        raise Exception(f"Error {response.status_code}: {response.text}")

def search(item):
    """
    Search for an item on eBay
    param item: str, the item to search for
    return: list of 5 dictionaries, each containing the details of a product
    """
    try: 
        products = search_item(get_oauth_token(), item)['itemSummaries']
        return products
    except Exception as e : 
        return e

# Demo response JSON file for testing
# with open('backend\\ebay_search.json') as f:
#     demo_ebay_response = json.load(f)