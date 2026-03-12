# API Audit Report

> Generated: 2026-03-12
> Backend: FastAPI at `packages/backend/src/manga_drama/`
> PRD Reference: Section 6 (API Design)

---

## Existing Endpoints (what's already implemented)

All implemented endpoints are mounted under `/api/v1` via `api_router` in `routes/__init__.py`.

### Health

| Method | Path | Status |
|--------|------|--------|
| GET | `/api/v1/health` | Implemented — returns `{"status": "ok"}` |

### Projects (`routes/projects.py`)

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/v1/projects` | Create. Returns only `{id, title}` — no full object |
| GET | `/api/v1/projects` | List. Returns `{id, title, status, genre}` only — **missing** progress, episode count, budget, storage |
| GET | `/api/v1/projects/{id}` | Detail. Returns core fields + model config — **missing** `character_model`, `storyboard_model`, `voice_model`, `budget_limit`, `default_panel_count` in response |
| PUT | `/api/v1/projects/{id}` | Update. `ProjectUpdate` schema covers model config fields. Returns only `{id, title}` |
| DELETE | `/api/v1/projects/{id}` | Implemented |

### Characters (`routes/characters.py`)

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/v1/projects/{id}/characters` | Create. Missing `archetype`, `costume_tier`, `visual_keywords` in `CharacterCreate` schema |
| GET | `/api/v1/projects/{id}/characters` | List. Returns `{id, name, role_level, gender}` only — thin response |
| PUT | `/api/v1/characters/{id}` | Update. Uses raw `dict` body — no Pydantic validation |
| POST | `/api/v1/characters/{id}/appearances` | Create appearance |
| GET | `/api/v1/characters/{id}/appearances` | List appearances. Returns `{id, label, description}` only — missing `prompt_modifier`, `sort_order`, `selected_image_id` |
| DELETE | `/api/v1/characters/{id}` | **Not implemented** |

### Scenes (`routes/scenes.py`)

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/v1/projects/{id}/scenes` | Create. `SceneCreate` missing `floor_plan_ascii`, `lighting_preset`, `color_palette`, `spatial_structure`, `view_grade` |
| GET | `/api/v1/projects/{id}/scenes` | List. Returns `{id, name, view_grade}` only |
| PUT | `/api/v1/scenes/{id}` | **Not implemented** |
| DELETE | `/api/v1/scenes/{id}` | **Not implemented** |
| POST | `/api/v1/scenes/{id}/views` | Create view. `SceneViewCreate` missing `selected_image_id` |
| GET | `/api/v1/scenes/{id}/views` | List views. Returns `{id, direction, description}` — missing `selected_image_id` |
| PUT | `/api/v1/scenes/{id}/views/{view_id}` | **Not implemented** |
| DELETE | `/api/v1/scenes/{id}/views/{view_id}` | **Not implemented** |

### Episodes (`routes/episodes.py`)

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/v1/projects/{id}/episodes` | Create |
| GET | `/api/v1/projects/{id}/episodes` | List. Returns `{id, episode_number, title, status}` — missing panel count, duration estimate |
| GET | `/api/v1/episodes/{id}` | Detail. Returns `{id, episode_number, title, script_content, status}` — missing entity highlighting data, word count, panel count |
| PUT | `/api/v1/episodes/{id}` | Update. Uses raw `dict` — no Pydantic validation |
| DELETE | `/api/v1/episodes/{id}` | **Not implemented** |

### Panels

**Entire route file does not exist.** No panel endpoints are implemented at all.

### Props

**Entire route file does not exist.** No prop or prop state endpoints are implemented at all.

### Pipeline / Runs

**Entire route file does not exist.** No pipeline run, step, event, or gate endpoints are implemented.

### Provider Settings

**Entire route file does not exist.** No settings or provider configuration endpoints exist.

---

## Missing Endpoints (grouped by frontend page)

### Page 1: Project List (`/projects`)

The list endpoint returns only 4 fields. The frontend card needs aggregated data.

