class TestUsersPositive:
    def test_list_users_returns_200_with_data(self, api):
        response = api.get_users()

        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        assert len(users) == 10

        first_user = users[0]
        assert "id" in first_user
        assert "name" in first_user
        assert "email" in first_user
        assert "username" in first_user

    def test_create_post_returns_201(self, api):
        response = api.create_post(
            title="test title", body="test body", user_id=1
        )

        assert response.status_code == 201
        body = response.json()
        assert body["title"] == "test title"
        assert body["body"] == "test body"
        assert body["userId"] == 1
        assert "id" in body
