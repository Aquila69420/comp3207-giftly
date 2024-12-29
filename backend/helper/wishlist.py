import uuid, json, os, logging
import azure.functions as func

def get(username, container):
    # return the wishlist
    logging.info(f"Fetching wishlist for {username}")
    try:
        user_wishlist_data = list(container.query_items(
            query="SELECT * FROM c WHERE c.username=@username",
            parameters=[{'name': '@username', 'value': username}],
            enable_cross_partition_query=True
        ))
        logging.info(f"wishlist data: {user_wishlist_data}")
        if user_wishlist_data:
            list_of_gifts = user_wishlist_data[0]['gifts']
            return list_of_gifts
        else:
            logging.info(f"{username} has no wishlist")
            return f"{username} has no wishlist"
    except Exception as e:
        logging.info(f"wishlist get error: {e}")
        return "database error"

def add(username, new_gift, container):
    logging.info(f"new gift: {new_gift}")
    logging.info(f"Updating wishlist for {username}")
    try:
        user_wishlist_data = list(container.query_items(
            query="SELECT * FROM c WHERE c.username=@username",
            parameters=[{'name': '@username', 'value': username}],
            enable_cross_partition_query=True
        ))
        if user_wishlist_data:
            wishlist_id = user_wishlist_data[0]['id']
            user_data = {}
            user_data['id'] = wishlist_id
            user_data['username'] = user_wishlist_data[0]['username']
            list_of_gifts = user_wishlist_data[0]['gifts']
            list_of_gifts.append(new_gift)
            user_data['gifts'] = list_of_gifts
            container.replace_item(
                item = wishlist_id,
                body = user_data,
                pre_trigger_include = None,
                post_trigger_include = None
            )
        else:
            container.create_item(body={
                'username': username,
                'gifts': [new_gift],
            }, enable_automatic_id_generation=True)
        return f"{username} wishlist updated"
    except Exception as e:
        logging.info(f"wishlist update error: {e}")
        return "database error"
    
def remove(username, new_gift, container):
    try:
        user_wishlist_data = list(container.query_items(
            query="SELECT * FROM c WHERE c.username=@username",
            parameters=[{'name': '@username', 'value': username}],
            enable_cross_partition_query=True
        ))

        if new_gift in user_wishlist_data[0]['gifts']:
            user_data = {}
            wishlist_id = user_wishlist_data[0]['id']
            user_data['id'] = wishlist_id
            user_data['username'] = user_wishlist_data[0]['username']
            list_of_gifts = user_wishlist_data[0]['gifts']
            list_of_gifts.remove(new_gift)
            user_data['gifts'] = list_of_gifts
            container.replace_item(
                item = wishlist_id,
                body = user_data,
                pre_trigger_include = None,
                post_trigger_include = None
            )
            return f"gift removed for {username}"
        else:
            return f"gift not in wishlist for {username}"
    except Exception as e:
        logging.info(f"wishlist gift remove error: {e}")
        return "database error"