| Method | Path | Request | Response | Why Needed |
|--------|------|---------|----------|------------|
| GET | `/api/v1/projects` | — | Add `episode_count`, `panel_count`, `budget_limit`, `budget_spent`, `storage_bytes`, `created_at`, `updated_at` to each project object | Progress bar, budget display, storage indicator on project card |

Implementation note: `budget_spent` requires a `SUM(cost)` across `media_objects` per project. `episode_count` and `panel_count` require subquery aggregations. Recommend a dedicated `ProjectListItem` Pydantic schema with computed fields.

---

### Page 2: Project Dashboard (`/projects/:id`)

The existing GET `/api/v1/projects/{id}` is missing embedded sub-resources.

| Method | Path | Request | Response | Why Needed |
|--------|------|---------|----------|------------|
| GET | `/api/v1/projects/{id}` (extend) | — | Add `episodes[]` (with `status`, `panel_count`, `progress_pct`), `recent_runs[]` (last 3 pipeline runs), `budget_limit`, `budget_spent`, `character_count`, `scene_count`, `prop_count` | Dashboard stats, episode list, activity feed, budget widget |

---

### Page 3: Project Setup (`/projects/:id/setup`)

GET endpoint missing `character_model`, `storyboard_model`, `voice_model`, `budget_limit`, `default_panel_count`, `output_width`, `output_height`, `global_prefix` from its response.

| Method | Path | Request | Response | Why Needed |
|--------|------|---------|----------|------------|
| GET `/api/v1/projects/{id}` (extend) | — | Add all omitted model config fields and output config fields to response | Per-step model selectors, canvas size config, budget limit input |
| PUT `/api/v1/projects/{id}` (already exists) | Add `budget_limit`, `default_panel_count`, `output_width`, `output_height`, `global_prefix` to `ProjectUpdate` schema | — | Save button on setup page needs to persist all config |

---

### Page 4: Asset Warehouse (`/projects/:id/assets`)

This is the largest gap. Props have zero API coverage. Character and scene routes are missing update/delete and return thin response objects.

**Characters (missing):**

| Method | Path | Request | Response | Why Needed |
|--------|------|---------|----------|------------|
| GET `/api/v1/projects/{id}/characters` (extend) | — | Return full character object: all fields including `archetype`, `costume_tier`, `visual_keywords`, `lora_model_path`, `face_embedding_path`, `voice_preset_id`, `seed_value`, plus nested `appearances[]` | Character card needs full data to render |
| GET | `/api/v1/characters/{id}` | — | Full character detail with nested appearances and their `selected_image_id` media URLs | Character detail/edit drawer |
| DELETE | `/api/v1/characters/{id}` | — | `{"deleted": true}` | Delete button on character card |
| PUT `/api/v1/characters/{id}` (exists but broken) | Typed `CharacterUpdate` Pydantic schema (currently raw `dict`) | Full character object | Replace `dict` body — no validation currently |
| PUT | `/api/v1/characters/{id}/appearances/{app_id}` | `{label, description, prompt_modifier, sort_order}` | Updated appearance object | Edit appearance form |
| DELETE | `/api/v1/characters/{id}/appearances/{app_id}` | — | `{"deleted": true}` | Remove appearance state |
| POST | `/api/v1/characters/{id}/generate-image` | `{appearance_id, image_type: "fullbody"/"three_view"/"expression", model_override?}` | `{media_object_id, status: "queued"}` | Generate ref image button |

**Scenes (missing):**

| Method | Path | Request | Response | Why Needed |
|--------|------|---------|----------|------------|
| GET | `/api/v1/scenes/{id}` | — | Full scene detail with nested `views[]` (including `selected_image_id`, media URL) | Scene detail/edit drawer |
| PUT | `/api/v1/scenes/{id}` | `{name?, description?, floor_plan_ascii?, lighting_preset?, color_palette?, spatial_structure?, view_grade?}` | Updated scene object | Edit scene form |
| DELETE | `/api/v1/scenes/{id}` | — | `{"deleted": true}` | Delete button on scene card |
| PUT | `/api/v1/scenes/{id}/views/{view_id}` | `{description?, selected_image_id?}` | Updated view object | Edit view description |
| DELETE | `/api/v1/scenes/{id}/views/{view_id}` | — | `{"deleted": true}` | Remove a view direction |
| POST | `/api/v1/scenes/{id}/views/generate` | `{direction: "N"/"S"/"E"/"W", model_override?}` | `{media_object_id, status: "queued"}` | Generate scene view image button |

