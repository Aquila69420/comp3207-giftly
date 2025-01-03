from azure.cosmos import CosmosClient
import os, uuid, logging, json, random, re, datetime
client = CosmosClient.from_connection_string(os.getenv("AzureCosmosDBConnectionString"))
database = client.get_database_client(os.getenv("DatabaseName"))
user_container = database.get_container_client(os.getenv("UserContainer"))
groups_container = database.get_container_client(os.getenv("GroupsContainer"))
occasions_container = database.get_container_client(os.getenv("GroupsOccasionsContainer"))
divisions_container = database.get_container_client(os.getenv("GroupsDivisionsContainer"))

# Custom Exception type to Catch
class GroupsError(Exception):
    def __init__(self, message):
        super().__init__(message)

def user_exists(userID):
    """
    Check if userID exists in the database

    Parameters
    ----------
    userID : str
        The userID to check

    Returns
    -------
    dict
        The user document
    """
    user = list(user_container.query_items(
            query="SELECT * FROM c WHERE c.id=@userID",
            parameters=[{'name': '@userID', 'value': userID}],
            enable_cross_partition_query=True
        ))
    if not user:
        raise GroupsError("The user does not exist")
    return user[0]

def users_exist(users):
    """
    Check if all userIDs in users is in database via a single query and return their documents

    Parameters
    ----------
    users : list
        The list of userIDs to check

    Returns
    -------
    list
        The list of user documents
    """
    users1 = list(user_container.query_items(
        query="SELECT * FROM c where ARRAY_CONTAINS(@users, c.id)",
        parameters=[{'name': '@users', 'value': users}],
        enable_cross_partition_query=True
    ))
    if len(users) != len(users1):
        raise GroupsError("There is a user in the users array that does not exist")
    return users1

def username_exists(username):
    """
    Check if username exists in the database and return userID
    
    Parameters
    ----------
    username : str
        The username to check for existence

    Returns
    -------
    dict
        The user document
    """
    user = list(user_container.query_items(
                query="SELECT * FROM c WHERE c.username=@username",
                parameters=[{'name': '@username', 'value': username}],
                enable_cross_partition_query=True
            ))
    if not user:
        raise GroupsError("The user does not exist")
    return user[0]

def group_exists(groupID):
    """
    Check if groupname exists in the database

    Parameters
    ----------
    groupID : str
        The groupID to check

    Returns
    -------
    dict
        The group document
    """
    groups = list(groups_container.query_items(
            query="SELECT * FROM c WHERE c.id=@groupID",
            parameters=[{'name': '@groupID', 'value': groupID}],
            enable_cross_partition_query=True
        ))
    if not groups:
        raise GroupsError("The group does not exist")
    return groups[0]

def occasion_exists(occasionID):
    """
    Check if occasion exists in the database
    
    Parameters
    ----------
    occasionID : str
        The occasionID to check

    Returns
    -------
    dict
        The occasion document
    """
    occasions = list(occasions_container.query_items(
            query="SELECT * FROM c WHERE c.id=@occasionID",
            parameters=[{'name': '@occasionID', 'value': occasionID}],
            enable_cross_partition_query=True
        ))
    if not occasions:
        raise GroupsError("The occasion does not exist")
    return occasions[0]

def group_is_admin(groupDoc, userID):
    """
    Check if userID is the admin of the group
    
    Parameters
    ----------
    groupDoc : dict
        The group document
    userID : str
        The userID to check

    Raises
    ------
    GroupsError
        If the user is not the admin of the group
    """
    if groupDoc['admin'] != userID:
        raise GroupsError("The user is not the admin of the group")

def group_is_not_admin(groupDoc, userID):
    """
    Check if userID is not the admin of the group

    Parameters
    ----------
    groupDoc : dict
        The group document
    userID : str
        The userID to check

    Raises
    ------
    GroupsError
        If the user is the admin of the groups
    """
    if groupDoc['admin'] == userID:
        raise GroupsError("This user is the admin of the group")


def user_in_group(groupDoc, userID):
    """
    Check if userID is in the group

    Parameters
    ----------
    groupDoc : dict
        The group document
    userID : str
        The userID to check

    Raises
    ------
    GroupsError
        If the user is not in the group
    """
    if userID not in groupDoc['users']:
        raise GroupsError("This user is not in the group")

