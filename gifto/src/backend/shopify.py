'''
Shopify Ajax API Key

Client ID: e7eeea88c9d3825aaa262787ea70d18b

Client Secret: 618a891ce6d59ba40dba2d3d7cfbea91
'''

import requests

def search_products(product):

    url = f"{shop_url}/search/suggest.json"

    params = {
        "q": product,  # Search keyword
        "type": "product"   # Search for products only
    }

    try:
        # Send a GET request to the Shopify search endpoint
        response = requests.get(url, params=params)

        # Check if the request was successful
        if response.status_code == 200:
            data = response.json()
            products = data.get("resources", {}).get("results", {}).get("products", [])
            
            # Print and return product details
            if products:
                print(f"Products matching '{product}':\n")
                for product in products:
                    print(f"Title: {product['title']}")
                    print(f"URL: {url}{product['url']}")
                    print(f"Price: {product['price']}")
                    print("-" * 30)
            else:
                print(f"No products found for '{product}'.")
            return products
        else:
            print(f"Error {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    
