from helper.oxylabs import *
import helper.ebay as ebay

def get_products(products):
    # products -> GPT output
    # run each vendor individually: ebay.py, oxylabs.py (amazon, google, etc.), shopify.py
    # format the output to include link, price per unit, name
    # combine the searches and output as dict with each vendor
    # return the value
    print('Searching vendors for products...')
    results = {}
    results['ebay'] = ebay.parse_search_results(ebay.search(products))
    results['amazon'] = parse_amazon_products(amazon(products))
    results['google'] = parse_google_products(google(products))
    results['target'] = parse_target_products(target(products))
    results['walmart'] = parse_walmart_products(walmart(products))
    return results

def get_products_with_price_limitation(products, price):
    # products -> GPT output
    # run each vendor individually ensuring the price falls within the limit otherwise search again: ebay.py, oxylabs.py (amazon, google, etc.), shopify.py
    # format the output to include link, price per unit, name  
    # combine the searches and output as dict with each vendor
    # return the value
    return products