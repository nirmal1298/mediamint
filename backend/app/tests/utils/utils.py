import random
import string
from typing import Dict

from fastapi.testclient import TestClient
from app.core.config import settings

def random_lower_string() -> str:
    return "".join(random.choices(string.ascii_lowercase, k=32))

def random_email() -> str:
    return f"{random_lower_string()}@example.com"

def get_superuser_token_headers(client: TestClient) -> Dict[str, str]:
    login_data = {
        "username": "test@example.com",
        "password": "password123",
    }
    r = client.post(f"{settings.API_V1_STR}/auth/login", data=login_data)
    tokens = r.json()
    return {"Authorization": f"Bearer {tokens['access_token']}"}

def create_random_user(client: TestClient) -> Dict:
    email = random_email()
    password = "password123"
    r = client.post(
        f"{settings.API_V1_STR}/auth/signup",
        json={"email": email, "password": password, "name": "Random User"},
    )
    return {"email": email, "password": password, "id": r.json()["id"]}

def user_authentication_headers(client: TestClient, email: str, password: str) -> Dict[str, str]:
    data = {"username": email, "password": password}
    r = client.post(f"{settings.API_V1_STR}/auth/login", data=data)
    response = r.json()
    auth_token = response["access_token"]
    return {"Authorization": f"Bearer {auth_token}"}
