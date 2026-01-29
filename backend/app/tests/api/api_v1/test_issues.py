from fastapi.testclient import TestClient
from app.core.config import settings
from app.tests.utils.utils import create_random_user, user_authentication_headers

def test_create_issue(client: TestClient):
    user = create_random_user(client)
    headers = user_authentication_headers(client, user["email"], user["password"])
    
    # Create project
    p_data = {"name": "Issue Project", "key": "IP", "description": "Desc"}
    p_res = client.post(f"{settings.API_V1_STR}/projects/", headers=headers, json=p_data)
    project_id = p_res.json()["id"]
    
    # Create issue
    i_data = {
        "title": "Bug fix",
        "description": "Fix bug",
        "priority": "high",
        "project_id": project_id
    }
    response = client.post(
        f"{settings.API_V1_STR}/issues/",
        headers=headers,
        json=i_data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == i_data["title"]
    assert content["priority"] == "high"
    assert content["reporter_id"] == user["id"]

def test_read_issues(client: TestClient):
    user = create_random_user(client)
    headers = user_authentication_headers(client, user["email"], user["password"])
    
    # Create project & issue
    p_data = {"name": "List Project", "key": "LP", "description": "Desc"}
    p_res = client.post(f"{settings.API_V1_STR}/projects/", headers=headers, json=p_data)
    project_id = p_res.json()["id"]
    
    client.post(
        f"{settings.API_V1_STR}/issues/",
        headers=headers,
        json={"title": "Issue 1", "project_id": project_id}
    )
    
    response = client.get(
        f"{settings.API_V1_STR}/issues/",
        headers=headers,
        params={"project_id": project_id}
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content) == 1
    assert content[0]["title"] == "Issue 1"
