from fastapi.testclient import TestClient
from app.core.config import settings
from app.tests.utils.utils import create_random_user, user_authentication_headers

def test_create_comment(client: TestClient):
    user = create_random_user(client)
    headers = user_authentication_headers(client, user["email"], user["password"])
    
    # Create project & issue
    p_res = client.post(f"{settings.API_V1_STR}/projects/", headers=headers, json={"name": "C Proj", "key": "CP", "description": "D"})
    project_id = p_res.json()["id"]
    
    i_res = client.post(f"{settings.API_V1_STR}/issues/", headers=headers, json={"title": "Issue C", "project_id": project_id})
    issue_id = i_res.json()["id"]
    
    # Create comment
    c_data = {"body": "This is a comment"}
    response = client.post(
        f"{settings.API_V1_STR}/comments/issue/{issue_id}",
        headers=headers,
        json=c_data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["body"] == "This is a comment"
    assert content["author_id"] == user["id"]
    assert content["issue_id"] == issue_id

def test_read_comments(client: TestClient):
    user = create_random_user(client)
    headers = user_authentication_headers(client, user["email"], user["password"])
    
    # Create project, issue, comment
    p_res = client.post(f"{settings.API_V1_STR}/projects/", headers=headers, json={"name": "C Proj 2", "key": "CP2", "description": "D"})
    project_id = p_res.json()["id"]
    
    i_res = client.post(f"{settings.API_V1_STR}/issues/", headers=headers, json={"title": "Issue C 2", "project_id": project_id})
    issue_id = i_res.json()["id"]
    
    client.post(f"{settings.API_V1_STR}/comments/issue/{issue_id}", headers=headers, json={"body": "Comment 1"})
    
    response = client.get(
        f"{settings.API_V1_STR}/comments/issue/{issue_id}",
        headers=headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content) == 1
    assert content[0]["body"] == "Comment 1"