def user_in_occasion(occasionDoc, userID):
    """
    Check if userID is in the occasion

    Parameters
    ----------
    occasionDoc : dict
        The occasion document
    userID : str
        The userID to check

    Raises
    ------
    GroupsError
        If the user is not in the occasion
    """
    if userID not in occasionDoc['users']:
        raise GroupsError("This user it not in the occasion")

def paired_users(users):
    """
    Return a list of dictionaries with the keys 'userID' and 'username'

    Parameters
    ----------
    users : list
        The list of user documents

    Returns
    -------
    list
        The list of dictionaries with the keys 'userID' and 'username'
    """
    # Query Container through a single Query
    users = users_exist(users)
    users = map(lambda userDoc: {
        "userID": userDoc['id'],
        "username": userDoc['username']
    }, users)
    return list(users)

def group_cleaned(groupDoc):
    """
    Clean the group document

    Parameters
    ----------
    groupDoc : dict
        The group document

    Returns
    -------
    dict
        The cleaned group document
    """
    return {
        'id': groupDoc['id'],
        'groupname': groupDoc['groupname'],
        'admin': groupDoc['admin'],
        'users': paired_users(groupDoc['users']),
        'occasions': groupDoc['occasions'],
        'chatChannelID': groupDoc.get('chatChannelID')
    }

def groups_cleaned(groups):
    """
    Clean the list of group documents

    Parameters
    ----------
    groups : list
        The list of group documents
        
    Returns
    -------
    list
        The list of cleaned group documents
    """
    return list(map(lambda groupDoc: group_cleaned(groupDoc), groups))


def occasion_cleaned(ocDoc):
    """
    Clean the occasion document
    
    Parameters
    ----------
    ocDoc : dict
        The occasion document

    Returns
    -------
    dict
        The cleaned occasion document
    """
    return {
        'id': ocDoc['id'],
        'groupID': ocDoc['groupID'],
        'users': paired_users(ocDoc['users']),
        'divisions': ocDoc['divisions'],
        'occasionname': ocDoc['occasionname'],
        'occasiondate': ocDoc['occasiondate']
    }

def occasions_cleaned(ocs):
    """
    Clean the list of occasion documents

    Parameters
    ----------
    ocs : list
        The list of occasion documents

    Returns
    -------
    list
        The list of cleaned occasion documents
    """
    return list(map(lambda ocDoc: occasion_cleaned(ocDoc), ocs))

def division_cleaned(divisionDoc):
    """
    Clean the division document
    
    Parameters
    ----------
    divisionDoc : dict
        The division document

    Returns
    -------
    dict
        The cleaned division document
    """
    return {
        'id': divisionDoc['id'],
        'occasionID': divisionDoc['occasionID'],
        'groupID': divisionDoc['groupID'],
        'users': paired_users(divisionDoc['users']),
        'cart': divisionDoc['cart'],
        'recipients': paired_users(divisionDoc['recipients']),
        'chatChannelID': divisionDoc.get('chatChannelID')
    }

date_format_re = re.compile(r"^(\d{4})-(\d{2})-(\d{2})$")
def check_date_format(occasiondate):
    """
    Check if the date is in the format YYYY-MM-DD

    Parameters
    ----------
    occasiondate : str
        The date to check

    Returns
    -------
    bool
        True if the date is in the correct format
    """
    m = date_format_re.match(occasiondate)
    if not m: # occasiondate does not match regex
        raise GroupsError("Occasion date is not the correct format: YYYY-MM-DD")
    y, m, d = m.group(1, 2, 3)
    try:
        datetime.datetime(year = int(y), month = int(m), day = int(d))
    except ValueError as e:
        raise GroupsError("Occasion date is not of a valid date")
    return True

def divisions_cleaned(divisions):
    """
    Clean the list of division documents
    
    Parameters
    ----------
    divisions : list
        The list of division documents

    Returns
    -------
    list
        The list of cleaned division documents
    """
    return list(map(lambda divisionDoc: division_cleaned(divisionDoc), divisions))

