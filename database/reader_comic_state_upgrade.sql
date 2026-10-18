-- For a project that already applied the initial reader_accounts migration.
alter table public.reader_state drop constraint reader_state_key_check;
alter table public.reader_state add constraint reader_state_key_check check (
  key ~ '^catalyst_((page_i|pages_i|read_|comic_page_i|bookmarks_i|notes_i)[0-9]{1,4}|field_notes_v1|reader_scale|reader_focus|reader_theme|reader_fontsize|reader_layout|comic_theme|last_scene_idx|last_scene_title|choice_endings_v1)$'
);