**Props (entirely missing — no route file exists):**

| Method | Path | Request | Response | Why Needed |
|--------|------|---------|----------|------------|
| POST | `/api/v1/projects/{id}/props` | `{name, name_en?, category, prop_level, description, size_reference?, owner_character_id?, visual_keywords?}` | `{id, name, category}` | Create prop |
| GET | `/api/v1/projects/{id}/props` | — | `[{id, name, category, prop_level, states[]}]` | Prop list in asset warehouse |
| GET | `/api/v1/props/{id}` | — | Full prop with nested `states[]` | Prop detail/edit drawer |
| PUT | `/api/v1/props/{id}` | `{name?, description?, category?, prop_level?, visual_keywords?, ...}` | Updated prop | Edit prop form |
| DELETE | `/api/v1/props/{id}` | — | `{"deleted": true}` | Delete prop |
| POST | `/api/v1/props/{id}/states` | `{label, description, sort_order?}` | `{id, label}` | Add prop state |
| GET | `/api/v1/props/{id}/states` | — | `[{id, label, description, selected_image_id, sort_order}]` | List prop states |
| PUT | `/api/v1/props/{id}/states/{state_id}` | `{label?, description?, sort_order?}` | Updated state | Edit state form |
| DELETE | `/api/v1/props/{id}/states/{state_id}` | — | `{"deleted": true}` | Remove state |
| POST | `/api/v1/props/{id}/generate-image` | `{state_id, model_override?}` | `{media_object_id, status: "queued"}` | Generate prop image button |

---

### Page 5: Script Editor (`/projects/:id/episodes/:eid/script`)

| Method | Path | Request | Response | Why Needed |
|--------|------|---------|----------|------------|
| GET `/api/v1/episodes/{id}` (extend) | — | Add `word_count`, `estimated_duration_s`, `project_id` to response | Word count and duration stats in editor toolbar |
| GET | `/api/v1/projects/{id}/entity-map` | — | `{characters: [{id, name, name_en}], scenes: [{id, name}], props: [{id, name}]}` | Entity highlighting — frontend needs a lookup table to highlight character/scene/prop names in the script text |

---

### Page 6: Storyboard Editor (`/projects/:id/episodes/:eid/storyboard`)

**Panel routes are entirely missing — no route file exists.**

