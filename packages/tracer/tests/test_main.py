from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_valid_lis_python_returns_trace_result():
    response = client.post(
        "/api/trace",
        json={
            "language": "python",
            "source": "nums = [3, 1, 2]\ndp = [1] * len(nums)\nresult = max(dp)",
            "trackedVariables": ["dp", "result"],
        },
    )

    body = response.json()

    assert response.status_code == 200
    assert body["language"] == "python"
    assert body["error"] is None
    assert body["totalSteps"] > 0


def test_syntax_error_returns_trace_error():
    response = client.post(
        "/api/trace",
        json={"language": "python", "source": "x = [1, 2", "trackedVariables": ["x"]},
    )

    assert response.status_code == 200
    assert response.json()["error"]["kind"] == "syntax"


def test_timeout_returns_trace_error():
    response = client.post(
        "/api/trace",
        json={"language": "python", "source": "while True:\n    pass", "trackedVariables": ["x"]},
    )

    assert response.status_code == 200
    assert response.json()["error"]["kind"] == "timeout"


def test_blocked_import_returns_sandbox_error():
    response = client.post(
        "/api/trace",
        json={"language": "python", "source": "import os", "trackedVariables": ["os"]},
    )

    assert response.status_code == 200
    assert response.json()["error"]["kind"] == "sandbox"


def test_unknown_language_returns_400():
    response = client.post(
        "/api/trace",
        json={"language": "ruby", "source": "puts 1", "trackedVariables": []},
    )

    assert response.status_code == 400
