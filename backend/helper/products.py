from helper.oxylabs import *
import helper.ebay as ebay

def get_products(products):
    """
    Retrieve product information from various vendors.

    Parameters
    ----------
    products : list
        A list of product names to search for.

    Returns
    -------
    dict
        A dictionary containing the search results from each vendor. 
        The keys are vendor names (e.g., 'ebay', 'amazon', 'google', 'walmart') 
        and the values are the formatted search results from each vendor.
    """
    # products -> GPT output
    # run each vendor individually: ebay.py, oxylabs.py (amazon, google, etc.), shopify.py
    # format the output to include link, price per unit, name
    # combine the searches and output as dict with each vendor
    # return the value
    results = {}
    try:
        results['ebay'] = ebay.parse_search_results(ebay.search(products))
        results['amazon'] = parse_amazon_products(amazon(products))
        results['google'] = parse_google_products(google(products))
        results['walmart'] = parse_walmart_products(walmart(products))
    except:
        with open('./ebay_search.json') as f:
            demo_ebay_response = json.load(f)
        with open('./amazon_search.json') as f:
            demo_amazon_response = json.load(f)
        with open('./google_search.json') as f:
            demo_google_response = json.load(f)
        with open('./walmart_search.json') as f:
            demo_walmart_response = json.load(f)
        results['ebay'] = ebay.parse_search_results(demo_ebay_response['itemSummaries'])
        results['amazon'] = parse_amazon_products(demo_amazon_response['results'][0]['content']['results']['organic'])
        results['google'] = parse_google_products(demo_google_response['results'][0]['content']['results']['organic'])
        results['walmart'] = parse_walmart_products(demo_walmart_response['results'][0]['content']['results'])
    return results

def get_products_with_price_limitation(products, price):
    # products -> GPT output
    # run each vendor individually ensuring the price falls within the limit otherwise search again: ebay.py, oxylabs.py (amazon, google, etc.), shopify.py
    # format the output to include link, price per unit, name  
    # combine the searches and output as dict with each vendor
    # return the value
    return products