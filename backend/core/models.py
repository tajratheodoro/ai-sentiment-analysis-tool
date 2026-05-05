from dataclasses import dataclass


@dataclass
class Feedback:
    text: str
    user_id: int
    score: str = ""
