# PostgreSQL Backend Schema

Version: 2.2.0  
Status: Canonical replacement contract

## 1. Schema conventions

- PostgreSQL is the only durable application database.
- Every table uses a UUID primary key unless a documented external identifier is required.
- Store timestamps as UTC `timestamptz`.
- Use `created_at`, `updated_at`; use `deleted_at` for soft-deletable PII records.
- Use enums or validated text values for state machines.
- Store flexible provider/configuration payloads in JSONB only when the structure is versioned and validated.
- Store media bytes outside PostgreSQL; store object key, checksum, size, MIME type, and retention metadata.
- Foreign keys and unique constraints enforce tenant and identity invariants.

## 2. Identity and tenancy

### users

`id, email_normalized, password_hash, display_name, role, status,
email_verified_at, require_password_change, last_login_at, created_at,
updated_at, deleted_at`

Roles: `student`, `company_admin`, `candidate`, `super_admin`.

### user_sessions

`id, user_id, token_hash, expires_at, revoked_at, last_seen_at, ip_hash,
user_agent_hash, created_at`

### auth_tokens

`id, user_id, token_hash, purpose, expires_at, consumed_at, attempt_count,
created_at`

Purpose: email verification, password reset, candidate invitation, or MFA.

### user_mfa

`id, user_id, method, secret_ciphertext, enabled_at, last_used_at, created_at`

### profiles

`id, user_id, avatar_asset_id, phone, date_of_birth, city, linkedin_url,
github_url, portfolio_url, bio, target_role, experience_level,
expected_salary, notice_period, remote_preference, shift_preference,
completeness_percent, visibility_policy, created_at, updated_at`

### education

`id, user_id, degree, institution, field, graduation_year, position, created_at,
updated_at`

### skills and user_skills

`skills(id, normalized_name, category)` and
`user_skills(user_id, skill_id, proficiency, years, position)`.

## 3. Companies and campaigns

### companies

`id, name, slug, status, primary_admin_user_id, created_at, updated_at,
deleted_at`

### company_members

`company_id, user_id, member_role, status, created_at, updated_at`.

Unique `(company_id, user_id)`.

### campaigns

`id, company_id, name, slug, job_role, experience_band, description,
status, deadline_at, published_at, closed_at, published_version,
created_by, created_at, updated_at`

### campaign_versions

`id, campaign_id, version, configuration_json, question_snapshot_json,
published_by, published_at, immutable_hash`

The version is referenced by every candidate attempt.

### campaign_rounds

`id, campaign_version_id, round_type, position, enabled, weight,
qualification_config_json, duration_seconds, settings_json, created_at`

Round types: `aptitude`, `coding`, `interview`.

### campaign_public_links

`id, campaign_id, public_token_hash, expires_at, status, created_at`

## 4. Resume and media

### media_assets

`id, owner_user_id, company_id, asset_type, storage_key, mime_type, size_bytes,
checksum, duration_seconds, storage_provider, retention_until, deletion_reason,
status, created_at, deleted_at`

Asset types include `resume`, `webcam`, `microphone`, `screen`, `avatar_output`,
`transcript_audio`, `report_pdf`, `whiteboard_snapshot`, `export_zip`, and
`proctoring_evidence`. Prep assets are owner-private. Cloudinary is the initial
provider, but provider details stay behind the storage adapter.

### resumes

`id, owner_user_id nullable, application_id nullable, media_asset_id, file_name,
extracted_text, status, retention_until, created_at, updated_at, deleted_at`

### resume_analyses

`id, resume_id, provider, model, prompt_version, status, ats_score,
overall_score, job_fit_score, summary, report_json, word_count, page_count,
attempt, error_code, error_message, started_at, completed_at, deleted_at,
created_at, updated_at`

The Resume worker owns this record. It extracts PDF/DOCX text, calls the
configured Gemini adapter, validates the structured report, persists scores and
report JSON, and records retry/error state without exposing provider payloads
to the browser. Retention cleanup deletes the analysis row with the resume.

## 5. Question bank and assessments

### aptitude_questions

