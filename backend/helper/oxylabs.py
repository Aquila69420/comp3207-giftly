import requests
from urllib.parse import quote
import json
import os
from pprint import pprint

# TODO: replace with new credentials, account expires on 26/12/2024
# TODO: Add demo response JSON files to gitignore for production/final submission
with open('backend\\local.settings.json', 'r') as file:
    settings = json.load(file)
username = settings.get('Values').get('Oxylabs_API_username')
password = settings.get('Values').get('Oxylabs_API_password')

def amazon(item):
    """
    Returns the top 3 products from Amazon search results for the given item
    param item: str, the item to search for
    return: list of 3 dictionaries, each containing the details of a product
    """
    response = requests.request('POST','https://realtime.oxylabs.io/v1/queries',auth=(username, password), json={
        'source': 'amazon_search',
        'domain': 'co.uk',
        'query': item,
        'start_page': 1,
        'pages': 1,
        'parse': True,
    }).json()
    amazons_choices = response['results'][0]['content']['results']['amazons_choices']
    organic = response['results'][0]['content']['results']['organic']
    top_organic = organic[:2] if len(amazons_choices) > 0 else organic[:3] # top 2 organic results if there is an amazon's choice else top 3
    top_amazon_choice = amazons_choices[0]

    # If the top amazon choice is one of the organic products, get the next organic product
    index = 2
    while top_amazon_choice in top_organic and index < len(organic):
        top_organic.remove(top_amazon_choice)
        top_organic.append(organic[index])
        index += 1
    products = [top_amazon_choice] + top_organic
    return products

def google(item):
    """
    Returns the top 3 products from Google shopping search results for the given item
    param item: str, the item to search for
    return: list of 3 dictionaries, each containing the details of a product
    """
    response = requests.request('POST','https://realtime.oxylabs.io/v1/queries',auth=(username, password), json={
        'source': 'google_shopping_search',
        'domain': 'co.uk',
        'query': item,
        'start_page': 1,
        'pages': 1,
        'parse': True,
        'context': [
            {
                'key': 'results_language',
                'value': 'en'
            }
        ]
    }).json()
    products = response['results'][0]['content']['results']['organic']
    return products[:3]

def querify(query):
    """
    Converts a search query into a querified string for use in a URL
    param query: str, the search query
    return: str, the querified string
    """
    querified_query = '+'.join(query.split(' ')) # Replace spaces with '+'
    return quote(querified_query, safe='+') # Encode special characters in the URL

def target(item):
    """
    Returns the top 3 products from Target search results for the given item
    param item: str, the item to search for
    return: list of 3 dictionaries, each containing the details of a product
    """
    response = requests.request('POST','https://realtime.oxylabs.io/v1/queries',auth=(username, password), json={
        'source': 'universal',
        'url': 'https://www.target.com/s?searchTerm={}'.format(item),
        'parse': True,
    }).json()
    products = response['results'][0]['content']['results']['organic'][:3]
    return products

def walmart(item):
    """
    Returns the top 3 products from Walmart search results for the given item
    param item: str, the item to search for
    return: list of 3 dictionaries, each containing the details of a product
    """
    response = requests.request('POST','https://realtime.oxylabs.io/v1/queries',auth=(username, password), json={
        'source': 'universal',
        'url': 'https://www.walmart.com/search?q={}'.format(item),
        'parse': True,
    }).json()
    products = response['results'][0]['content']['results'][:3]
    return products

# Demo response JSON files for testing

# with open('backend/amazon_search.json') as f:
#     demo_amazon_response = json.load(f)
# with open('backend/google_search.json') as f:
#     demo_google_response = json.load(f)
# with open('backend/walmart_search.json') as f:
#     demo_walmart_response = json.load(f)
# with open('backend/target_search.json') as f:
#     demo_target_response = json.load(f)
    
# print(amazon('Lebron James'))