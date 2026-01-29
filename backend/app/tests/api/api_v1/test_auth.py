from fastapi.testclient import TestClient
from app.core.config import settings

def test_signup(client: TestClient):
    response = client.post(
        f"{settings.API_V1_STR}/auth/signup",
        json={"email": "test@example.com", "password": "password123", "name": "Test User"},
    )
    assert response.status_code == 200
    content = response.json()
    assert content["email"] == "test@example.com"
    assert "id" in content

def test_login(client: TestClient):
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={"username": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    content = response.json()
    assert "access_token" in content
    assert content["token_type"] == "bearer"
