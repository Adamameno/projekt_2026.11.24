import Database from "better-sqlite3";

const db = new Database("./database/images.db");

export function UploadImage(filename, message, id) {
    return db.prepare("INSERT INTO images (filename, message, userId) VALUES (?, ?, ?)").run(filename, message, id);
}

export function GetAllImages() {
    try {
        db.prepare("ATTACH DATABASE './database/users.db' AS userdb").run();

        const result = db.prepare(`
            SELECT images.id AS "id", images.filename AS "src", images.message AS "message",  userdb.users.username AS "username"
            FROM images 
            INNER JOIN userdb.users ON images.userId = userdb.users.id
            `).all();

        db.prepare("DETACH DATABASE userdb").run();


        return result;
    } catch (error) {
        try { db.prepare("DETACH DATABASE userdb").run(); } catch (e) {}
        return [];
    }
}

export function GetUserImages(username) {
    try {
        db.prepare("ATTACH DATABASE './database/users.db' AS userdb").run();

        const result = db.prepare(`
            SELECT images.id AS "id", images.filename AS "src", images.message AS "message",  userdb.users.username AS "username"
            FROM images 
            INNER JOIN userdb.users ON images.userId = userdb.users.id
            WHERE userdb.users.username = ?
            `).all(username);

        db.prepare("DETACH DATABASE userdb").run();


        return result;
    } catch (error) {
        try { db.prepare("DETACH DATABASE userdb").run(); } catch (e) {}
        return [];
    }
}

export function EditUserImages(id, editedMessage) {
    return db.prepare("UPDATE images SET message = ? WHERE id = ?").run(editedMessage, id)
}

export function FindByIdUserId(id, userId) {
    return db.prepare("SELECT * FROM images WHERE id = ? AND userId = ?").get(id, userId)
}

export function DeleteImage(id) {
    const filename = db.prepare("SELECT filename FROM images WHERE id = ?").get(id);
    db.prepare("DELETE from images WHERE id = ?").run(id)
    return filename["filename"];
}

export function GetMessageById(id) {
    return db.prepare("SELECT message FROM images WHERE id = ?").get(id)
}