`id, owner_company_id nullable, version, category, sub_topic, difficulty,
question_text, options_json, correct_option, explanation, status, created_at,
updated_at`

### coding_problems

`id, owner_company_id nullable, version, title, difficulty, problem_type,
statement_markdown, constraints_json, examples_json, signatures_json,
starter_code_json, visible_tests_json, hidden_tests_encrypted,
time_limit_ms, memory_limit_kb, sql_schema_json nullable, status, created_at,
updated_at`

Problem types: `dsa` and `sql`. SQL records may exist as content before the
Phase 3 runner is enabled, but cannot execute before that gate.

### assessment_attempts

`id, application_id nullable, user_id, campaign_version_id nullable, mode,
round_type, status, started_at, hard_deadline_at, submitted_at,
auto_submitted, failure_reason, idempotency_key, created_at, updated_at`

Modes: `prep` and `hiring`.

### aptitude_attempt_items

`id, attempt_id, question_id, position, selected_option, bookmarked,
answered_at, correct, score, explanation_snapshot_json`

### coding_attempt_items

`id, attempt_id, problem_id, position, language, draft_code, final_code,
source_hash, status, passed_count, total_count, score, submitted_at,
created_at, updated_at`

### code_runs

`id, attempt_id nullable, coding_attempt_item_id nullable, interview_session_id
nullable, language, runtime_version, source_hash, input_hash, status,
time_limit_ms, memory_limit_kb, network_disabled, passed_count, total_count,
runtime_ms, memory_kb, output_metadata_json, failure_code, created_at`

### code_reviews

`id, coding_attempt_item_id nullable, interview_session_id nullable, provider,
model, prompt_version, status, score, complexity_json, readability_json,
feedback_json, raw_result_json, created_at, updated_at`

## 6. Candidate applications and credentials

### applications

`id, campaign_id, applicant_user_id nullable, email_normalized, full_name,
phone, resume_id nullable, source, status, candidate_public_id, applied_at,
shortlisted_at, invited_at, created_at, updated_at`

Unique `(campaign_id, email_normalized)` and `(campaign_id, candidate_public_id)`.

### candidate_credentials

`id, application_id, candidate_login, password_hash, expires_at, last_login_at,
revoked_at, created_at, updated_at`

### candidate_round_states

`id, application_id, campaign_round_id, attempt_id nullable, state, unlocked_at,
completed_at, qualification_state, score_snapshot_json, created_at, updated_at`

## 7. Interview runtime

### interview_sessions

`id, user_id, application_id nullable, attempt_id, mode, interview_type,
status, state, target_duration_seconds, hard_deadline_at, current_question_id,
started_at, completed_at, emergency_reason, reconnect_deadline_at, created_at,
updated_at`

### interview_events

`id, session_id, event_id, sequence, event_type, payload_json, origin,
occurred_at, created_at`

Unique `(session_id, sequence)` and `(session_id, event_id)`.

### interview_questions

`id, session_id, sequence, parent_question_id nullable, question_type,
difficulty, topic, source, prompt_json, status, presented_at, completed_at,
decision_json, created_at`

### interview_turns

`id, session_id, question_id nullable, sequence, speaker, input_type, text,
audio_asset_id nullable, started_at, ended_at, metadata_json, created_at`

### interview_code_snapshots

`id, session_id, question_id nullable, language, code, source_hash, is_final,
created_at`

### interview_whiteboards

`id, session_id, question_id nullable, version, snapshot_asset_id nullable,
drawing_json, submitted_at, created_at`

### interview_evaluations

`id, session_id, question_id nullable, evaluation_type, provider, model,
prompt_version, score, result_json, status, created_at, updated_at`

### interview_reports

`id, session_id, status, report_version, report_json, pdf_asset_id nullable,
generated_at, error_code, created_at, updated_at`

## 8. Consent, proctoring, privacy

### consent_records

`id, user_id, application_id nullable, consent_type, capture_scope,
policy_version, accepted, accepted_at, withdrawn_at, ip_hash, user_agent_hash,
created_at`

