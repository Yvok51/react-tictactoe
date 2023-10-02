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
    let games = game_list(&data.db_pool).await;
    match games {
        Ok(responses) => HttpResponse::Ok().json(json_success(responses)),
        Err(err) => internal_error(err),
    }
}

async fn game_list(pool: &SqlitePool) -> Result<Vec<GameResponse>, sqlx::Error> {
    let games = sqlx::query_as!(GameModel, r#"SELECT * FROM games"#)
        .fetch_all(pool)
        .await?;
    Ok(games.iter().map(|g| filter_game_response(g)).collect())
}

#[post("/games/")]
async fn create_game_handle(
    body: web::Json<CreateGameSchema>,
    data: web::Data<AppState>,
) -> impl Responder {
    let res = create_game(&data.db_pool, body.into_inner()).await;
    match res {
        Ok(games) => HttpResponse::Created().json(json_success(games)),
        Err(sqlx::Error::Database(e)) => HttpResponse::BadRequest().json(json_error(e.message())),
        Err(err) => internal_error(err),
    }
}

async fn create_game(
    pool: &sqlx::SqlitePool,
    schema: CreateGameSchema,
) -> Result<GameWithTurnsResponse, sqlx::Error> {
    let transaction = pool.begin().await?;
    let game_id = sqlx::query!(r#"INSERT INTO games (title) VALUES (?1)"#, schema.title)
        .execute(pool)
        .await?
        .last_insert_rowid();

    add_turns(pool, game_id, schema.turns).await?;
    let res = get_game_with_turns(pool, game_id).await?;
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

    let update_game = sqlx::query!(
        "UPDATE games SET title = ?1, updated_at = (datetime('now')) WHERE id = ?2",
        schema.title,
        game_id
    )
    .execute(pool)
    .await?;
    if update_game.rows_affected() == 0 {
        return Err(sqlx::Error::RowNotFound);
    }
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
    let id = path.into_inner();
    let affected = delete_game(&data.db_pool, id).await;
    match affected {
        Ok(affected) if affected > 0 => HttpResponse::Ok().json(json_success(id)),
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

async fn add_turns(
    pool: &SqlitePool,
    game_id: i64,
    turns: Vec<CreateTurnSchema>,
) -> Result<(), sqlx::Error> {
    for (idx, turn) in turns.iter().enumerate() {
        let idx = idx as i32;
        sqlx::query!(
            r#"INSERT INTO turns (game_id, turn_order, turn, x_coord, y_coord) VALUES (?1, ?2, ?3, ?4, ?5)"#,
            game_id, idx, turn.turn, turn.xCoord, turn.yCoord
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
        r#"SELECT * FROM turns WHERE game_id = ?1 ORDER BY turn_order ASC"#,
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
        turnOrder: record.turn_order,
        turn: record.turn.clone(),
        xCoord: record.x_coord,
        yCoord: record.y_coord,
    }
}

fn filter_game_response(record: &GameModel) -> GameResponse {
    GameResponse {
        id: record.id,
        title: record.title.clone(),
        createdAt: record.created_at.and_utc(),
        updatedAt: record.updated_at.and_utc(),
    }
}

fn create_game_with_turns(record: GameModel, turns: Vec<TurnModel>) -> GameWithTurnsResponse {
    GameWithTurnsResponse {
        id: record.id,
        title: record.title,
        createdAt: record.created_at.and_utc(),
        updatedAt: record.updated_at.and_utc(),
        turns: turns.iter().map(|t| filter_turn_record(t)).collect(),
    }
}
