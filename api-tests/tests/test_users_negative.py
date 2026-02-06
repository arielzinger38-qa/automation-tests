class TestUsersNegative:
    def test_get_nonexistent_user_returns_404(self, api):
        response = api.get_user(user_id=9999)

        assert response.status_code == 404
        body = response.json()
        assert body == {}
