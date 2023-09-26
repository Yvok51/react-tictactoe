use actix_web::middleware::Logger;
use actix_web::{web, App, HttpServer};
use sqlx::SqlitePool;

mod handlers;
mod model;
mod schema;

struct AppState {
    db_pool: SqlitePool,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    if std::env::var_os("RUST_LOG").is_none() {
        std::env::set_var("RUST_LOG", "actix_web=info");
    }
    dotenv::dotenv().ok();
    env_logger::init();

    let database_url = std::env::var("DATABASE_URL").expect("'DATABASE_URL' must be set");
    let pool = match SqlitePool::connect(&database_url).await {
        Ok(pool) => pool,
        Err(err) => {
            eprintln!("{err}");
            std::process::exit(1);
        }
    };

    HttpServer::new(move || {
        // let cors = Cors::default();
        App::new()
            .app_data(web::Data::new(AppState {
                db_pool: pool.clone(),
            }))
            .configure(handlers::config)
            // .wrap(cors)
            .wrap(Logger::default())
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
