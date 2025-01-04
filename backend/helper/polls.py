import uuid, json, os, logging
from azure.cosmos import CosmosClient

client = CosmosClient.from_connection_string(os.getenv("AzureCosmosDBConnectionString"))
database = client.get_database_client(os.getenv("DatabaseName"))
user_container = database.get_container_client(os.getenv("UserContainer"))
polls_container = database.get_container_client(os.getenv("PollsContainer"))

class PollsError(Exception):
    def __init__(self, message):
        super().__init__(message)



def create_poll(username, title, options):
    user = list(user_container.query_items(
        query="SELECT * FROM c WHERE c.username=@username",
        parameters=[{'name': '@username', 'value': username}],
        enable_cross_partition_query=True
    ))
    if not user:
        raise PollsError("User does not exist")
    poll = {
        'id': str(uuid.uuid4()),
        'username': username,
        'title': title,
        'options': {option: 0 for option in options},
        'votes': [],
        'open': True
    }
    polls_container.create_item(body=poll)
    return poll

# @app.function_name(name="polls_vote")
# @app.route(route='polls/vote', methods=[func.HttpMethod.POST])
# def polls_vote(req: func.HttpRequest) -> func.HttpResponse:
#     '''Vote on a poll
    
#     # Parameters
#     req: func.HttpRequest
#     with
#         data: {username: username, pollID: pollID, option: option}

#     # Returns
#     func.HttpResponse
#     with
#         data: {result: True, msg: "OK", poll: {...}}
#         data: {result: False, msg: "User does not exist"}
#         data: {result: False, msg: "Poll does not exist"}
#         data: {result: False, msg: "Option does not exist"}'''
#     data = req.get_json()
#     username = data['username']
#     pollID = data['pollID']
#     option = data['option']
#     try:
#         poll = polls.vote(username, pollID, option)
#         body = json.dumps({"result": True, "msg": "OK", "poll": poll})
#     except PollsError as e:
#         body = json.dumps({"result": False, "msg": str(e)})
#     response = func.HttpResponse(
#         body=body,
#         mimetype="applications/json",
#         status_code=200
#     )
#     return add_cors_headers(response)

def vote(username, pollID, option):
    user = list(user_container.query_items(
        query="SELECT * FROM c WHERE c.username=@username",
        parameters=[{'name': '@username', 'value': username}],
        enable_cross_partition_query=True
    ))
    if not user:
        raise PollsError("User does not exist")
    poll = list(polls_container.query_items(
        query="SELECT * FROM c WHERE c.id=@id",
        parameters=[{'name': '@id', 'value': pollID}],
        enable_cross_partition_query=True
    ))
    if not poll:
        raise PollsError("Poll does not exist")
    if option not in poll[0]['options']:
        raise PollsError("Option does not exist")
    if any(username in vote for vote in poll[0]['votes']):
        raise PollsError("User has already voted")

    poll[0]['options'][option] += 1
    poll[0]['votes'].append({username: option})
    polls_container.replace_item(
        item = poll[0]['id'],
        body = poll[0],
        pre_trigger_include = None,
        post_trigger_include = None
    )
    return poll[0]


def get_poll(pollID):
    poll = list(polls_container.query_items(
        query="SELECT * FROM c WHERE c.id=@id",
        parameters=[{'name': '@id', 'value': pollID}],
        enable_cross_partition_query=True
    ))
    if not poll:
        raise PollsError("Poll does not exist")
    return poll[0]

def close_poll(username, pollID):
    user = list(user_container.query_items(
        query="SELECT * FROM c WHERE c.username=@username",
        parameters=[{'name': '@username', 'value': username}],
        enable_cross_partition_query=True
    ))
    if not user:
        raise PollsError("User does not exist")
    poll = list(polls_container.query_items(
        query="SELECT * FROM c WHERE c.id=@id",
        parameters=[{'name': '@id', 'value': pollID}],
        enable_cross_partition_query=True
    ))
    if not poll:
        raise PollsError("Poll does not exist")
    if poll[0]['username'] != username:
        raise PollsError("User does not own this poll")
    poll[0]['open'] = False
    polls_container.replace_item(
        item = poll[0]['id'],
        body = poll[0],
        pre_trigger_include = None,
        post_trigger_include = None
    )
    return poll[0]

