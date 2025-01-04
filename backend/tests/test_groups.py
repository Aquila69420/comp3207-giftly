import sys
import requests
import json
import datetime
testIP = "http://localhost:5000/groups"
import bcrypt

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(12))


def getURL(*path):
    url = testIP
    for p in path:
        url += '/' + p
    return url

def test_create_group():
    url = getURL("create")
    print(url)
    r = requests.post(url=url, data=json.dumps({
        "userID": "fd91053e-3ba2-4b49-92d1-399d5f03a2f0",
        "groupname": "test_group"
    }))
    r.raise_for_status()
    print(r.json())
    return r.json()['group']['id']

def test_add_user():
    url = getURL("add_user")
    print(url)
    r = requests.post(url=url, data=json.dumps({
        "userID": "fd91053e-3ba2-4b49-92d1-399d5f03a2f0",
        "groupID": "1a16b794-816c-479b-bca2-37578455c89d",
        "user_to_add": "Jesse"
    }))
    r.raise_for_status()
    print(r.json())

def kick_user():
    url = getURL("kick")
    print(url)
    r = requests.post(url=url, data=json.dumps({
        "userID": "fd91053e-3ba2-4b49-92d1-399d5f03a2f0",
        "groupID": "1a16b794-816c-479b-bca2-37578455c89d",
        "user_to_remove": "06bac64c-9de0-4757-ba1a-ccff044a3399"
    }))
    print(r.json())

def test_add_occasion():
    url = getURL("occasions", "create")
    print(url)
    # data: {userID: userID, groupID: groupID, users: [], occasionname: occasionname, 
    #        occasiondate: occasiondate}
    r = requests.post(url=url, data=json.dumps({
        "userID": "fd91053e-3ba2-4b49-92d1-399d5f03a2f0",
        "groupID": "1a16b794-816c-479b-bca2-37578455c89d",
        "users": [
            "fd91053e-3ba2-4b49-92d1-399d5f03a2f0",
            "06bac64c-9de0-4757-ba1a-ccff044a3399",
            "5dc28b4d-a237-445c-b4ca-dc28446b2a67",
            "1815e789-2826-4bbc-b8db-389cb5e2d639",
            "3e6922b6-23c2-48ee-bca7-c2c04a8be7b0"
        ],
        "occasionname": "Christmas",
        "occasiondate": "2024-02-29"
    }))
    r.raise_for_status()
    data = r.json()
    print(data)
    try:
        return data['occasion']['id']
    except KeyError as _:
        return None

def test_get_occasions():
    url = getURL("occasions", "get")
    print(url)
    r = requests.post(url=url, data=json.dumps({
        "userID": "fd91053e-3ba2-4b49-92d1-399d5f03a2f0",
        "groupID": "1a16b794-816c-479b-bca2-37578455c89d"
    }))
    r.raise_for_status()
    print(r.json())

def test_leave_occasion():
    url = getURL("occasions", "leave")
    print(url)
    r = requests.post(url=url, data=json.dumps({
        "userID": "fd91053e-3ba2-4b49-92d1-399d5f03a2f0",
        "occasionID": "313ef1a4-96c9-465d-bf76-67b707e58d91"
    }))
    r.raise_for_status()
    print(r.json())

def test_group_gifting(id):
    url = getURL("group_gifting")
    print(url)
    r = requests.post(url=url, data=json.dumps({
        "userID": "fd91053e-3ba2-4b49-92d1-399d5f03a2f0",
        "occasionID": id,
        "recipients": ["06bac64c-9de0-4757-ba1a-ccff044a3399",
                       "fd91053e-3ba2-4b49-92d1-399d5f03a2f0"]
    }))
    r.raise_for_status()
    print(r.json())

def test_divisions_get():
    url = getURL("divisions", "get")
    print(url)
    r = requests.post(url=url, data=json.dumps({
        "userID": "fd91053e-3ba2-4b49-92d1-399d5f03a2f0",
        "occasionID": "c5582269-3439-4345-94f4-db49a8764d9d"
    }))
    r.raise_for_status()
    print(r.json())

def test_delete_occasion(id):
    url = getURL("occasions", "delete")
    print(url)
    r = requests.post(url=url, data=json.dumps({
        "occasionID": id
    }))
    r.raise_for_status()
    print(r.json())

def test_secret_santa(id):
    url = getURL("secret_santa")
    print(url)
    r = requests.post(url=url, data=json.dumps({
        "occasionID": id,
        "userID": "fd91053e-3ba2-4b49-92d1-399d5f03a2f0"
    }))
    r.raise_for_status()
    print(r.json())

def test_exclusion_gifting(id):
    url = getURL("exclusion_gifting")
    print(url)
    r = requests.post(url=url, data=json.dumps({
        "occasionID": id,
        "userID": "fd91053e-3ba2-4b49-92d1-399d5f03a2f0"
    }))
    r.raise_for_status()
    print(r.json())

def test_occasion_datechange(id):
    url = getURL("occasions", "datechange")
    print(url)
    r = requests.post(url=url, data=json.dumps({
        "occasionID": id,
        "occasiondate": "2002-12-02"
    }))
    r.raise_for_status()
    print(r.json())

def test_calendar_get(id):
    url = getURL("calendar", "get")
    print(url)
    r = requests.post(url=url, data=json.dumps({
        "userID": id
    }))
    r.raise_for_status()
    print(r.json())

def test_package():
    print(hash_password("anthony1"))

def test_generate_invite():
    url = getURL("invite", "generate")
    print(url)
    r = requests.post(url=url, data=json.dumps({
        "userID": "fd91053e-3ba2-4b49-92d1-399d5f03a2f0",
        "groupID": "1fa53c2a-fa0f-4739-9698-2eb28834a0be",
        "expiryTime": 1,
        "one_time": False
    }))
    data = r.json()
    if data['result']:
        print(data['token'])
        return data['token']
    return None

def test_accept_invite(token):
    url = getURL("invite", "accept")
    print(url)
    r = requests.post(url=url, data=json.dumps({
        "username": "atharva",
        "token": token
    }))
    print(r.json())

def test_validate_token(token):
    url = getURL("invite", "validate")
    print(url)
    r = requests.post(url=url, data=json.dumps({
        "token": token
    }))
    print(r.json())

def test_revoke_token(token):
    url = getURL("invite", "revoke")
    print(url)
    r = requests.post(url=url, data=json.dumps({
        "userID": "fd91053e-3ba2-4b49-92d1-399d5f03a2f0",
        "token": token
    }))
    print(r.json())

def tokens_clear():
    url = getURL("invite", "clear_expired")
    print(url)
    r = requests.post(url=url, data=json.dumps({}))
    print(r.json())

def test_get_invites():
    url = getURL("invite", "get")
    print(url)
    r = requests.get(url=url, data=json.dumps({
        "groupID": "1fa53c2a-fa0f-4739-9698-2eb28834a0be"
    }))
    r.raise_for_status()
    print(r.json())

if __name__ == '__main__':
    # test_delete_occasion("1d2ad927-5560-4326-89ec-3f49dc2dd5e7")
    # id = test_add_occasion()
    # test_calendar_get("fd91053e-3ba2-4b49-92d1-399d5f03a2f0")

    # token = test_generate_invite()
    test_get_invites()

    # test_revoke_token(token)
    # test_accept_invite(token)

    # tokens_clear()