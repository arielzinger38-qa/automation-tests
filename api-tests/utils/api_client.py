import requests


class JsonPlaceholderClient:
    BASE_URL = "https://jsonplaceholder.typicode.com"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    def get_users(self):
        return self.session.get(f"{self.BASE_URL}/users")

    def get_user(self, user_id):
        return self.session.get(f"{self.BASE_URL}/users/{user_id}")

    def create_post(self, title, body, user_id):
        return self.session.post(
            f"{self.BASE_URL}/posts",
            json={"title": title, "body": body, "userId": user_id},
        )

    def get_posts(self):
        return self.session.get(f"{self.BASE_URL}/posts")
