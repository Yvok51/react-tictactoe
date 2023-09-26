use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateGameSchema {
    pub title: String,
    pub turns: Vec<CreateTurnSchema>,
}

// #[derive(Debug, Deserialize, Serialize)]
// pub struct UpdateGameSchema {
//     pub title: String,
//     pub turns: Vec<CreateTurnSchema>,
// }

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateTurnSchema {
    pub turn_order: i32,
    pub turn: String,
    pub x_coord: i32,
    pub y_coord: i32,
}
