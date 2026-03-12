from __future__ import annotations

import random
from typing import Any

from manga_drama.config import RoutingStrategy
from manga_drama.providers.base import (
    AudioProvider,
    AudioResult,
    ImageProvider,
    ImageResult,
    TextProvider,
    TextResult,
    VideoProvider,
    VideoResult,
)


class ProviderRouter:
    def __init__(self) -> None:
        self._text: list[tuple[int, float, TextProvider]] = []
        self._image: list[tuple[int, float, ImageProvider]] = []
        self._video: list[tuple[int, float, VideoProvider]] = []
        self._audio: list[tuple[int, float, AudioProvider]] = []

    def register_text(
        self, provider: TextProvider, priority: int = 0, cost: float = 0.0
    ) -> None:
        self._text.append((priority, cost, provider))

    def register_image(
        self, provider: ImageProvider, priority: int = 0, cost: float = 0.0
    ) -> None:
        self._image.append((priority, cost, provider))

    def register_video(
        self, provider: VideoProvider, priority: int = 0, cost: float = 0.0
    ) -> None:
        self._video.append((priority, cost, provider))

    def register_audio(
        self, provider: AudioProvider, priority: int = 0, cost: float = 0.0
    ) -> None:
        self._audio.append((priority, cost, provider))

    @staticmethod
    def _select(
        providers: list[tuple[int, float, Any]], strategy: RoutingStrategy
    ) -> list[Any]:
        if not providers:
            raise ValueError("No providers registered for this type")
        if strategy == RoutingStrategy.COST_FIRST:
            return [p for _, _, p in sorted(providers, key=lambda x: x[1])]
        elif strategy == RoutingStrategy.QUALITY_FIRST:
            return [p for _, _, p in sorted(providers, key=lambda x: x[0])]
        elif strategy == RoutingStrategy.AB_TEST:
            shuffled = list(providers)
            random.shuffle(shuffled)
            return [p for _, _, p in shuffled]
        else:
            return [p for _, _, p in sorted(providers, key=lambda x: x[0])]

    async def text(
        self,
        messages: list[dict],
        strategy: RoutingStrategy = RoutingStrategy.FALLBACK_CHAIN,
        **kwargs: Any,
    ) -> TextResult:
        for provider in self._select(self._text, strategy):
            try:
                return await provider.generate(messages, **kwargs)
            except Exception:
                continue
        raise ValueError("All text providers failed")

    async def image(
        self,
        prompt: str,
        strategy: RoutingStrategy = RoutingStrategy.FALLBACK_CHAIN,
        **kwargs: Any,
    ) -> ImageResult:
        for provider in self._select(self._image, strategy):
            try:
                return await provider.generate(prompt, **kwargs)
            except Exception:
                continue
        raise ValueError("All image providers failed")

    async def video(
        self,
        prompt: str,
        strategy: RoutingStrategy = RoutingStrategy.FALLBACK_CHAIN,
        **kwargs: Any,
    ) -> VideoResult:
        for provider in self._select(self._video, strategy):
            try:
                return await provider.generate(prompt, **kwargs)
            except Exception:
                continue
        raise ValueError("All video providers failed")

    async def audio(
        self,
        text: str,
        strategy: RoutingStrategy = RoutingStrategy.FALLBACK_CHAIN,
        **kwargs: Any,
    ) -> AudioResult:
        for provider in self._select(self._audio, strategy):
            try:
                return await provider.generate(text, **kwargs)
            except Exception:
                continue
        raise ValueError("All audio providers failed")
