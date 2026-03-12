from __future__ import annotations

from enum import Enum
from pathlib import Path

from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings

import yaml


class RoutingStrategy(str, Enum):
    COST_FIRST = "cost_first"
    QUALITY_FIRST = "quality_first"
    AB_TEST = "ab_test"
    FALLBACK_CHAIN = "fallback_chain"


class ProviderEntry(BaseModel):
    name: str
    api_key: str = ""
    base_url: str = ""
    default_model: str = ""
    fallback_model: str = ""
    priority: int = 0
    cost_per_unit: float = 0.0
    daily_limit: int = 0
    is_active: bool = True


class DatabaseConfig(BaseModel):
    url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/manga_drama"


class RedisConfig(BaseModel):
    url: str = "redis://localhost:6379/0"


class StorageConfig(BaseModel):
    base_path: Path = Path("data/storage")
    images_dir: str = "images"
    videos_dir: str = "videos"
    audio_dir: str = "audio"


class GenerationConfig(BaseModel):
    default_strategy: RoutingStrategy = RoutingStrategy.FALLBACK_CHAIN
    max_retry: int = 3
    video_poll_interval: int = 10
    parallel_limit: int = 3


class AppConfig(BaseSettings):
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: list[str] = ["http://localhost:5173"]
    providers: dict[str, list[ProviderEntry]] = Field(default_factory=dict)
    database: DatabaseConfig = Field(default_factory=DatabaseConfig)
    redis: RedisConfig = Field(default_factory=RedisConfig)
    storage: StorageConfig = Field(default_factory=StorageConfig)
    generation: GenerationConfig = Field(default_factory=GenerationConfig)

    model_config = {"env_prefix": "MANGA_DRAMA_", "env_nested_delimiter": "__"}


def load_config(config_path: str | Path = "config.yaml") -> AppConfig:
    path = Path(config_path)
    if path.exists():
        with open(path) as f:
            data = yaml.safe_load(f) or {}
        providers_raw = data.pop("providers", {})
        providers: dict[str, list[ProviderEntry]] = {}
        for category, entries in providers_raw.items():
            providers[category] = [ProviderEntry(**e) for e in entries]
        return AppConfig(providers=providers, **data)
    return AppConfig()


_config: AppConfig | None = None


def get_config(config_path: str | Path = "config.yaml") -> AppConfig:
    global _config
    if _config is None:
        _config = load_config(config_path)
    return _config


def reset_config() -> None:
    global _config
    _config = None
