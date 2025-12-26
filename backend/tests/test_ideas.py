"""
Ideas API endpoint tests for BizGenius.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.models import User, Idea


class TestCreateIdea:
    """Tests for creating ideas."""

    def test_create_idea_success(
        self, client: TestClient, test_user: User, auth_headers: dict
    ):
        """Test successful idea creation."""
        idea_data = {
            "title": "My Business Idea",
            "description": "A revolutionary product that will change the world.",
            "industry": "Technology",
            "target_market": "Small businesses"
        }

        response = client.post(
            "/api/v1/ideas/",
            headers=auth_headers,
            json=idea_data
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == idea_data["title"]
        assert data["description"] == idea_data["description"]
        assert data["industry"] == idea_data["industry"]
        assert data["user_id"] == test_user.id
        assert data["business_plan"] is None  # Not generated yet

    def test_create_idea_minimal(
        self, client: TestClient, auth_headers: dict
    ):
        """Test creating idea with only required fields."""
        response = client.post(
            "/api/v1/ideas/",
            headers=auth_headers,
            json={
                "title": "Minimal Idea",
                "description": "A simple description that is at least ten characters."
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Minimal Idea"
        assert data["industry"] is None
        assert data["target_market"] is None

    def test_create_idea_title_too_short(
        self, client: TestClient, auth_headers: dict
    ):
        """Test creating idea with title too short fails."""
        response = client.post(
            "/api/v1/ideas/",
            headers=auth_headers,
            json={
                "title": "AB",  # Less than 3 characters
                "description": "A valid description that is long enough."
            }
        )

        assert response.status_code == 422

    def test_create_idea_description_too_short(
        self, client: TestClient, auth_headers: dict
    ):
        """Test creating idea with description too short fails."""
        response = client.post(
            "/api/v1/ideas/",
            headers=auth_headers,
            json={
                "title": "Valid Title",
                "description": "Short"  # Less than 10 characters
            }
        )

        assert response.status_code == 422

    def test_create_idea_unauthenticated(self, client: TestClient):
        """Test creating idea without auth fails."""
        response = client.post(
            "/api/v1/ideas/",
            json={
                "title": "Test Idea",
                "description": "A test description that is long enough."
            }
        )

        assert response.status_code == 403


class TestGetIdeas:
    """Tests for getting ideas."""

    def test_get_ideas_empty(
        self, client: TestClient, test_user: User, auth_headers: dict
    ):
        """Test getting ideas when user has none."""
        response = client.get("/api/v1/ideas/", headers=auth_headers)

        assert response.status_code == 200
        assert response.json() == []

    def test_get_ideas_with_data(
        self, client: TestClient, test_idea: Idea, auth_headers: dict
    ):
        """Test getting ideas when user has some."""
        response = client.get("/api/v1/ideas/", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == test_idea.title

    def test_get_ideas_only_own(
        self, client: TestClient, test_idea: Idea, pro_auth_headers: dict
    ):
        """Test that users only see their own ideas."""
        # Pro user should not see test_user's ideas
        response = client.get("/api/v1/ideas/", headers=pro_auth_headers)

        assert response.status_code == 200
        assert response.json() == []

    def test_get_ideas_unauthenticated(self, client: TestClient):
        """Test getting ideas without auth fails."""
        response = client.get("/api/v1/ideas/")

        assert response.status_code == 403


class TestGetSingleIdea:
    """Tests for getting a single idea."""

    def test_get_idea_success(
        self, client: TestClient, test_idea: Idea, auth_headers: dict
    ):
        """Test getting a specific idea."""
        response = client.get(
            f"/api/v1/ideas/{test_idea.id}",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_idea.id
        assert data["title"] == test_idea.title

    def test_get_idea_not_found(
        self, client: TestClient, auth_headers: dict
    ):
        """Test getting non-existent idea fails."""
        response = client.get("/api/v1/ideas/99999", headers=auth_headers)

        assert response.status_code == 404

    def test_get_idea_not_owner(
        self, client: TestClient, test_idea: Idea, pro_auth_headers: dict
    ):
        """Test getting another user's idea fails."""
        response = client.get(
            f"/api/v1/ideas/{test_idea.id}",
            headers=pro_auth_headers
        )

        assert response.status_code == 404


class TestUpdateIdea:
    """Tests for updating ideas."""

    def test_update_idea_success(
        self, client: TestClient, test_idea: Idea, auth_headers: dict
    ):
        """Test successful idea update."""
        response = client.patch(
            f"/api/v1/ideas/{test_idea.id}",
            headers=auth_headers,
            json={"title": "Updated Title"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["description"] == test_idea.description  # Unchanged

    def test_update_idea_multiple_fields(
        self, client: TestClient, test_idea: Idea, auth_headers: dict
    ):
        """Test updating multiple fields."""
        response = client.patch(
            f"/api/v1/ideas/{test_idea.id}",
            headers=auth_headers,
            json={
                "title": "New Title",
                "description": "A completely new description for this idea.",
                "industry": "Finance"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "New Title"
        assert data["industry"] == "Finance"

    def test_update_idea_not_found(
        self, client: TestClient, auth_headers: dict
    ):
        """Test updating non-existent idea fails."""
        response = client.patch(
            "/api/v1/ideas/99999",
            headers=auth_headers,
            json={"title": "New Title"}
        )

        assert response.status_code == 404

    def test_update_idea_not_owner(
        self, client: TestClient, test_idea: Idea, pro_auth_headers: dict
    ):
        """Test updating another user's idea fails."""
        response = client.patch(
            f"/api/v1/ideas/{test_idea.id}",
            headers=pro_auth_headers,
            json={"title": "Hacked Title"}
        )

        assert response.status_code == 404


class TestDeleteIdea:
    """Tests for deleting ideas."""

    def test_delete_idea_success(
        self, client: TestClient, test_idea: Idea, auth_headers: dict, db: Session
    ):
        """Test successful idea deletion."""
        idea_id = test_idea.id

        response = client.delete(
            f"/api/v1/ideas/{idea_id}",
            headers=auth_headers
        )

        assert response.status_code == 200
        assert "deleted" in response.json()["message"].lower()

        # Verify idea is actually deleted
        get_response = client.get(
            f"/api/v1/ideas/{idea_id}",
            headers=auth_headers
        )
        assert get_response.status_code == 404

    def test_delete_idea_not_found(
        self, client: TestClient, auth_headers: dict
    ):
        """Test deleting non-existent idea fails."""
        response = client.delete("/api/v1/ideas/99999", headers=auth_headers)

        assert response.status_code == 404

    def test_delete_idea_not_owner(
        self, client: TestClient, test_idea: Idea, pro_auth_headers: dict
    ):
        """Test deleting another user's idea fails."""
        response = client.delete(
            f"/api/v1/ideas/{test_idea.id}",
            headers=pro_auth_headers
        )

        assert response.status_code == 404


class TestIdeaWithGeneratedContent:
    """Tests for ideas with generated content."""

    def test_get_idea_with_content(
        self, client: TestClient, test_idea_with_content: Idea, auth_headers: dict
    ):
        """Test getting idea with all generated content."""
        response = client.get(
            f"/api/v1/ideas/{test_idea_with_content.id}",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["business_plan"] is not None
        assert data["financial_model"] is not None
        assert data["market_research"] is not None
        assert data["competitor_analysis"] is not None
        assert data["pitch_deck"] is not None
        assert data["generated_at"] is not None
