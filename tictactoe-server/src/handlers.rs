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
    let res = create_game(&data.db_pool, body.into_inner()).await;
    match res {
        Ok(_) => HttpResponse::Created().json(json_success(res.unwrap())),
        Err(sqlx::Error::Database(e)) => HttpResponse::BadRequest().json(json_error(e.message())),
        Err(err) => internal_error(err),
    }
}

async fn create_game(
    pool: &sqlx::SqlitePool,
    schema: CreateGameSchema,
) -> Result<GameWithTurnsResponse, sqlx::Error> {
    let transaction = pool.begin().await?;
    let res = add_game(pool, schema).await?;
    transaction.commit().await?;
    Ok(res)
}

#[get("/games/{id}")]
async fn get_game_handle(path: web::Path<i64>, data: web::Data<AppState>) -> impl Responder {
    let res = get_game(&data.db_pool, path.into_inner()).await;
    match res {
        Ok(_) => HttpResponse::Ok().json(json_success(res.unwrap())),
        Err(sqlx::Error::RowNotFound) => {
            HttpResponse::NotFound().json(json_error("Resource not found"))
        }
        Err(err) => internal_error(err),
    }
}

async fn get_game(pool: &SqlitePool, game_id: i64) -> Result<GameWithTurnsResponse, sqlx::Error> {
    let transaction = pool.begin().await?;
    let res = get_game_with_turns(pool, game_id).await?;
    transaction.commit().await?;
    Ok(res)
}

#[put("/games/{id}")]
async fn update_game_handler(
    path: web::Path<i64>,
    body: web::Json<CreateGameSchema>,
    data: web::Data<AppState>,
) -> impl Responder {
    let res = update_game(&data.db_pool, path.into_inner(), body.into_inner()).await;
    match res {
        Ok(_) => HttpResponse::Ok().json(json_success(res.unwrap())),
        Err(sqlx::Error::RowNotFound) => {
            HttpResponse::BadRequest().json(json_error("Resource not found"))
        }
        Err(err) => internal_error(err),
    }
}

async fn update_game(
    pool: &SqlitePool,
    game_id: i64,
    schema: CreateGameSchema,
) -> Result<GameWithTurnsResponse, sqlx::Error> {
    let transaction = pool.begin().await?;

    let now = chrono::offset::Utc::now();
    let _update_game = sqlx::query!(
        "UPDATE games SET title = ?1, updated_at = ?2 WHERE id = ?3",
        schema.title,
        now,
        game_id
    )
    .fetch_one(pool)
    .await?;
    let _delete_turns_query = sqlx::query!("DELETE FROM turns WHERE game_id = ?1", game_id)
        .execute(pool)
        .await?;
    add_turns(pool, game_id, schema.turns).await?;
    let res = get_game_with_turns(pool, game_id).await?;
    transaction.commit().await?;
    Ok(res)
}

#[delete("/games/{id}")]
async fn delete_game_handler(path: web::Path<i64>, data: web::Data<AppState>) -> impl Responder {
    let affected = delete_game(&data.db_pool, path.into_inner()).await;
    match affected {
        Ok(affected) if affected > 0 => HttpResponse::NoContent().finish(),
        Ok(_) => HttpResponse::BadRequest().json(json_error("Unknown id")),
        Err(err) => internal_error(err),
    }
}

async fn delete_game(pool: &SqlitePool, game_id: i64) -> Result<u64, sqlx::Error> {
    let res = sqlx::query!("DELETE FROM games WHERE id = ?1", game_id)
        .execute(pool)
        .await?;
    Ok(res.rows_affected())
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
