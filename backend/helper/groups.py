from azure.cosmos import CosmosClient
import os, uuid, logging, json
client = CosmosClient.from_connection_string(os.getenv("AzureCosmosDBConnectionString"))
database = client.get_database_client(os.getenv("DatabaseName"))
user_container = database.get_container_client(os.getenv("UserContainer"))
groups_container = database.get_container_client(os.getenv("GroupsContainer"))
occasions_container = database.get_container_client(os.getenv("GroupsOccasionsContainer"))
divisions_container = database.get_container_client(os.getenv("GroupsDivisionsContainer"))

def user_exists(userID):
    '''Check if userID exists in the database'''
    user = list(user_container.query_items(
            query="SELECT * FROM c WHERE c.id=@userID",
            parameters=[{'name': '@userID', 'value': userID}],
            enable_cross_partition_query=True
        ))
    if not user:
        raise Exception("The user does not exist")
    return user[0]

def users_exist(users):
    '''Check if all userIDs in users is in database via a single query and return their documents'''
    users1 = list(user_container.query_items(
        query="SELECT * FROM c where ARRAY_CONTAINS(@users, c.id)",
        parameters=[{'name': '@users', 'value': users}],
        enable_cross_partition_query=True
    ))
    if len(users) != len(users1):
        raise Exception("There is a user in the users array that does not exist")
    return users1

def username_exists(username):
    '''Check if username exists in the database and return userID'''
    user = list(user_container.query_items(
                query="SELECT * FROM c WHERE c.username=@username",
                parameters=[{'name': '@username', 'value': username}],
                enable_cross_partition_query=True
            ))
    if not user:
        raise Exception("The user does not exist")
    return user[0]

def group_exists(groupID):
    '''Check if groupname exists in the database'''
    groups = list(groups_container.query_items(
            query="SELECT * FROM c WHERE c.id=@groupID",
            parameters=[{'name': '@groupID', 'value': groupID}],
            enable_cross_partition_query=True
        ))
    if not groups:
        raise Exception("The group does not exist")
    return groups[0]

def occasion_exists(occasionID):
    occasions = list(occasions_container.query_items(
            query="SELECT * FROM c WHERE c.id=@occasionID",
            parameters=[{'name': '@occasionID', 'value': occasionID}],
            enable_cross_partition_query=True
        ))
    if not occasions:
        raise Exception("The occasion does not exist")
    return occasions[0]

def group_is_admin(groupDoc, userID):
    if groupDoc['admin'] != userID:
        raise Exception("The user is not the admin of the group")

def group_is_not_admin(groupDoc, userID):
    if groupDoc['admin'] == userID:
        raise Exception("This user is the admin of the group")


def user_in_group(groupDoc, userID):
    if userID not in groupDoc['users']:
        raise Exception("This user is not in the group")

def user_in_occasion(occasionDoc, userID):
    if userID not in occasionDoc['users']:
        raise Exception("This user it not in the occasion")

def paired_users(users):
    # Query Container through a single Query
    users = users_exist(users)
    users = map(lambda userDoc: {
        "userID": userDoc['id'],
        "username": userDoc['username']
    }, users)
    return list(users)

def group_cleaned(groupDoc):
    return {
        'id': groupDoc['id'],
        'groupname': groupDoc['groupname'],
        'admin': groupDoc['admin'],
        'users': paired_users(groupDoc['users']),
        'occasions': groupDoc['occasions']
    }

def groups_cleaned(groups):
    return list(map(lambda groupDoc: group_cleaned(groupDoc), groups))


def occasion_cleaned(ocDoc):
    return ({
        'id': ocDoc['id'],
        'groupID': ocDoc['groupID'],
        'users': paired_users(ocDoc['users']),
        'occasionname': ocDoc['occasionname'],
        'occasiondate': ocDoc['occasiondate']
    })

def occasions_cleaned(ocs):
    return list(map(lambda ocDoc: occasion_cleaned(ocDoc), ocs))

def create_group(userID, groupname):
    # Check if userID exists
    user_exists(userID)

    # Add Group
    group = groups_container.create_item(body={
        'id': str(uuid.uuid4()),
        'groupname': groupname,
        'admin': userID,
        'users': [userID],
        'occasions': []
    })
    return group

def delete_group(userID, groupID):
    # Check if group exists
    group = group_exists(groupID)

    # Check if userID is admin of group
    group_is_admin(group, userID)
    
    # Delete group in all containers
    for occasionID in group['occasions']:
        # TODO: Delete all divisions
        occasions_container.delete_item(item=occasionID, partition_key=occasionID)
    groups_container.delete_item(item=groupID, partition_key=groupID)