def occasion_has_divisions(ocDoc):
    """
    Check if an occasion document has divisions and raise an error if it does.
    
    Parameters
    ----------
    ocDoc : dict
        The occasion document to check for divisions.

    Returns
    -------
    list
        The list of divisions in the occasion document.
    """
    if ocDoc['divisions']:
        raise GroupsError("Occasion already has divisions")
    return ocDoc['divisions']

def create_group(userID, groupname, chat_client):
    """
    Create a new group and its associated chat channel.
    
    Parameters
    ----------
    userID : str
        The ID of the user creating the group.
    groupname : str
        The name of the group to be created.
    chat_client : object
        The chat client used to create the chat channel.
    
    Returns
    -------
    dict
        The created group object containing group details.
    """
    # Check if userID exists
    user_exists(userID)

    group_id = str(uuid.uuid4())
    channel_id = f"group-{group_id}"
    # Add Group
    group = groups_container.create_item(body={
        'id': group_id,
        'groupname': groupname,
        'admin': userID,
        'users': [userID],
        'occasions': [],
        'chatChannelID': channel_id
    })
    channel_id = group['chatChannelID']
    members = [str(u) for u in group['users']]
    # Create the channel with the 'messaging' type (or your choice)
    channel = chat_client.channel(
        channel_type="messaging",
        channel_id=channel_id,
        data={
            "name": group['groupname'],
            "members": members,  # the list of userIDs
        }
    )
    channel.create(userID)
    group['chatChannelID'] = channel_id
    # print(group)
    groups_container.replace_item(item=group['id'], body=group) 
    return group

def delete_group(userID, groupID):
    """
    Delete a group and its associated occasions if the user is an admin of the group.
    
    Parameters
    ----------
    userID : str
        The ID of the user attempting to delete the group.
    groupID : str
        The ID of the group to be deleted.
    """
    # Check if group exists
    group = group_exists(groupID)

    # Check if userID is admin of group
    group_is_admin(group, userID)
    
    # Delete group in all containers
    for occasionID in group['occasions']:
        delete_occasion(occasionID)
    groups_container.delete_item(item=groupID, partition_key=groupID)

def add_user(userID, user_to_add, groupID, chat_client):
    """
    Add a user to a group.

    Parameters
    ----------
    userID : str
        The ID of the user performing the operation.
    user_to_add : str
        The username of the user to be added to the group.
    groupID : str
        The ID of the group to which the user is to be added.
    chat_client : object
        The chat client used to manage chat operations.
    
    Returns
    -------
    dict
        The updated group document.
    Raises
    ------
    GroupsError
        If the user to be added is already in the group.
    """
    # Check both userIDs exist
    user_exists(userID)
    user_to_add_doc = username_exists(user_to_add)
    # Set user_to_add username to the user's id
    user_to_add = user_to_add_doc['id']

    # Check Group exists
    group = group_exists(groupID)

    # Check user_to_add is not already in group
    if user_to_add in group['users']:
        raise GroupsError("The user is already in the group")

    # UserID needs to be admin to add user to group
    group_is_admin(group, userID)

    # Retrieve Group Document via ID
    groupID = group['id']

    # Apply Patch Operation
    ops = [
        {"op": "add", "path": "/users/-", "value": user_to_add}
    ]
    group = groups_container.patch_item(item=groupID, partition_key=groupID, patch_operations=ops)

    chat_client.upsert_user({
        "id": str(user_to_add),
        "username": user_to_add_doc['username']
    })

    channel_id = group.get('chatChannelID')
    if channel_id:
        channel = chat_client.channel("messaging", channel_id=channel_id)
        channel.add_members([str(user_to_add)])
    
    return group

def get_groups(userID):
    """
    Retrieve the list of groups associated with a given user ID.
    
    Parameters
    ----------
    userID : str
        The ID of the user whose groups are to be retrieved.
    
    Returns
    -------
    list
        The list of groups associated with the given user ID.
    """
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
    """
    Change the name of a group
    
    Parameters
    ----------
    userID : str
        The ID of the user requesting the change
    groupID : str
        The ID of the group to be renamed
    groupname : str
        The new name for the group
    
    Returns
    -------
    dict
        The updated group object
    """
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

