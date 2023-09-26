-- Add up migration script here
CREATE TABLE IF NOT EXISTS games(
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL CHECK (length(title) > 0),
    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at DATETIME NOT NULL DEFAULT (datetime('now')),
    CHECK(updated_at >= created_at)
);

CREATE TABLE IF NOT EXISTS turns(
    id INTEGER PRIMARY KEY NOT NULL,
    game_id INTEGER NOT NULL,
    turn_order INTEGER NOT NULL,
    turn TEXT NOT NULL CHECK (turn IN ('O', 'X')),
    x_coord INTEGER NOT NULL CHECK (x_coord >= 0 AND x_coord < 3),
    y_coord INTEGER NOT NULL CHECK (y_coord >= 0 AND y_coord < 3),
    CONSTRAINT fk_game_id_turns FOREIGN KEY(game_id) REFERENCES games ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_game_id_turns ON turns (game_id);