def add_user(userID, user_to_add, groupID):
    # Check both userIDs exist
    user_exists(userID)
    user_to_add_doc = username_exists(user_to_add)
    # Set user_to_add username to the user's id
    user_to_add = user_to_add_doc['id']

    # Check Group exists
    group = group_exists(groupID)

    # Check user_to_add is not already in group
    if user_to_add in group['users']:
        raise Exception("The user is already in the group")

    # UserID needs to be admin to add user to group
    group_is_admin(group, userID)

    # Retrieve Group Document via ID
    groupID = group['id']

    # Apply Patch Operation
    ops = [
        {"op": "add", "path": "/users/-", "value": user_to_add}
    ]
    group = groups_container.patch_item(item=groupID, partition_key=groupID, patch_operations=ops)
    return group

def get_groups(userID):
    # Check if username exists
    user_exists(userID)

    # Query database for all groups with user
    groups = list(groups_container.query_items(
                query="SELECT * FROM c WHERE ARRAY_CONTAINS(c.users, @userID)",
                parameters=[{'name': '@userID', 'value': userID}],
                enable_cross_partition_query=True
            ))
    return groups

def change_groupname(userID, groupID, groupname):
    # Check if group exists
    group = group_exists(groupID)

    # Check admin
    group_is_admin(group, userID)

    # Apply Patch Operation
    ops = [
        {"op": "set", "path": "/groupname", "value": groupname}
    ]
    group = groups_container.patch_item(item=groupID, partition_key=groupID, patch_operations=ops)
    return group

def groups_kick(userID, groupID, user_to_remove):
    # Check if group exists
    group = group_exists(groupID)

    # Check userID is admin
    group_is_admin(group, userID)

    # Check admin is not kicking themselves
    if userID == user_to_remove:
        raise Exception("Cannot kick yourself from the group")

    # Check user is in group
    user_in_group(group, user_to_remove)

    return remove_user_from_group(user_to_remove, group)

def groups_leave(userID, groupID):
    # Check group exists
    group = group_exists(groupID)

    # Check user is in group
    user_in_group(group, userID)

    # Check user is not admin
    group_is_not_admin(group, userID)

    return remove_user_from_group(userID, group)


def remove_user_from_group(userID, group):
    groupID = group['id']

    # TODO: Remove from all divisions
    # Remove from all occasions
    ocs = get_occasions(userID, groupID)
    ocs1 = []
    for oc in ocs:
        ocs1.append(remove_user_from_occasion(userID, oc))
        
    ocs = ocs1

    # Kick from group via Patch Operation
    index = group['users'].index(userID)
    ops = [
        { "op": "remove", "path": f"/users/{index}"}
    ]
    group = groups_container.patch_item(item=groupID, partition_key=groupID, patch_operations=ops)
    return ocs, group

def remove_user_from_occasion(userID, oc):
    ocID = oc['id']
    # Kick from occasion via Patch Operation
    index = oc['users'].index(userID)
    
    ops = [
        {"op": "remove", "path": f"/users/{index}"}
    ]
    oc = occasions_container.patch_item(item=ocID, partition_key=ocID, patch_operations=ops)
    # TODO: Occasions with no users are removed
    # TODO: Remove from divisions
    return oc

def create_occasion(userID, groupID, users, occasionname, occasiondate):
    # Check if group exists
    group = group_exists(groupID)
    
    # Check all usernames are in group
    for user in ([userID] + users):
        user_in_group(group, user)
    
    # Add Occasion
    id = str(uuid.uuid4())
    oc = occasions_container.create_item(body={
        'id': id,
        'groupID': groupID,
        'users':  list(dict.fromkeys([userID] + users)),
        'occasionname': occasionname,
        'occasiondate': occasiondate
    })

    # Add To Group via Patch Operation
    ops = [
        {"op": "add", "path": "/occasions/-", "value": id}
    ]
    group = groups_container.patch_item(item=groupID, partition_key=groupID, patch_operations=ops)
    return oc, group

def get_occasions(userID, groupID):
    # Check if group exists
    group = group_exists(groupID)

    # Check userID is in group
    user_in_group(group, userID)

    # Filter occasions in group by ones that are relevant to user
    ocs = list(occasions_container.query_items(
        query="SELECT * FROM c WHERE c.groupID=@groupID and ARRAY_CONTAINS(c.users, @userID)",
        parameters=[{'name': '@groupID', 'value': groupID},
                    {'name': '@userID', 'value': userID}],
        enable_cross_partition_query=True
    ))
    return ocs

def occasions_leave(userID, occasionID):
    # Check occasionID exists
    oc = occasion_exists(occasionID)

    # Check user in occasion
    user_in_occasion(oc, userID)

    # Remove from occasion
    return remove_user_from_occasion(userID, oc)