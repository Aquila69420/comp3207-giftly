import requests
from urllib.parse import quote
import json
import os
from pprint import pprint

# TODO: replace with new credentials, account expires on 26/12/2024
# TODO: Add demo response JSON files to gitignore for production/final submission
with open('./local.settings.json', 'r') as file:
    settings = json.load(file)
username = settings.get('Values').get('Oxylabs_API_username')
password = settings.get('Values').get('Oxylabs_API_password')

# Demo response JSON files for testing
with open('./amazon_search.json') as f:
    demo_amazon_response = json.load(f)
with open('./google_search.json') as f:
    demo_google_response = json.load(f)
with open('./walmart_search.json') as f:
# with open('backend/walmart_search.json') as f:
    demo_walmart_response = json.load(f)

def amazon(query):
    """
    Fetch and process Amazon search results based on the given query.
    
    Parameters
    ----------
    query : str
        The search query to be used for fetching Amazon search results.
    
    Returns
    -------
    list
        A list of top Amazon products, including the top Amazon's choice and top organic results.
    """
    # response = requests.request('POST','https://realtime.oxylabs.io/v1/queries',auth=(username, password), json={
    #     'source': 'amazon_search',
    #     'domain': 'co.uk',
    #     'query': query,
    #     'start_page': 1,
    #     'pages': 1,
    #     'parse': True,
    # }).json()
    response = demo_amazon_response
    amazons_choices = response['results'][0]['content']['results']['amazons_choices']
    organic = response['results'][0]['content']['results']['organic']
    top_organic = organic if len(amazons_choices) > 0 else organic # top 2 organic results if there is an amazon's choice else top 3
    top_amazon_choice = amazons_choices[0]

    # If the top amazon choice is one of the organic products, get the next organic product
    index = 2
    while top_amazon_choice in top_organic and index < len(organic):
        top_organic.remove(top_amazon_choice)
        top_organic.append(organic[index])
        index += 1
    products = [top_amazon_choice] + top_organic
    return products

def parse_amazon_products(products):
    """
    Parse a list of Amazon product dictionaries into a list of simplified product information.
    
    Parameters
    ----------
    products : list
        The list of Amazon product dictionaries.
    
    Returns
    -------
    list
        The list of simplified product information dictionaries.
    """
    products_info = []
    for product in products:
        product_info = {}
        product_info['name'] = product['title']
        product_info['price'] = product['price']
        product_info['currency'] = product['currency']
        product_info['product_url'] = product['url']
        product_info['image_url'] = product['url_image']
        products_info.append(product_info)
    return products_info

def google(query):
    """
    Fetch products from Google Shopping search results for a given query.

    Parameters
    ----------
    query : str
        The search query to be used for fetching Google Shopping results.

    Returns
    -------
    list
        A list of products retrieved from the Google Shopping search results.
    """
    # response = requests.request('POST','https://realtime.oxylabs.io/v1/queries',auth=(username, password), json={
    #     'source': 'google_shopping_search',
    #     'domain': 'co.uk',
    #     'query': query,
    #     'start_page': 1,
    #     'pages': 1,
    #     'parse': True,
    #     'context': [
    #         {
    #             'key': 'results_language',
    #             'value': 'en'
    #         }
    #     ]
    # }).json()
    response = demo_google_response
    products = response['results'][0]['content']['results']['organic']
    return products

def parse_google_products(products):
    """
    Parse a list of Google product dictionaries into a standardized format.
    
    Parameters
    ----------
    products : list
        The list of product dictionaries to parse. Each dictionary should contain
        'title', 'price', 'currency', 'url', and 'thumbnail' keys.
    
    Returns
    -------
    list
        A list of dictionaries containing parsed product information with keys:
        'name', 'price', 'currency', 'product_url', and 'image_url'.
    """
    products_info = []
    for product in products:
        product_info = {}
        product_info['name'] = product['title']
        product_info['price'] = product['price']
        product_info['currency'] = product['currency']
        product_info['product_url'] = product['url']
        product_info['image_url'] = product['thumbnail']
        products_info.append(product_info)
    return products_info

def walmart(query):
    """
    Fetch products from Walmart based on the search query.
    
    Parameters
    ----------
    query : str
        The search query to look for products on Walmart.
    
    Returns
    -------
    list
        A list of products retrieved from the Walmart search results.
    """
    # response = requests.request('POST','https://realtime.oxylabs.io/v1/queries',auth=(username, password), json={
    #     'source': 'universal',
    #     'url': 'https://www.walmart.com/search?q={}'.format(query),
    #     'parse': True,
    # }).json()
    response = demo_walmart_response
    products = response['results'][0]['content']['results']
    return products

def parse_walmart_products(products):
    """
    Parse a list of Walmart product dictionaries and extract relevant information.
    
    Parameters
    ----------
    products : list
        The list of product dictionaries from Walmart.
    
    Returns
    -------
    list
        A list of dictionaries containing parsed product information, including name, price, currency, product URL, and image URL.
    """
    products_info = []
    for product in products:
        product_info = {}
        product_info['name'] = product['general']['title']
        product_info['price'] = product['price']['price']
        product_info['currency'] = product['price'].get('currency', 'GBP')
        product_info['product_url'] = 'https://www.walmart.com' + product['general']['url']
        product_info['image_url'] = product['general']['image']
        products_info.append(product_info)
    return products_info