| Method | Path | Request | Response | Why Needed |
|--------|------|---------|----------|------------|
| POST | `/api/v1/episodes/{eid}/panels` | `{panel_number, title?, shot_type, camera_angle, camera_movement, duration, action, atmosphere, emotion, dialogue, narration, acting_notes, scene_type, visible_set_elements, lighting_direction, image_prompt, video_prompt, video_mode, characters, props, scene_id, scene_view_direction, is_insert_shot?, insert_type?}` | Full panel object | Create panel |
| GET | `/api/v1/episodes/{eid}/panels` | — | `[{...all panel fields, selected_image_url?, selected_video_url?}]` ordered by `panel_number` | Panel grid view |
| GET | `/api/v1/panels/{id}` | — | Full panel with `voice_lines[]` and resolved media URLs | Panel detail sidebar |
| PUT | `/api/v1/panels/{id}` | Any subset of panel fields | Updated panel | Edit panel fields inline |
| DELETE | `/api/v1/panels/{id}` | — | `{"deleted": true}` | Delete panel |
| POST | `/api/v1/panels/{id}/insert-after` | `{...panel fields}` | New panel with `panel_number = floor + 0.5` between current and next | Insert panel button (fractional numbering) |
| POST | `/api/v1/panels/{id}/voice-lines` | `{character_id?, speaker_name, dialogue, emotion, emotion_strength, voice_preset_id?, sort_order?}` | `{id, speaker_name, dialogue}` | Add voice line |
| GET | `/api/v1/panels/{id}/voice-lines` | — | `[{id, character_id, speaker_name, dialogue, emotion, emotion_strength, voice_preset_id, selected_media_id, sort_order}]` | Voice line list in panel sidebar |
| PUT | `/api/v1/panels/{id}/voice-lines/{vl_id}` | `{dialogue?, emotion?, emotion_strength?, sort_order?}` | Updated voice line | Edit voice line |
| DELETE | `/api/v1/panels/{id}/voice-lines/{vl_id}` | — | `{"deleted": true}` | Remove voice line |
| POST | `/api/v1/panels/{id}/generate-image` | `{model_override?}` | `{media_object_id, status: "queued"}` | Generate storyboard image |
| POST | `/api/v1/panels/{id}/regenerate-image` | `{model_override?}` | `{media_object_id, status: "queued"}` | Re-generate image (creates new version, old becomes candidate) |
| POST | `/api/v1/panels/{id}/generate-lastframe` | `{model_override?}` | `{media_object_id, status: "queued"}` | Generate tail frame (first_last mode only) |
| POST | `/api/v1/panels/{id}/generate-video` | `{model_override?, tool_override?}` | `{media_object_id, status: "queued"}` | Generate video for panel |
| POST | `/api/v1/panels/{id}/regenerate-video` | `{model_override?}` | `{media_object_id, status: "queued"}` | Re-generate video |
| POST | `/api/v1/panels/{id}/generate-voice` | `{voice_line_id}` | `{media_object_id, status: "queued"}` | Generate TTS for a voice line |
| POST | `/api/v1/panels/{id}/generate-lipsync` | `{video_media_id, audio_media_id}` | `{media_object_id, status: "queued"}` | Lip-sync generation |
| POST | `/api/v1/panels/{id}/undo-regenerate` | `{media_type: "image"/"video"}` | `{restored_media_object_id}` | Undo last regeneration (version chain rollback) |
| GET | `/api/v1/panels/{id}/candidates` | `?media_type=image\|video` | `[{media_object_id, url, is_selected, version, created_at}]` | Candidate media gallery in panel sidebar |
| POST | `/api/v1/panels/{id}/select-candidate` | `{media_object_id, media_type: "image"/"video"}` | `{"selected": true}` | Select best candidate from gallery |

---

### Page 7: Pipeline Monitor (`/projects/:id/pipeline`)

**No pipeline route file exists at all.**

| Method | Path | Request | Response | Why Needed |
|--------|------|---------|----------|------------|
| POST | `/api/v1/runs` | `{project_id, episode_id?, workflow_type: "full_episode"/"regenerate_image"/..., target_type?, target_id?, input_data?}` | `{run_id, status: "pending"}` | Start pipeline button |
| GET | `/api/v1/runs/{id}` | — | `{id, status, workflow_type, total_cost, started_at, completed_at, steps: [{step_key, agent_type, status, retry_count, started_at, completed_at, attempts[]}]}` | Run status poll |
| POST | `/api/v1/runs/{id}/cancel` | — | `{cancelled: true}` | Cancel button |
| GET | `/api/v1/runs/{id}/stream` | — | SSE stream: `data: {seq, event_type, payload}\n\n` | Real-time step progress updates |
| GET | `/api/v1/runs/{id}/events` | `?afterSeq=N` | `[{seq, event_type, payload, created_at}]` | Polling fallback for SSE |
| POST | `/api/v1/gates/{gate_id}/decision` | `{decision: "approve"/"reject", feedback?: string, regeneration_targets?: [{panel_id, media_type}]}` | `{accepted: true, run_id}` | Gate 1-4 approve/reject buttons |
| GET | `/api/v1/projects/{id}/runs` | — | `[{id, status, workflow_type, total_cost, created_at}]` | Run history list on pipeline page |

---

### Page 8: Provider Settings (`/settings/providers`)

