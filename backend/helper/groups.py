from azure.cosmos import CosmosClient
import os, uuid
client = CosmosClient.from_connection_string(os.getenv("AzureCosmosDBConnectionString"))
database = client.get_database_client(os.getenv("DatabaseName"))
user_container = database.get_container_client(os.getenv("UserContainer"))
groups_container = database.get_container_client(os.getenv("GroupsContainer"))
occasions_container = database.get_container_client(os.getenv("GroupsOccasionsContainer"))
divisions_container = database.get_container_client(os.getenv("GroupsDivisionsContainer"))

def username_exists(username):
    '''Check if username exists in the database'''
    user = list(user_container.query_items(
            query="SELECT * FROM c WHERE c.username=@username",
            parameters=[{'name': '@username', 'value': username}],
            enable_cross_partition_query=True
        ))
    if not user:
        raise Exception(f"{username} does not exist")
    return user

def group_exists(groupID):
    '''Check if groupname exists in the database'''
    groups = list(groups_container.query_items(
            query="SELECT * FROM c WHERE c.id=@groupID",
            parameters=[{'name': '@groupID', 'value': groupID}],
            enable_cross_partition_query=True
        ))
    if not groups:
        raise Exception(f"{groupID} does not exist")
    return groups[0]

def group_is_admin(groupDoc, username):
    if groupDoc['admin'] != username:
        raise Exception(f"{username} is not the admin of the group")

def create_group(username, groupname):
    # Check if username exists
    username_exists(username)

    # Add Group
    groups_container.create_item(body={
        'id': str(uuid.uuid4()),
        'groupname': groupname,
        'admin': username,
        'usernames': [username],
        'occasions': []
    })

def delete_group(username, groupID):
    # Check if group exists
    group = group_exists(groupID)

    # Check if username is admin of group
    group_is_admin(group, username)
    
    # Delete group in all containers
    # TODO: Delete all occasions
    groups_container.delete_item(item=groupID, partition_key=groupID)

def add_user(username, user_to_add, groupID):
    # Check both usernames exist
    username_exists(username)
    username_exists(user_to_add)

    # Check Group exists
    group = group_exists(groupID)

    # Check user_to_add is not already in group
    if user_to_add in group['usernames']:
        raise Exception(f"{user_to_add} is already in the group")

    # Retrieve Group Document via ID
    groupID = group['id']

    # Apply Patch Operation
    ops = [
        {"op": "add", "path": "/usernames/-", "value": user_to_add}
    ]
    groups_container.patch_item(item=groupID, partition_key=groupID, patch_operations=ops)

def get_groups(username):
    # Check if username exists
    username_exists(username)

    # Query database for all groups with user
    groups = list(groups_container.query_items(
                query="SELECT * FROM c WHERE ARRAY_CONTAINS(c.usernames, @username)",
                parameters=[{'name': '@username', 'value': username}],
                enable_cross_partition_query=True
            ))
    return groups

def change_groupname(username, groupID, groupname):
    # Check if group exists
    group = group_exists(groupID)

    # Check admin
    group_is_admin(group, username)

    # Apply Patch Operation
    ops = [
        {"op": "set", "path": "/groupname", "value": groupname}
    ]
    groups_container.patch_item(item=groupID, partition_key=groupID, patch_operations=ops)

def create_occasion(username, groupID, occasionname, occasiondate):
    # Check if group exists
    group = group_exists(groupID)

    # Check username is in group
    if username not in group['usernames']:
        raise Exception(f"{username} is not in the group")
    
    # Add Occasion
    id = str(uuid.uuid4())
    occasions_container.create_item(body={
        'id': id,
        'admin': username,
        'groupID': groupID,
        'usernames': [username],
        'occasionname': occasionname,
        'occasiondate': occasiondate
    })

    # Add To Group via Patch Operation
    ops = [
        {"op": "add", "path": "/occasions/-", "value": id}
    ]
    groups_container.patch_item(item=groupID, partition_key=groupID, patch_operations=ops)