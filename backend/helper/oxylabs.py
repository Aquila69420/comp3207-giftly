import requests
from pprint import pprint

# Oxylabs can be used on "any" website: https://developers.oxylabs.io/scraper-apis/web-scraper-api/other-websites
# Let's try it for AliExpress/Alibaba and temu 

# account expires on 26/12
username = "janetjarron"
password = "Janetjarron_1992"

def remove_duplicate_amazon_products(products, selected_products):
    selected_products = list(set(selected_products))
    num_non_duplicate_products = 3 - len(selected_products)
    if num_non_duplicate_products != 0:
        return selected_products + products[:num_non_duplicate_products]
    else: return selected_products

def amazon(item):
    #IMPORTANT: not tested
    response = requests.request('POST','https://realtime.oxylabs.io/v1/queries',auth=(username, password), json={
        'source': 'amazon_search',
        'domain': 'uk',
        'query': item,
        'start_page': 1,
        'pages': 1,
        'parse': True,
    })
    top_2_suggested = response[0]['content']['results']['suggested'][:2]
    top_amazon_choice = response[0]['content']['results']['amazons_choices'][0]
    organic = response[0]['content']['results']['amazons_choices']
    num_missing_products = 3-len(top_2_suggested+top_amazon_choice)
    if num_missing_products != 3:
        return remove_duplicate_amazon_products(organic[num_missing_products:], top_amazon_choice+top_2_suggested+organic[:num_missing_products])
    else:
        return remove_duplicate_amazon_products(organic, top_amazon_choice+top_2_suggested)

def google():
    # https://developers.oxylabs.io/scraper-apis/web-scraper-api/google
    return None

def etsy():
    # https://developers.oxylabs.io/scraper-apis/web-scraper-api/etsy
    return None