**No settings route file exists at all.**

| Method | Path | Request | Response | Why Needed |
|--------|------|---------|----------|------------|
| GET | `/api/v1/settings/providers` | — | `[{name, provider_type, base_url, default_model, is_enabled, has_api_key}]` — **never** return the raw API key | Provider list cards |
| PUT | `/api/v1/settings/providers/{name}` | `{base_url?, default_model?, api_key?, is_enabled?}` | Updated provider object (without api_key in response) | Save provider config |
| POST | `/api/v1/settings/providers/{name}/test` | — | `{ok: bool, latency_ms?: int, error?: string}` | Test connection button |

Note: Provider config needs to be persisted somewhere. Currently no `providers` table or config store exists in any model. Two options: (a) add a `ProviderConfig` table, or (b) read/write from an encrypted environment file. Option (a) is cleaner for the API.

---

## Model Gaps (fields missing from existing models)

### Project model — response gaps only (model fields exist)

The `GET /api/v1/projects/{id}` handler at line 58-71 omits these fields that **do exist** on the model:

- `character_model` — needed by Project Setup page
- `storyboard_model` — needed by Project Setup page
- `voice_model` — needed by Project Setup page
- `budget_limit` — needed by Project Setup and Dashboard pages
- `default_panel_count` — needed by Project Setup page
- `output_width` / `output_height` — needed by Project Setup page
- `global_prefix` — needed by Project Setup page
- `created_at` / `updated_at` — needed by Project List page

The `ProjectUpdate` schema (lines 21-32) is also missing: `budget_limit`, `default_panel_count`, `output_width`, `output_height`, `global_prefix`. These fields exist on the model but cannot be updated through the API.

### Project model — true missing fields

| Field | Type | Reason |
|-------|------|--------|
| `budget_spent` | `Float, default=0.0` | Dashboard budget tracker. Could be a computed aggregate from `media_objects.cost` but a cached denormalized column avoids a full scan on every project list load. |
| `storage_bytes` | `Integer, nullable=True` | Project List storage indicator. Populated when media files are written to disk. |

### Character model — no missing fields

All PRD-specified fields are present: `archetype`, `costume_tier`, `visual_keywords`, `lora_model_path`, `face_embedding_path`, `voice_preset_id`, `seed_value`. The issue is the API does not expose them.

### CharacterAppearance model — no missing fields

`prompt_modifier`, `selected_image_id`, `sort_order` all exist on the model but are not returned by the list endpoint.

### Episode model — missing fields

| Field | Type | Reason |
|-------|------|--------|
| `synopsis` | `Text, default=""` | The pipeline takes a per-episode synopsis as input (PRD Stage 4). Currently there is nowhere to store it. |
| `estimated_duration_s` | `Float, nullable=True` | Script Editor duration display. Can be computed but useful to persist. |

### Panel model — no missing fields

The Panel model is complete and matches the PRD's 30+ field specification. No additions required.

### Scene model — no missing fields

All virtual set fields (`floor_plan_ascii`, `lighting_preset`, `color_palette`, `spatial_structure`) exist. The `SceneCreate` schema omits them but the model is correct.

### PropState model — missing `prompt_modifier` field

| Field | Type | Reason |
|-------|------|--------|
| `prompt_modifier` | `Text, default=""` | PRD section 3.2.3: each state needs its own prompt modifier for the state-specific image generation. Currently `PropState` only has `description`. |

### MediaObject model — missing `entity_id` / `entity_type` linkage

The `MediaObject` has a `purpose` string (e.g. `"character_ref"`, `"scene_view"`) but no foreign key back to the entity it belongs to. This creates a lookup problem:

| Field | Type | Reason |
|-------|------|--------|
| `entity_type` | `String(30), nullable=True` | e.g. `"character_appearance"`, `"scene_view"`, `"prop_state"`, `"panel"` |
| `entity_id` | `Integer, nullable=True` | FK-style reference (polymorphic pattern) to the owning row |

Without this, to fetch all images for a character appearance you must filter by `purpose` and `project_id` with no direct join — fragile and slow.

