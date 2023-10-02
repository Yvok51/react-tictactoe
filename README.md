# TicTacToe

## Start up

### Backend

Install cargo and the sqlx cli application:

```sh
cargo install sqlx-cli
```

Change to the `tictactoe-server` directory and create the database:

```sh
cd tictactoe-server
sqlx database create
sqlx migrate run
```

Run the server:

```sh
cargo run
```

### Frontend

Change to the `frontend` directory, install the required libraries and run the development server.

```sh
cd frontend
npm install
npm run dev
```
