from azure.cosmos import CosmosClient
import os, uuid, logging, json, random, re, datetime, jwt, secrets
client = CosmosClient.from_connection_string(os.getenv("AzureCosmosDBConnectionString"))
database = client.get_database_client(os.getenv("DatabaseName"))
user_container = database.get_container_client(os.getenv("UserContainer"))
groups_container = database.get_container_client(os.getenv("GroupsContainer"))
occasions_container = database.get_container_client(os.getenv("GroupsOccasionsContainer"))
divisions_container = database.get_container_client(os.getenv("GroupsDivisionsContainer"))
invitations_container = database.get_container_client(os.getenv("GroupsInvitationsContainer"))
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

# Custom Exception type to Catch
class GroupsError(Exception):
    def __init__(self, message):
        super().__init__(message)

def user_exists(userID):
    '''Check if userID exists in the database'''
    user = list(user_container.query_items(
            query="SELECT * FROM c WHERE c.id=@userID",
            parameters=[{'name': '@userID', 'value': userID}],
            enable_cross_partition_query=True
        ))
    if not user:
        raise GroupsError("The user does not exist")
    return user[0]

def users_exist(users):
    '''Check if all userIDs in users is in database via a single query and return their documents'''
    users1 = list(user_container.query_items(
        query="SELECT * FROM c where ARRAY_CONTAINS(@users, c.id)",
        parameters=[{'name': '@users', 'value': users}],
        enable_cross_partition_query=True
    ))
    if len(users) != len(users1):
        raise GroupsError("There is a user in the users array that does not exist")
    return users1

def username_exists(username):
    '''Check if username exists in the database and return userID'''
    user = list(user_container.query_items(
                query="SELECT * FROM c WHERE c.username=@username",
                parameters=[{'name': '@username', 'value': username}],
                enable_cross_partition_query=True
            ))
    if not user:
        raise GroupsError("The user does not exist")
    return user[0]

def group_exists(groupID):
    '''Check if groupname exists in the database'''
    groups = list(groups_container.query_items(
            query="SELECT * FROM c WHERE c.id=@groupID",
            parameters=[{'name': '@groupID', 'value': groupID}],
            enable_cross_partition_query=True
        ))
    if not groups:
        raise GroupsError("The group does not exist")
    return groups[0]

def occasion_exists(occasionID):
    occasions = list(occasions_container.query_items(
            query="SELECT * FROM c WHERE c.id=@occasionID",
            parameters=[{'name': '@occasionID', 'value': occasionID}],
            enable_cross_partition_query=True
        ))
    if not occasions:
        raise GroupsError("The occasion does not exist")
    return occasions[0]

def token_exists(tokenID):
    tokens = list(invitations_container.query_items(
            query="SELECT * FROM c WHERE c.id=@tokenID",
            parameters=[{'name': '@tokenID', 'value': tokenID}],
            enable_cross_partition_query=True
        ))
    if not tokens:
        raise GroupsError("This token does not exist")
    tokenDoc = tokens[0]
    validate_tokenDoc(tokenDoc)
    return tokenDoc

def validate_tokenDoc(tokenDoc):
    if tokenDoc['revoked']:
        raise GroupsError("Token has been revoked")
    if tokenDoc['used'] and tokenDoc['one_time']:
        raise GroupsError("Token has been used")
    if tokenDoc['expires_at'] <= datetime.datetime.now(tz=datetime.timezone.utc).isoformat():
        raise GroupsError("Token has expired")

def token_decode(token):
    try:
        data = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise GroupsError("Token has expired")
    except jwt.InvalidTokenError:
        raise GroupsError("Token is invalid")
    return data

def group_is_admin(groupDoc, userID):
    if groupDoc['admin'] != userID:
        raise GroupsError("The user is not the admin of the group")

def group_is_not_admin(groupDoc, userID):
    if groupDoc['admin'] == userID:
        raise GroupsError("This user is the admin of the group")


def user_in_group(groupDoc, userID):
    if userID not in groupDoc['users']:
        raise GroupsError("This user is not in the group")

def user_in_occasion(occasionDoc, userID):
    if userID not in occasionDoc['users']:
        raise GroupsError("This user it not in the occasion")

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
        'occasions': groupDoc['occasions'],
        'chatChannelID': groupDoc.get('chatChannelID')
    }

def groups_cleaned(groups):
    return list(map(lambda groupDoc: group_cleaned(groupDoc), groups))


