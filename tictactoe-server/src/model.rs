use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, sqlx::FromRow)]
pub struct GameModel {
    pub id: i64,
    pub title: String,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct GameResponse {
    pub id: i64,
    pub title: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct GameWithTurnsResponse {
    pub id: i64,
    pub title: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub turns: Vec<TurnResponse>,
}

// #[derive(Debug, Deserialize, Serialize)]
// #[serde(untagged)]
// pub enum Turn {
//     X,
//     O,
// }

#[derive(Debug, Deserialize, Serialize, sqlx::FromRow)]
pub struct TurnModel {
    pub id: i64,
    pub game_id: i64,
    pub turn_order: i64,
    pub turn: String,
    pub x_coord: i64,
    pub y_coord: i64,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TurnResponse {
    pub id: i64,
    pub turn_order: i64,
    pub turn: String,
    pub x_coord: i64,
    pub y_coord: i64,
}
