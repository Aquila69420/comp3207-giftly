import requests
from urllib.parse import quote
import json
import os
from pprint import pprint

# TODO: replace with new credentials, account expires on 26/12/2024
# TODO: Add demo response JSON files to gitignore for production/final submission
with open('./local.settings.json', 'r') as file:
# with open('backend/local.settings.json') as file:
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
with open('./target_search.json') as f:
    demo_target_response = json.load(f)

def amazon(query):
    """
    Returns the top 3 products from Amazon search results for the given query
    param query: str, the query to search for
    return: list of 3 dictionaries, each containing the details of a product
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
    top_organic = organic[:2] if len(amazons_choices) > 0 else organic[:20  ] # top 2 organic results if there is an amazon's choice else top 3
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
    Returns the top 3 products from Google shopping search results for the given query
    param query: str, the query to search for
    return: list of 3 dictionaries, each containing the details of a product
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
    return products[:3]

def parse_google_products(products):
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

def target(query):
    """
    Returns the top 3 products from Target search results for the given query
    param query: str, the query to search for
    return: list of 3 dictionaries, each containing the details of a product
    """
    # response = requests.request('POST','https://realtime.oxylabs.io/v1/queries',auth=(username, password), json={
    #     'source': 'universal',
    #     'url': 'https://www.target.com/s?searchTerm={}'.format(query),
    #     'parse': True,
    # }).json()
    response = demo_target_response
    products = response['results'][0]['content']['results']['organic'][:20]
    return products

def parse_target_products(products):
    products_info = []
    for product in products:
        product_info = {}
        product_info['name'] = product['title']
        product_info['price'] = product['price_data']['price']
        product_info['currency'] = product['price_data']['currency']
        product_info['product_url'] = product['url']
        # TODO: Need to get image/thumbnail
        products_info.append(product_info)
    return products_info

def walmart(query):
    """
    Returns the top 3 products from Walmart search results for the given query
    param query: str, the query to search for
    return: list of 3 dictionaries, each containing the details of a product
    """
    # response = requests.request('POST','https://realtime.oxylabs.io/v1/queries',auth=(username, password), json={
    #     'source': 'universal',
    #     'url': 'https://www.walmart.com/search?q={}'.format(query),
    #     'parse': True,
    # }).json()
    response = demo_walmart_response
    products = response['results'][0]['content']['results'][:20]
    return products

def parse_walmart_products(products):
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