def groups_kick(userID, groupID, user_to_remove, chat_client):
    """
    Remove a user from a group if the requester is an admin.
    
    Parameters
    ----------
    userID : int
        The ID of the user requesting the removal.
    groupID : int
        The ID of the group from which the user is to be removed.
    user_to_remove : int
        The ID of the user to be removed from the group.
    chat_client : object
        The chat client instance used to manage group communications.
    
    Returns
    -------
    bool
        True if the user was successfully removed from the group, False otherwise.
    Raises
    ------
    GroupsError
        If the group does not exist, the requester is not an admin, the admin tries to kick themselves, or the user is not in the group.
    """
    # Check if group exists
    group = group_exists(groupID)

    # Check userID is admin
    group_is_admin(group, userID)

    # Check admin is not kicking themselves
    if userID == user_to_remove:
        raise GroupsError("Cannot kick yourself from the group")

    # Check user is in group
    user_in_group(group, user_to_remove)

    return remove_user_from_group(user_to_remove, group, chat_client)

def groups_leave(userID, groupID, chat_client):
    """
    Allows a user to leave a group.

    Parameters
    ----------
    userID : int
        The ID of the user who wants to leave the group.
    groupID : int
        The ID of the group the user wants to leave.
    chat_client : object
        The chat client instance used to manage group communications.
    
    Returns
    -------
    bool
        True if the user was successfully removed from the group, False otherwise.
    """
    # Check group exists
    group = group_exists(groupID)

    # Check user is in group
    user_in_group(group, userID)

    # Check user is not admin
    group_is_not_admin(group, userID)

    return remove_user_from_group(userID, group, chat_client)


def remove_user_from_group(userID, group, chat_client):
    """
    Remove a user from a group and all associated occasions and divisions.
    
    Parameters
    ----------
    userID : str
        The ID of the user to be removed.
    group : dict
        The group from which the user is to be removed.
    chat_client : object
        The chat client used to manage chat operations.
    
    Returns
    -------
    tuple
        A tuple containing:
        - divisions : list
            The list of divisions from which the user was removed.
        - ocs : list
            The list of occasions from which the user was removed.
        - group : dict
            The updated group dictionary after the user has been removed.
    """
    groupID = group['id']

    # TODO: Remove from all divisions
    # Remove from all occasions
    ocs = get_occasions(userID, groupID)
    ocs1 = []
    divisions = []
    for oc in ocs:
        division, oc = remove_user_from_occasion(userID, oc)
        ocs1.append(oc)
        divisions.append(division)
        
    ocs = ocs1

    # Kick from group via Patch Operation
    index = group['users'].index(userID)
    ops = [
        { "op": "remove", "path": f"/users/{index}"}
    ]
    group = groups_container.patch_item(item=groupID, partition_key=groupID, patch_operations=ops)
    channel_id = group.get('chatChannelID')
    if channel_id:
        channel = chat_client.channel("messaging", channel_id=channel_id)
        channel.remove_members([str(userID)])
    return divisions, ocs, group

def remove_user_from_occasion(userID, oc):
    ocID = oc['id']
    # Kick from occasion via Patch Operation
    index = oc['users'].index(userID)
    
    # Remove from all divisions
    divisions = get_divisions(userID, ocID)
    divisions1 = []
    for division in divisions:
        divisions1.append(remove_user_from_division(userID, division))
    divisions = divisions1


    ops = [
        {"op": "remove", "path": f"/users/{index}"}
    ]
    oc = occasions_container.patch_item(item=ocID, partition_key=ocID, patch_operations=ops)
    # TODO: Occasions with no users are removed
    return divisions, oc

def remove_user_from_division(userID, division):
    divisionID = division['id']
    
    # Kick from occasion via Patch Operation
    index = division['users'].index(userID)
    ops = [
        {"op": "remove", "path": f"/users/{index}"}
    ]
    division = divisions_container.patch_item(item=divisionID, partition_key=divisionID, patch_operations=ops)
    return division

