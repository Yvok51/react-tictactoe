#![allow(non_snake_case)]

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
    pub turn: String,
    pub xCoord: i32,
    pub yCoord: i32,
}
