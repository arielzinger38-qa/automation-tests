import pytest
from utils.api_client import JsonPlaceholderClient


@pytest.fixture(scope="session")
def api():
    return JsonPlaceholderClient()
