"""
Authentication flow tests for BizGenius API.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.models import User
from app.api.auth import get_password_hash


class TestRegistration:
    """Tests for user registration."""

    def test_register_success(self, client: TestClient, test_user_data: dict):
        """Test successful user registration."""
        response = client.post("/api/v1/auth/register", json=test_user_data)

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == test_user_data["email"]
        assert data["user"]["full_name"] == test_user_data["full_name"]
        assert data["user"]["subscription_tier"] == "free"

    def test_register_duplicate_email(
        self, client: TestClient, test_user: User, test_user_data: dict
    ):
        """Test registration with existing email fails."""
        # Use the same email as test_user
        test_user_data["email"] = test_user.email

        response = client.post("/api/v1/auth/register", json=test_user_data)

        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    def test_register_invalid_email(self, client: TestClient):
        """Test registration with invalid email fails."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "invalid-email",
                "password": "TestPassword123",
                "full_name": "Test User"
            }
        )

        assert response.status_code == 422

    def test_register_weak_password(self, client: TestClient):
        """Test registration with weak password fails."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "weak",
                "full_name": "Test User"
            }
        )

        assert response.status_code == 422
        # Password should require minimum length, uppercase, lowercase, digit

    def test_register_password_no_uppercase(self, client: TestClient):
        """Test password without uppercase letter fails."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "testpassword123",
                "full_name": "Test User"
            }
        )

        assert response.status_code == 422

    def test_register_password_no_digit(self, client: TestClient):
        """Test password without digit fails."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "TestPassword",
                "full_name": "Test User"
            }
        )

        assert response.status_code == 422


class TestLogin:
    """Tests for user login."""

    def test_login_success(self, client: TestClient, test_user: User):
        """Test successful login."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user.email,
                "password": "TestPassword123"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == test_user.email

    def test_login_wrong_password(self, client: TestClient, test_user: User):
        """Test login with wrong password fails."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user.email,
                "password": "WrongPassword123"
            }
        )

        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()

    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with non-existent email fails."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "TestPassword123"
            }
        )

        assert response.status_code == 401

    def test_login_inactive_user(self, client: TestClient, inactive_user: User):
        """Test login with inactive account fails."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": inactive_user.email,
                "password": "InactivePassword123"
            }
        )

        assert response.status_code == 401
        assert "deactivated" in response.json()["detail"].lower()


class TestGetCurrentUser:
    """Tests for getting current user info."""

    def test_get_me_authenticated(
        self, client: TestClient, test_user: User, auth_headers: dict
    ):
        """Test getting current user info while authenticated."""
        response = client.get("/api/v1/auth/me", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["full_name"] == test_user.full_name
        assert "hashed_password" not in data

    def test_get_me_unauthenticated(self, client: TestClient):
        """Test getting current user info without auth fails."""
        response = client.get("/api/v1/auth/me")

        assert response.status_code == 403  # No credentials provided

    def test_get_me_invalid_token(self, client: TestClient):
        """Test getting current user info with invalid token fails."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid-token"}
        )

        assert response.status_code == 401


class TestPasswordChange:
    """Tests for password change."""

    def test_change_password_success(
        self, client: TestClient, test_user: User, auth_headers: dict
    ):
        """Test successful password change."""
        response = client.put(
            "/api/v1/auth/password",
            headers=auth_headers,
            json={
                "current_password": "TestPassword123",
                "new_password": "NewPassword456"
            }
        )

        assert response.status_code == 200
        assert "success" in response.json()["message"].lower()

        # Verify can login with new password
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user.email,
                "password": "NewPassword456"
            }
        )
        assert login_response.status_code == 200

    def test_change_password_wrong_current(
        self, client: TestClient, auth_headers: dict
    ):
        """Test password change with wrong current password fails."""
        response = client.put(
            "/api/v1/auth/password",
            headers=auth_headers,
            json={
                "current_password": "WrongPassword123",
                "new_password": "NewPassword456"
            }
        )

        assert response.status_code == 400
        assert "incorrect" in response.json()["detail"].lower()

    def test_change_password_same_as_current(
        self, client: TestClient, auth_headers: dict
    ):
        """Test password change to same password fails."""
        response = client.put(
            "/api/v1/auth/password",
            headers=auth_headers,
            json={
                "current_password": "TestPassword123",
                "new_password": "TestPassword123"
            }
        )

        assert response.status_code == 400
        assert "different" in response.json()["detail"].lower()

    def test_change_password_weak_new(
        self, client: TestClient, auth_headers: dict
    ):
        """Test password change with weak new password fails."""
        response = client.put(
            "/api/v1/auth/password",
            headers=auth_headers,
            json={
                "current_password": "TestPassword123",
                "new_password": "weak"
            }
        )

        assert response.status_code == 422

    def test_change_password_unauthenticated(self, client: TestClient):
        """Test password change without auth fails."""
        response = client.put(
            "/api/v1/auth/password",
            json={
                "current_password": "TestPassword123",
                "new_password": "NewPassword456"
            }
        )

        assert response.status_code == 403
