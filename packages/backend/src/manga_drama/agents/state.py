from typing import TypedDict


class DramaState(TypedDict, total=False):
    project_id: int
    episode_id: int | None
    run_id: str

    # Phase I
    global_setting: dict
    entities: dict
    character_assets: list[dict]
    scene_views: list[dict]
    prop_states: list[dict]

    # Phase II
    script: str
    panels: list[dict]
    voice_lines: list[dict]
    timing_sheet: dict

    # Phase III
    panel_images: dict[str, str]
    last_frame_images: dict[str, str]
    video_prompts: list[dict]
    panel_videos: dict[str, str]

    # Phase IV-V
    voice_clips: dict[str, str]
    lipsync_videos: dict[str, str]
    audio_mix_path: str
    final_video_path: str
    qa_report: dict

    # Control
    current_stage: str
    gate_decisions: dict[str, str]
    gate_feedback: dict[str, str]
    errors: list[dict]
    model_config: dict