def occasion_cleaned(ocDoc):
    return {
        'id': ocDoc['id'],
        'groupID': ocDoc['groupID'],
        'users': paired_users(ocDoc['users']),
        'divisions': ocDoc['divisions'],
        'occasionname': ocDoc['occasionname'],
        'occasiondate': ocDoc['occasiondate']
    }

def occasions_cleaned(ocs):
    return list(map(lambda ocDoc: occasion_cleaned(ocDoc), ocs))

def division_cleaned(divisionDoc):
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
    return list(map(lambda divisionDoc: division_cleaned(divisionDoc), divisions))

def occasion_has_divisions(ocDoc):
    if ocDoc['divisions']:
        raise GroupsError("Occasion already has divisions")
    return ocDoc['divisions']

def create_group(userID, groupname, chat_client):
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
    # Check if group exists
    group = group_exists(groupID)

    # Check if userID is admin of group
    group_is_admin(group, userID)
    
    # Delete group in all containers
    for occasionID in group['occasions']:
        delete_occasion(occasionID)
    groups_container.delete_item(item=groupID, partition_key=groupID)



def add_user(userID, user_to_add, groupID, chat_client):
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

def groups_kick(userID, groupID, user_to_remove, chat_client):
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
    # Check group exists
    group = group_exists(groupID)

    # Check user is in group
    user_in_group(group, userID)

    # Check user is not admin
    group_is_not_admin(group, userID)

    return remove_user_from_group(userID, group, chat_client)


def remove_user_from_group(userID, group, chat_client):
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

def generate_invite(userID, groupID, expiryTime, one_time):
    # TODO: If invite for group already exists, replace it with refreshed link
    # Group Exists
    group = group_exists(groupID)

    # Is admin
    group_is_admin(group, userID)

    # Generate url
    timestamp = datetime.datetime.now(tz=datetime.timezone.utc)
    expiry = timestamp + datetime.timedelta(minutes=expiryTime)
    id = str(uuid.uuid4())
    token_data = {
        "id": id,
        "exp": expiry,
        "groupID": groupID,
        "created_by": userID,
        "one_time": one_time
    }
    token = jwt.encode(token_data, JWT_SECRET_KEY, algorithm="HS256")

    # Add to DB
    invitations_container.create_item({
        "id": id,
        "groupID": groupID,
        "used": False,
        "revoked": False,
        "one_time": one_time,
        "created_at": timestamp.isoformat(),
        "expires_at": expiry.isoformat(),
        "created_by": userID,
        "token": token
    })

    return token

def validate_invite(token):
    data = token_decode(token)
    
    # Get token JSON document from DB - token_exits(...) validates the token
    tokenID = data['id']
    token = token_exists(tokenID)

def revoke_invite(userID, token):
    data = token_decode(token)
    tokenID = data['id']
    # Token to tokenDoc
    tokenDoc = token_exists(tokenID)
    # Revoke from created_by only
    if tokenDoc['created_by'] != userID:
        raise GroupsError("User is not the creator of this token")

    # Revoke via Patch Operation
    ops = [
        {"op": "set", "path": "/revoked", "value": True}
    ]
    invitations_container.patch_item(item=tokenID, partition_key=tokenID, patch_operations=ops)

def accept_invite(username, token, chat_client):
    data = token_decode(token)
    admin = data['created_by']
    groupID = data['groupID']
    tokenID = data['id']

    # Validate Token
    token_exists(tokenID)

    group = add_user(admin, username, groupID, chat_client)

    # On successful adding of user, set token to used via patch operation
    ops = [
        {"op": "set", "path": "/used", "value": True}
    ]
    invitations_container.patch_item(item=tokenID, partition_key=tokenID, patch_operations=ops)
    return group


def get_invitations(groupID):
    tokenDocs = list(invitations_container.query_items(
        query="SELECT * FROM c where c.groupID = @groupID",
        parameters=[{"name": "@groupID", "value": groupID}],
        enable_cross_partition_query=True
    ))
    def f(doc):
        try:
            validate_tokenDoc(doc)
            return doc['token']
        except GroupsError:
            return None
    tokens = list(filter(None, map(f, tokenDocs)))
    return tokens

def clear_expired_invite():
    timestamp = datetime.datetime.now(tz=datetime.timezone.utc).isoformat()
    to_remove = list(invitations_container.query_items(
        query="SELECT * FROM c WHERE c.expires_at <= @time OR c.revoked = true OR (c.used = true AND c.one_time = true)",
        parameters=[{"name": "@time", "value": timestamp}],
        enable_cross_partition_query=True
    ))
    for invDoc in to_remove:
        id = invDoc['id']
        invitations_container.delete_item(item=id, partition_key=id)