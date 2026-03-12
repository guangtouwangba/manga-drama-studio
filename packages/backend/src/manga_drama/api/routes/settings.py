"""Provider settings endpoints (placeholder).

Since there is no ProviderConfig table in the existing models, this module
uses an in-memory store as a placeholder.  A production implementation would
persist to the database via a proper SQLAlchemy model.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/settings", tags=["settings"])


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------


class ProviderConfig(BaseModel):
    name: str
    provider_type: str = ""  # text/image/video/audio
    base_url: str = ""
    default_model: str = ""
    is_enabled: bool = True
    has_api_key: bool = False  # computed; never return raw key


class ProviderUpdate(BaseModel):
    base_url: Optional[str] = None
    default_model: Optional[str] = None
    api_key: Optional[str] = None  # write-only; stored but never returned
    is_enabled: Optional[bool] = None


class ProviderTestResult(BaseModel):
    ok: bool
    latency_ms: Optional[int] = None
    error: Optional[str] = None


# ---------------------------------------------------------------------------
# In-memory store (placeholder for missing ProviderConfig model)
# ---------------------------------------------------------------------------

_providers: dict[str, dict] = {
    "openrouter": {
        "name": "openrouter",
        "provider_type": "text",
        "base_url": "https://openrouter.ai/api/v1",
        "default_model": "anthropic/claude-sonnet-4",
        "is_enabled": True,
        "api_key": "",
    },
    "seedream": {
        "name": "seedream",
        "provider_type": "image",
        "base_url": "",
        "default_model": "seedream-3.0",
        "is_enabled": False,
        "api_key": "",
    },
    "kling": {
        "name": "kling",
        "provider_type": "video",
        "base_url": "",
        "default_model": "kling-v2",
        "is_enabled": False,
        "api_key": "",
    },
    "fish_audio": {
        "name": "fish_audio",
        "provider_type": "audio",
        "base_url": "",
        "default_model": "fish-speech-1.5",
        "is_enabled": False,
        "api_key": "",
    },
}


def _provider_response(p: dict) -> dict:
    """Strip api_key, add has_api_key flag."""
    return {
        "name": p["name"],
        "provider_type": p["provider_type"],
        "base_url": p["base_url"],
        "default_model": p["default_model"],
        "is_enabled": p["is_enabled"],
        "has_api_key": bool(p.get("api_key")),
    }


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("/providers")
async def list_providers():
    return [_provider_response(p) for p in _providers.values()]


@router.put("/providers/{provider_name}")
async def update_provider(provider_name: str, body: ProviderUpdate):
    if provider_name not in _providers:
        raise HTTPException(404, "Provider not found")

    provider = _providers[provider_name]
    update_data = body.model_dump(exclude_unset=True)

    if "api_key" in update_data:
        provider["api_key"] = update_data.pop("api_key")
    for key, value in update_data.items():
        provider[key] = value

    return _provider_response(provider)


@router.post("/providers/{provider_name}/test")
async def test_provider(provider_name: str):
    """Test the connection to a provider.

    This is a placeholder that always returns a success response.
    A real implementation would make an API call to the provider.
    """
    if provider_name not in _providers:
        raise HTTPException(404, "Provider not found")

    provider = _providers[provider_name]
    if not provider.get("api_key"):
        return ProviderTestResult(
            ok=False, error="No API key configured"
        ).model_dump()

    # Placeholder: actual test would call the provider
    return ProviderTestResult(ok=True, latency_ms=42).model_dump()
