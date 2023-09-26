use crate::model::{GameModel, GameResponse, GameWithTurnsResponse, TurnModel, TurnResponse};
use crate::schema::{CreateGameSchema, CreateTurnSchema};
use crate::AppState;
use actix_web::{delete, get, post, put, web, HttpResponse, Responder};
use sqlx::SqlitePool;

pub fn config(conf: &mut web::ServiceConfig) {
    let scope = web::scope("/api")
        .service(game_list_handler)
        .service(create_game_handle)
        .service(get_game_handle)
        .service(update_game_handler)
        .service(delete_game_handler);
    conf.service(scope);
}

#[get("/games")]
async fn game_list_handler(data: web::Data<AppState>) -> impl Responder {
    let games = sqlx::query_as!(GameModel, r#"SELECT * FROM games"#)
        .fetch_all(&data.db_pool)
        .await;
    let filtered_games: Result<Vec<GameResponse>, sqlx::Error> =
        games.map(|games| games.iter().map(|g| filter_game_response(g)).collect());
    match filtered_games {
        Ok(responses) => HttpResponse::Ok().json(json_success(responses)),
        Err(err) => internal_error(err),
    }
}

#[post("/games/")]
async fn create_game_handle(
    body: web::Json<CreateGameSchema>,
    data: web::Data<AppState>,
) -> impl Responder {
    let transaction = data.db_pool.begin().await;
    if let Err(err) = transaction {
        return internal_error(err);
    }
    let res = add_game(&data.db_pool, body.into_inner()).await;
    if let Err(err) = res {
        return match err {
            sqlx::Error::Database(e) => HttpResponse::BadRequest().json(json_error(e.message())),
            _ => internal_error(err),
        };
    }
    let commit = transaction.unwrap().commit().await;
    match commit {
        Ok(_) => HttpResponse::Created().json(json_success(res.unwrap())),
        Err(err) => internal_error(err),
    }
}

#[get("/games/{id}")]
async fn get_game_handle(path: web::Path<i64>, data: web::Data<AppState>) -> impl Responder {
    let id = path.into_inner();

    let transaction = data.db_pool.begin().await;
    if let Err(err) = transaction {
        return internal_error(err);
    }
    let res = get_game_with_turns(&data.db_pool, id).await;
    if let Err(err) = res {
        return match err {
            sqlx::Error::RowNotFound => {
                HttpResponse::NotFound().json(json_error("Resource not found"))
            }
            _ => internal_error(err),
        };
    }
    let commit = transaction.unwrap().commit().await;

    match commit {
        Ok(_) => HttpResponse::Ok().json(json_success(res.unwrap())),
        Err(err) => internal_error(err),
    }
}

#[put("/games/{id}")]
async fn update_game_handler(
    path: web::Path<i64>,
    body: web::Json<CreateGameSchema>,
    data: web::Data<AppState>,
) -> impl Responder {
    let id = path.into_inner();
    let new_value = body.into_inner();

    let transaction = data.db_pool.begin().await;
    if let Err(err) = transaction {
        return internal_error(err);
    }

    let now = chrono::offset::Utc::now();
    let update_game = sqlx::query!(
        "UPDATE games SET title = ?1, updated_at = ?2 WHERE id = ?3",
        new_value.title,
        now,
        id
    )
    .fetch_one(&data.db_pool)
    .await;
    if let Err(err) = update_game {
        return match err {
            sqlx::Error::RowNotFound => {
                HttpResponse::BadRequest().json(json_error("Resource not found"))
            }
            _ => internal_error(err),
        };
    }

    let delete_turns_query = sqlx::query!("DELETE FROM turns WHERE game_id = ?1", id)
        .execute(&data.db_pool)
        .await;
    if let Err(err) = delete_turns_query {
        return internal_error(err);
    }
    let res = add_turns(&data.db_pool, id, new_value.turns).await;
    if let Err(err) = res {
        return internal_error(err);
    }
    let res = get_game_with_turns(&data.db_pool, id).await;
    if let Err(err) = res {
        return internal_error(err);
    }

    let commit = transaction.unwrap().commit().await;
    match commit {
        Ok(_) => HttpResponse::Ok().json(json_success(res.unwrap())),
        Err(err) => internal_error(err),
    }
}

#[delete("/games/{id}")]
async fn delete_game_handler(path: web::Path<i64>, data: web::Data<AppState>) -> impl Responder {
    let id = path.into_inner();
    let res = sqlx::query!("DELETE FROM games WHERE id = ?1", id)
        .execute(&data.db_pool)
        .await;
    if let Err(err) = res {
        return HttpResponse::InternalServerError().json(json_error(&format!("{:?}", err)));
    }
    let affected = res.unwrap().rows_affected();
    if affected > 0 {
        HttpResponse::NoContent().finish()
    } else {
        HttpResponse::BadRequest().json(json_error("Unknown id"))
    }
}

async fn add_game(
    pool: &SqlitePool,
    game: CreateGameSchema,
) -> Result<GameWithTurnsResponse, sqlx::Error> {
    let game_id = sqlx::query!(r#"INSERT INTO games (title) VALUES (?1)"#, game.title)
        .execute(pool)
        .await?
        .last_insert_rowid();

    add_turns(pool, game_id, game.turns).await?;
    get_game_with_turns(pool, game_id).await
}

async fn add_turns(
    pool: &SqlitePool,
    game_id: i64,
    turns: Vec<CreateTurnSchema>,
) -> Result<(), sqlx::Error> {
    for turn in turns {
        sqlx::query!(
            r#"INSERT INTO turns (game_id, turn_order, turn, x_coord, y_coord) VALUES (?1, ?2, ?3, ?4, ?5)"#,
            game_id, turn.turn_order, turn.turn, turn.x_coord, turn.y_coord
        )
        .execute(pool)
        .await?;
    }
    Ok(())
}

async fn get_game_with_turns(
    pool: &SqlitePool,
    game_id: i64,
) -> Result<GameWithTurnsResponse, sqlx::Error> {
    let game =
        sqlx::query_as!(GameModel, r#"SELECT * FROM games WHERE id = ?1"#, game_id).fetch_one(pool);
    let turns = sqlx::query_as!(
        TurnModel,
        r#"SELECT * FROM turns WHERE game_id = ?1"#,
        game_id
    )
    .fetch_all(pool);

    Ok(create_game_with_turns(game.await?, turns.await?))
}

fn internal_error(error: sqlx::Error) -> HttpResponse {
    HttpResponse::InternalServerError().json(json_error(&format!("{:?}", error)))
}

fn json_success<T: serde::Serialize>(data: T) -> serde_json::Value {
    serde_json::json!({"status": "success", "data": data})
}

fn json_error(message: &str) -> serde_json::Value {
    serde_json::json!({"status": "error", "message": message})
}

fn filter_turn_record(record: &TurnModel) -> TurnResponse {
    TurnResponse {
        id: record.id,
        turn_order: record.turn_order,
        turn: record.turn.clone(),
        x_coord: record.x_coord,
        y_coord: record.y_coord,
    }
}

fn filter_game_response(record: &GameModel) -> GameResponse {
    GameResponse {
        id: record.id,
        title: record.title.clone(),
        created_at: record.created_at.and_utc(),
        updated_at: record.updated_at.and_utc(),
    }
}

fn create_game_with_turns(record: GameModel, turns: Vec<TurnModel>) -> GameWithTurnsResponse {
    GameWithTurnsResponse {
        id: record.id,
        title: record.title,
        created_at: record.created_at.and_utc(),
        updated_at: record.updated_at.and_utc(),
        turns: turns.iter().map(|t| filter_turn_record(t)).collect(),
    }
}