### PipelineRun model — missing `gate_id` for Gate decisions

Gate decisions are submitted as `POST /api/v1/gates/{gate_id}/decision` but there is no `gates` table or `gate_id` field anywhere. The `PipelineRun` and `PipelineStep` models need a way to track which steps are gate checkpoints and their decision state.

Recommended addition to `PipelineStep`:

| Field | Type | Reason |
|-------|------|--------|
| `is_gate` | `Boolean, default=False` | Marks a step as a Gate checkpoint |
| `gate_decision` | `String(10), nullable=True` | `"approve"` / `"reject"` |
| `gate_feedback` | `Text, nullable=True` | User feedback text on reject |

### Missing: ProviderConfig model

No model exists for provider configuration. Required for the Provider Settings page.

```
ProviderConfig table:
  id            Integer PK
  name          String(50) unique   -- "openrouter", "seedream", "kling", etc.
  provider_type String(20)          -- text/image/video/audio
  base_url      String(500)
  api_key_enc   Text                -- encrypted; never returned in API responses
  default_model String(100)
  is_enabled    Boolean default=True
  created_at / updated_at
```

---

## Recommended API Changes (for frontend support)

### 1. Standardize response schemas with Pydantic response models

Currently most handlers return raw dicts or use unvalidated `dict` bodies. Every route should declare a `response_model` and typed request schema. This prevents silent omissions (like the Project GET missing 7 fields that are on the model).

Priority files: `projects.py`, `characters.py`, `episodes.py` — all need typed `UpdateSchema` and full `DetailSchema` response models.

### 2. Add `DELETE` to characters and episodes

Both are missing delete handlers despite the model having `cascade="all, delete-orphan"` set. Add:
- `DELETE /api/v1/characters/{id}`
- `DELETE /api/v1/episodes/{id}`

### 3. Replace raw `dict` update bodies

`characters.py` line 51 and `episodes.py` line 63 use `body: dict`. This bypasses validation and allows arbitrary field injection. Replace with typed Pydantic models.

### 4. Add `GET /api/v1/projects/{id}/entity-map`

Returns `{characters, scenes, props}` as lightweight lookup arrays for the Script Editor's entity highlighting. Avoids 3 separate API calls from the frontend.

### 5. Use consistent nesting for panels

The PRD specifies `GET /api/v1/episodes/{eid}/panels` (panels nested under episode). Keep this pattern — do not add panels as a top-level resource, as panels have no meaning outside their episode context.

### 6. SSE endpoint must use `StreamingResponse` or `EventSourceResponse`

The `GET /api/v1/runs/{id}/stream` SSE endpoint requires `fastapi-sse` or a raw `StreamingResponse` with `text/event-stream` content type. This is not available via a standard JSONResponse. Add `sse-starlette` to project dependencies.

### 7. Add `GET /api/v1/projects/{id}/runs` convenience endpoint

The pipeline monitor page needs to show recent runs for a project. The PRD specifies `GET /api/v1/runs/:id` for a single run but a project-scoped list is needed for the history sidebar.

### 8. Pagination

The `GET /api/v1/projects` and `GET /api/v1/episodes/{eid}/panels` endpoints will need `?limit=N&offset=N` query parameters before going to production. Projects and panels can grow large. Add this now while schemas are still being defined.

---

## Priority Order (which endpoints to implement first)

Ordered by frontend page unlock — each tier unblocks the next set of pages.

### Tier 1 — Unblocks Project List and Project Setup (implement in 1 day)

These are fixes to existing routes, not new files:

1. Extend `GET /api/v1/projects` response — add `episode_count`, `budget_limit`, `budget_spent`, `created_at`
2. Extend `GET /api/v1/projects/{id}` response — add all 7 missing model config fields
3. Extend `ProjectUpdate` schema — add `budget_limit`, `default_panel_count`, `output_width`, `output_height`, `global_prefix`
4. Add typed `CharacterUpdate` Pydantic schema to replace raw `dict` in `PUT /api/v1/characters/{id}`
5. Add `DELETE /api/v1/characters/{id}` and `DELETE /api/v1/episodes/{id}`