def create_occasion(userID, groupID, users, occasionname, occasiondate):
    # Check if group exists
    group = group_exists(groupID)
    
    # Check all usernames are in group
    for user in ([userID] + users):
        user_in_group(group, user)

    # Check format of occasiondate
    check_date_format(occasiondate)
    
    # Add Occasion
    id = str(uuid.uuid4())
    oc = occasions_container.create_item(body={
        'id': id,
        'groupID': groupID,
        'users':  list(dict.fromkeys([userID] + users)),
        'divisions': [],
        'occasionname': occasionname,
        'occasiondate': occasiondate
    })

    # Add To Group via Patch Operation
    ops = [
        {"op": "add", "path": "/occasions/-", "value": id}
    ]
    group = groups_container.patch_item(item=groupID, partition_key=groupID, patch_operations=ops)
    return oc, group

def delete_occasion(occasionID):
    # Check occasion exists
    oc = occasion_exists(occasionID)
    groupID = oc['groupID']

    # Delete every division in occasion
    for divisionID in oc['divisions']:
        divisions_container.delete_item(item=divisionID, partition_key=divisionID)
    
    # Delete occasion
    occasions_container.delete_item(item=occasionID, partition_key=occasionID)
    
    # Update group document via Patch Operation
    group = group_exists(groupID)
    index = group['occasions'].index(occasionID)
    ops = [
        {"op": "remove", "path": f"/occasions/{index}"}
    ]
    group = groups_container.patch_item(item=groupID, partition_key=groupID, patch_operations=ops)
    return group

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

def occasion_add_division(ocDoc, divisionID):
    ocID = ocDoc['id']
    # Patch operation to add divisionID to occasion
    ops = [
        {"op": "add", "path": "/divisions/-", "value": divisionID}
    ]
    oc = occasions_container.patch_item(item=ocID, partition_key=ocID, patch_operations=ops)
    return oc

def occasion_datechange(occasionID, occasiondate):
    # Check occasion exists
    oc = occasion_exists(occasionID)

    # Check format of date
    check_date_format(occasiondate)

    # Edit via Patch Operation
    ops = [
        {"op": "set", "path": "/occasiondate", "value": occasiondate}
    ]
    oc = occasions_container.patch_item(item=occasionID, partition_key=occasionID, patch_operations=ops)
    return oc

def group_gifting(userID, occasionID, recipients, chat_client):
    """
    Create a group gifting division for an occasion and set up a chat channel for the division.
    
    Parameters
    ----------
    userID : str
        The ID of the user initiating the group gifting.
    occasionID : str
        The ID of the occasion for which the group gifting is being created.
    recipients : list
        A list of user IDs who are the recipients of the group gift.
    chat_client : object
        The chat client used to create the chat channel for the division.
    
    Returns
    -------
    tuple
        A tuple containing the updated occasion document and a list with the created division document.
    """
    # Check occasion exists
    oc = occasion_exists(occasionID)

    # Lock division creation if divisions already exist
    occasion_has_divisions(oc)

    # Check user in occasion
    user_in_occasion(oc, userID)

    # Check Recipients exist
    try:
        users_exist(recipients)
    except GroupsError as e:
        raise GroupsError("A recipient in recipients does not exist")

    # Add all users from the users in occasion to the division.
    # If recipients are in users of occasion, they are excluded.
    divisionID = str(uuid.uuid4())
    channel_id = f"division-{divisionID}"

    division = divisions_container.create_item({
        'id': divisionID,
        'occasionID': oc['id'],
        'groupID': oc['groupID'],
        'users': [user for user in oc['users'] if user not in recipients],
        'cart': "", #TODO: generate cart for division
        'recipients': recipients,
        'chatChannelID': channel_id
    })

    # Add divison to occasion
    oc = occasion_add_division(oc, division['id'])

    members = [str(u) for u in division['users']]
    
    if len(recipients) == 1:
        recipient = recipients[0]
        recipient_doc = user_exists(recipient)
        division_name = f"{recipient_doc['username']}'s Gift"
    else:
        recipient_docs = users_exist(recipients)
        recipient_names = [recipient['username'] for recipient in recipient_docs]
        division_name = " and ".join(recipient_names) + "'s Gift"
    
    channel = chat_client.channel("messaging", channel_id=channel_id, data={
        "name": division_name,
        "members": members
    })
    channel.create(userID)

    return oc, [division]