Consent types include `ai_processing`, `storage`, `recording`, and
`proctoring`. Capture scope records the enabled webcam, microphone, screen, and
avatar-output streams. Browser permission state is recorded separately and is
never treated as AI/storage consent.

### system_checks

`id, application_id, browser_json, device_json, microphone_ok, camera_ok,
fullscreen_ok, network_ok, completed_at, created_at`

### proctoring_sessions

`id, attempt_id, mode, status, camera_enabled, microphone_enabled,
fullscreen_required, strike_count, integrity_score, policy_snapshot_json,
started_at, ended_at, created_at, updated_at`

### proctoring_events

`id, proctoring_session_id, event_type, severity, strike_weight, occurred_at,
metadata_json, evidence_asset_id nullable, review_state, reviewed_by nullable,
reviewed_at nullable, created_at`

### appeals

`id, application_id, attempt_id, submitted_by, reason, status, resolution,
resolved_by, resolved_at, created_at, updated_at`

## 9. Hiring decisions and operations

### selection_decisions

`id, application_id, decision, notes, version, decided_by, decided_at,
created_at, updated_at`

Decisions: `pending`, `selected`, `waitlisted`, `rejected`.

### offers

`id, application_id, status, role_title, department, level, work_mode,
office_location, start_date, annual_ctc, joining_bonus, equity, reporting_to,
validity_days, message, offer_asset_id, sent_at, delivery_status, created_by,
created_at, updated_at`

### notifications

`id, user_id, type, payload_json, read_at, delivery_status, created_at`

### jobs

`id, type, payload_json, idempotency_key, status, attempts, run_after,
locked_at, completed_at, last_error, created_at, updated_at`

### ai_usage_events

`id, user_id nullable, company_id nullable, feature, provider, model,
prompt_version, input_tokens, output_tokens, latency_ms, status, cost_metadata,
created_at`

### audit_logs

`id, actor_user_id nullable, actor_role, company_id nullable, action,
entity_type, entity_id, details_json, ip_hash, user_agent_hash, created_at`

### system_settings

`id, setting_key, value_json, value_version, sensitivity, updated_by,
updated_at`

Secrets are not stored as plaintext values here. Sensitive settings contain a
reference to environment/secret storage, never the raw provider key.

### feature_flags

`id, flag_key, enabled, rollout_json, version, updated_by, updated_at`

### health_checks

`id, component, status, latency_ms, checked_at, details_json, request_id,
triggered_by nullable, created_at`

Components include PostgreSQL, Redis if enabled, object storage, worker,
realtime service, AI providers, email adapter, and code runner. MongoDB is not a
component.

### data_requests

`id, requested_by, subject_user_id, company_id nullable, request_type,
status, legal_hold, requested_at, due_at, export_asset_id nullable, job_id
nullable, approved_by nullable, completed_at, created_at, updated_at`

Request types include export, deletion, and account lock. Export requests have
a seven-business-day due date. Deletion requests target database rows,
Cloudinary objects, transcripts, reports, embeddings, and derived AI metadata;
they must respect legal holds while preventing future model-training use.

## 10. Indexes and constraints

Required indexes include:

- `users(email_normalized)`
- `company_members(company_id, user_id)`
- `campaigns(company_id, status, deadline_at)`
- `applications(campaign_id, status, created_at)`
- `applications(candidate_public_id)`
- `assessment_attempts(application_id, round_type, status)`
- `proctoring_events(proctoring_session_id, occurred_at)`
- `interview_events(session_id, sequence)`
- `jobs(status, run_after)`
- `audit_logs(company_id, created_at)`
- `health_checks(component, checked_at)`
- `feature_flags(flag_key)`
- `data_requests(subject_user_id, status)`

Use foreign keys, check constraints, unique idempotency keys, and transaction
boundaries for publication, submission, qualification unlock, decision, and
offer sending.

## 11. Retention

The academic default is 30 days after the relevant Prep result is available for
Prep media and resume history. Retention durations remain configuration and are
never constants in UI code. Cleanup jobs must remove expired media, tokens,
evidence, resume history, derived AI data, and soft-deleted PII only after
legal/appeal holds are checked. User deletion requests must finish cross-store
purge within 30 days.