### Tier 2 — Unblocks Asset Warehouse (implement in 2-3 days)

New route file: `props.py`. Additions to `scenes.py` and `characters.py`:

6. Create `routes/props.py` — full CRUD for props and prop states (9 endpoints)
7. Add `GET /api/v1/characters/{id}` (single character detail)
8. Add `PUT /api/v1/scenes/{id}`, `DELETE /api/v1/scenes/{id}`
9. Add `PUT /api/v1/scenes/{id}/views/{view_id}`, `DELETE /api/v1/scenes/{id}/views/{view_id}`
10. Add `GET /api/v1/scenes/{id}` (single scene detail with views)
11. Extend character/scene/view list responses to include all model fields
12. Add `synopsis` field to `Episode` model + Alembic migration
13. Add `prompt_modifier` field to `PropState` model + migration
14. Add `entity_type` / `entity_id` to `MediaObject` model + migration

### Tier 3 — Unblocks Script Editor (implement in 0.5 days)

15. Extend `GET /api/v1/episodes/{id}` — add `word_count`, `estimated_duration_s`, `project_id`
16. Add `GET /api/v1/projects/{id}/entity-map`

### Tier 4 — Unblocks Storyboard Editor (implement in 2-3 days)

New route file: `panels.py` (highest endpoint count — ~18 endpoints):

17. Create `routes/panels.py` — full panel CRUD (POST, GET list, GET single, PUT, DELETE)
18. Add `POST /api/v1/panels/{id}/insert-after`
19. Add voice line CRUD (POST, GET, PUT, DELETE)
20. Add image/video/voice generation stubs (POST endpoints that return `{media_object_id, status: "queued"}` — actual generation can be a no-op initially)
21. Add `GET /api/v1/panels/{id}/candidates` and `POST /api/v1/panels/{id}/select-candidate`
22. Add `POST /api/v1/panels/{id}/undo-regenerate`

### Tier 5 — Unblocks Pipeline Monitor (implement in 2 days)

New route file: `runs.py`:

23. Create `routes/runs.py` — POST create run, GET single run, POST cancel, GET project runs
24. Add SSE streaming endpoint `GET /api/v1/runs/{id}/stream` with `sse-starlette`
25. Add `GET /api/v1/runs/{id}/events` polling fallback
26. Add `POST /api/v1/gates/{gate_id}/decision`
27. Add `is_gate`, `gate_decision`, `gate_feedback` to `PipelineStep` model + migration

### Tier 6 — Unblocks Provider Settings (implement in 1 day)

28. Create `ProviderConfig` SQLAlchemy model + migration
29. Create `routes/settings.py` — GET providers, PUT provider, POST test connection

---

## Summary Table

| Frontend Page | Endpoints Needed | Implemented | Missing | Blockers |
|---------------|-----------------|-------------|---------|----------|
| Project List | 1 (enhanced) | Partial | 4 response fields | Response schema |
| Project Dashboard | 1 (enhanced) | Partial | Episodes embed, stats | Response schema |
| Project Setup | 2 (GET+PUT enhanced) | Partial | 7 response fields, 5 update fields | Response schema |
| Asset Warehouse | ~25 | 7 partial | ~18 new + all props | Props route file, model gaps |
| Script Editor | 2 | 1 partial | 1 new endpoint | entity-map endpoint |
| Storyboard Editor | ~18 | 0 | 18 new | Entire panels route file |
| Pipeline Monitor | 7 | 0 | 7 new | Entire runs route file, SSE dep |
| Provider Settings | 3 | 0 | 3 new + model | ProviderConfig model + route file |
| **Total** | **~59** | **~11 partial** | **~48** | — |

Of the ~59 endpoint operations the PRD specifies, approximately 11 are partially implemented and ~48 are missing entirely. The most critical path for unblocking the frontend is: fix project response schemas (Tier 1) → add props routes (Tier 2) → add panels routes (Tier 4).
