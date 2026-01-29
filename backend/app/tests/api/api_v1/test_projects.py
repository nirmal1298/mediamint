from fastapi.testclient import TestClient
from app.core.config import settings
from app.tests.utils.utils import create_random_user, user_authentication_headers

def test_create_project(client: TestClient):
    user = create_random_user(client)
    headers = user_authentication_headers(client, user["email"], user["password"])
    
    data = {"name": "Test Project", "key": "TEST", "description": "Test Desc"}
    response = client.post(
        f"{settings.API_V1_STR}/projects/",
        headers=headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == data["name"]
    assert content["key"] == data["key"]
    assert "id" in content

def test_read_projects(client: TestClient):
    user = create_random_user(client)
    headers = user_authentication_headers(client, user["email"], user["password"])
    
    # Create a project first
    data = {"name": "My Project", "key": "MYPROJ", "description": "Desc"}
    client.post(f"{settings.API_V1_STR}/projects/", headers=headers, json=data)
    
    response = client.get(f"{settings.API_V1_STR}/projects/", headers=headers)
    assert response.status_code == 200
    content = response.json()
    assert len(content) >= 1
    assert content[0]["key"] == "MYPROJ"
