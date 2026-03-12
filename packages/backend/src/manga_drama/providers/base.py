from __future__ import annotations

import asyncio
from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class TextResult:
    text: str
    model: str = ""
    input_tokens: int = 0
    output_tokens: int = 0
    cost: float = 0.0


@dataclass
class ImageResult:
    image_path: str
    model: str = ""
    seed: int = 0
    width: int = 0
    height: int = 0
    cost: float = 0.0


@dataclass
class VideoResult:
    video_path: str
    model: str = ""
    duration: float = 0.0
    cost: float = 0.0
    task_id: str = ""


@dataclass
class AudioResult:
    audio_path: str
    voice: str = ""
    duration: float = 0.0
    cost: float = 0.0


class TextProvider(ABC):
    @abstractmethod
    async def generate(
        self, messages: list[dict], model: str = "", json_mode: bool = False
    ) -> TextResult: ...


class ImageProvider(ABC):
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        model: str = "",
        reference_images: list[str] | None = None,
        negative_prompt: str = "",
        seed: int | None = None,
        width: int = 1080,
        height: int = 1920,
        **kwargs,
    ) -> ImageResult: ...


class VideoProvider(ABC):
    @abstractmethod
    async def submit(
        self,
        prompt: str,
        image_path: str = "",
        first_frame_path: str = "",
        last_frame_path: str = "",
        reference_images: list[str] | None = None,
        model: str = "",
        duration: int = 4,
        aspect_ratio: str = "9:16",
        motion_level: int = 5,
        camera_motion: str = "",
        **kwargs,
    ) -> str: ...

    @abstractmethod
    async def poll(self, task_id: str) -> VideoResult | None: ...

    async def generate(
        self,
        prompt: str,
        image_path: str = "",
        poll_interval: int = 10,
        max_wait: int = 300,
        **kwargs,
    ) -> VideoResult:
        task_id = await self.submit(prompt, image_path, **kwargs)
        elapsed = 0
        while elapsed < max_wait:
            result = await self.poll(task_id)
            if result is not None:
                return result
            await asyncio.sleep(poll_interval)
            elapsed += poll_interval
        raise TimeoutError(
            f"Video generation timed out after {max_wait}s (task_id={task_id})"
        )


class AudioProvider(ABC):
    @abstractmethod
    async def generate(
        self,
        text: str,
        voice: str = "",
        emotion: str = "",
        emotion_strength: float = 0.2,
        speed: float = 1.0,
        output_path: str = "",
        **kwargs,
    ) -> AudioResult: ...

    async def clone_voice(self, reference_audio: str, voice_name: str = "") -> str:
        raise NotImplementedError("Voice cloning not supported by this provider")
