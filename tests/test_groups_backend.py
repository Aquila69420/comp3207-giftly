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

if __name__ == '__main__':
    test_add_user()