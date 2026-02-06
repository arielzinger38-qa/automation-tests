import json
import os
from jsonschema import validate, ValidationError
import pytest


class TestUsersSchema:
    @pytest.fixture(scope="class")
    def user_schema(self):
        schema_path = os.path.join(
            os.path.dirname(__file__), "..", "schemas", "user_schema.json"
        )
        with open(schema_path) as f:
            return json.load(f)

    def test_single_user_matches_schema(self, api, user_schema):
        response = api.get_user(user_id=1)

        assert response.status_code == 200
        body = response.json()

        try:
            validate(instance=body, schema=user_schema)
        except ValidationError as e:
            pytest.fail(f"Response does not match schema: {e.message}")
