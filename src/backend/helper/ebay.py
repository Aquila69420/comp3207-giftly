import base64
import requests

# Returning: {'message': 'Unauthorized'}

def getting_auth():
    oauth_url_sandbox = "https://api.sandbox.ebay.com/identity/v1/oauth2/token"
    oauth_url_production = "https://api.ebay.com/identity/v1/oauth2/token"
    response = requests.post(oauth_url_sandbox, headers={"Content-Type": "application/x-www-form-urlencoded", "Authorization": f'Basic {base64.b64encode("DhruvKha-Giftly-SBX-999edef9a-bf74745e:SBX-99edef9a0d08-a15b-4448-9c5c-13cb".encode()).decode()}'}, data={"grant_type": "client_credentials", "scope": "https://api.ebay.com/oauth/api_scope"})
    if response.status_code == 200:
        access_token = response.json()["access_token"]
        return access_token
    else: raise Exception(f"Error {response.status_code}: {response.text}")

def searching_item(access_token, item):
    search_url_sandbox = "https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search"
    search_url_production = "https://api.ebay.com/buy/browse/v1/item_summary/search"
    response = requests.get(search_url_sandbox, headers={"Authorization": f"Bearer {access_token}","Content-Type": "application/json","X-EBAY-C-MARKETPLACE-ID": "EBAY_UK"}, params={"q": item,"limit": 5, "offset": 0}) # Specify UK market in X-EBAY-C-MARKETPLACE-ID
    if response.status_code == 200:
        print("Response:\n", response.json())
        return response.json()
    else:
        print(f"Error {response.status_code}: {response.text}")
        raise Exception(f"Error {response.status_code}: {response.text}")

def fetch_item(item):
    try: return searching_item(getting_auth(), item)
    except Exception as e : return e

fetch_item("adidas")