import requests
import json
testIP = "http://localhost:5000/groups"

def getURL(*path):
    url = testIP
    for p in path:
        url += '/' + p
    return url

def test_add_user():
    url = getURL("add_user")
    print(url)
    r = requests.post(url=url, data=json.dumps({
        "userID": "fd91053e-3ba2-4b49-92d1-399d5f03a2f0",
        "groupID": "1a16b794-816c-479b-bca2-37578455c89d",
        "user_to_add": "atharva"
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
        "users": ["06bac64c-9de0-4757-ba1a-ccff044a3399"],
        "occasionname": "Christmas",
        "occasiondate": "01/01/1990"
    }))
    r.raise_for_status()
    print(r.json())

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

def test_group_gifting():
    url = getURL("group_gifting")
    print(url)
    r = requests.post(url=url, data=json.dumps({
        "userID": "fd91053e-3ba2-4b49-92d1-399d5f03a2f0",
        "occasionID": "c5582269-3439-4345-94f4-db49a8764d9d",
        "recipients": ["06bac64c-9de0-4757-ba1a-ccff044a3399"]
    }))
    r.raise_for_status()
    print(r.json())

if __name__ == '__main__':
    test_group_gifting()