def get_divisions(userID, ocID):
    """
    Retrieve divisions for a user in a specific occasion.
    
    Parameters
    ----------
    userID : str
        The ID of the user.
    ocID : str
        The ID of the occasion.
    
    Returns
    -------
    list
        A list of division documents that the user is part of for the specified occasion.
    """
    # Check occasion exists
    oc = occasion_exists(ocID)

    # Check user is in occasion
    user_in_occasion(oc, userID)

    # Query
    divisions = list(divisions_container.query_items(
        query="SELECT * FROM c WHERE c.occasionID=@occasionID and ARRAY_CONTAINS(c.users, @userID)",
        parameters=[{'name': '@occasionID', 'value': ocID},
                    {'name': '@userID', 'value': userID}],
        enable_cross_partition_query=True
    ))
    return divisions

def secret_santa(userID, occasionID):
    """
    Create Secret Santa pairings for an occasion.
    
    Parameters
    ----------
    userID : str
        The ID of the user initiating the Secret Santa.
    occasionID : str
        The ID of the occasion for which Secret Santa is being created.
    
    Returns
    -------
    tuple
        A tuple containing the updated occasion document and a list of created division documents.
    """
    # Check occasion exists
    oc = occasion_exists(occasionID)

    # Lock division creation if divisions already exist
    occasion_has_divisions(oc)

    # Check user is in occasion
    user_in_occasion(oc, userID)

    # Shuffle users and pair i with i + 1 circular array
    users = oc['users']
    users = random.sample(users, len(users)) # Not in-place shuffle
    users.append(users[0])

    divisions = []
    for user, recipient in zip(users, users[1:]):
        division = divisions_container.create_item({
            'id': str(uuid.uuid4()),
            'occasionID': oc['id'],
            'groupID': oc['groupID'],
            'users': [user],
            'cart': "", #TODO: generate cart for division
            'recipients': [recipient]
        })
        divisions.append(division)
        oc = occasion_add_division(oc, division['id'])
    
    return oc, divisions

def exclusion_gifting(userID, occasionID):
    """
    Create divisions for an occasion by excluding one user at a time
    
    Parameters
    ----------
    userID : str
        The ID of the user
    occasionID : str
        The ID of the occasion
    
    Returns
    -------
    tuple
        A tuple containing the updated occasion and the list of created divisions
    """
    # Check occasion exists
    oc = occasion_exists(occasionID)

    # Lock division creation if divisions already exist
    occasion_has_divisions(oc)

    # Check user is in occasion
    user_in_occasion(oc, userID)

    users = oc['users']
    divisions = []
    for i in range(len(users)):
        division = divisions_container.create_item({
            'id': str(uuid.uuid4()),
            'occasionID': oc['id'],
            'groupID': oc['groupID'],
            'users': users[:i] + users[i+1:],
            'cart': "", #TODO: generate cart for division
            'recipients': [users[i]]
        })
        divisions.append(division)
        oc = occasion_add_division(oc, division['id'])
    
    return oc, divisions

def get_calendar(userID):
    """
    Retrieve the calendar of occasions for a specific user.
    
    Parameters
    ----------
    userID : str
        The ID of the user for whom to retrieve the calendar.
    
    Returns
    -------
    list
        A list of dictionaries, each containing details about an occasion, including:
        - occasionID: The ID of the occasion.
        - occasionname: The name of the occasion.
        - occasiondate: The date of the occasion.
        - groupID: The ID of the group associated with the occasion.
        - groupname: The name of the group associated with the occasion.
    """
    # Query occasions container for user relevant occasions
    ocs = list(occasions_container.query_items(
        query="SELECT * FROM c WHERE ARRAY_CONTAINS(c.users, @userID)",
        parameters=[{'name': '@userID', 'value': userID}],
        enable_cross_partition_query=True
    ))
    groupIDs = {oc['groupID'] for oc in ocs}
    groupnames = {groupID: group_exists(groupID)['groupname'] for groupID in groupIDs}
    deadlines = [{
        "occasionID": oc['id'],
        "occasionname": oc['occasionname'],
        "occasiondate": oc['occasiondate'],
        "groupID": oc['groupID'],
        "groupname": groupnames[oc['groupID']]
    } for oc in ocs]
    return deadlines
