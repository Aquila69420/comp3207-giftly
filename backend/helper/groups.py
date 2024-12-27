from azure.cosmos import CosmosClient
import os, uuid
client = CosmosClient.from_connection_string(os.getenv("AzureCosmosDBConnectionString"))
database = client.get_database_client(os.getenv("DatabaseName"))
user_container = database.get_container_client(os.getenv("UserContainer"))
groups_container = database.get_container_client(os.getenv("GroupsContainer"))
groups_occasions_container = database.get_container_client(os.getenv("GroupsOccasionsContainer"))
groups_divisions_container = database.get_container_client(os.getenv("GroupsDivisionsContainer"))

def username_exists(username):
    '''Check if username exists in the database'''
    user = list(user_container.query_items(
            query="SELECT * FROM c WHERE c.username=@username",
            parameters=[{'name': '@username', 'value': username}],
            enable_cross_partition_query=True
        ))
    return user

def group_exists(groupID):
    '''Check if groupname exists in the database'''
    groups = list(groups_container.query_items(
            query="SELECT * FROM c WHERE c.groupID=@groupID",
            parameters=[{'name': '@groupID', 'value': groupID}],
            enable_cross_partition_query=True
        ))
    return groups


def create_groups(username, groupname):
    # Check if username exists
    if not username_exists(username):
        raise Exception(f"User {username} does not exist")

    # Add Group
    groups_container.create_item(body={
        'groupID': str(uuid.uuid4()),
        'groupname': groupname,
        'admin': username,
        'usernames': [],
        'occasions': []
    })

def delete_group(username, groupID):
    # Check if group exists
    group = group_exists(groupID)
    if not group:
        raise Exception(f"{groupID} does not exist")

    # Check if username is admin of group
    g = group[0]
    if g['admin'] != username:
        raise Exception(f"{username} is not the admin of the group")
    
    # Delete group in all containers
    # TODO: Delete all occasions
    
