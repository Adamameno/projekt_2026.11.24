import Database from "better-sqlite3";

const db = new Database("./database/users.db");

export function UserExists(username) {
    return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
}

export function findUsernameById(id) {
    return db.prepare("SELECT username FROM users WHERE id = ?").get(id);
}

export function Register(username, password) {
    return db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(username, password);
}