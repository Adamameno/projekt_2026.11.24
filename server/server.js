import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import multer from "multer"
import path from "path"
import cors from "cors"
import cookieParser from "cookie-parser"

import * as userControl from "./database/usersControl.js"
import * as imagesControl from "./database/imagesControl.js"

import { fileURLToPath } from 'url';
import { unlink } from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '../public'),
  filename: (req, file, cb) => cb(null, `${Date.now()}${file.originalname}`),
});

const UPLOAD = multer({ storage }); 
const SECRET_KEY = "koromrichard_richardkorom@vasvari.org67";


app.post("/register", async (req, res) => {
        const input = req.body;
        if (!input["username"] || !input["password"]) return res.status(400).json({"message": "All field must be filled!"});

        if (input["username"].length < 3) return res.status(400).json({"message":"Username needs to be at least 3 characters long!"})
        if (input["password"].length < 8) return res.status(400).json({"message":"Password needs to be at least 8 characters long!"})

        const testDb = userControl.UserExists(input["username"]);
        if (testDb) return res.status(409).json({"message":"Username already exists!"})

        const hashed = await bcrypt.hash(input["password"], 12);
        const db = userControl.Register(input["username"], hashed);
        return res.status(201).json({"message": "Successful login!"});
})

app.post("/login", async (req, res) => {

                const input = req.body;
                if (!input["username"] || !input["password"]) return res.status(400).json({"message": "All field must be filled!"});
                const found = userControl.UserExists(input["username"]);
                if (!found) return res.status(401).json({"message":"Wrong username or password!"})
                if (!(await bcrypt.compare(input["password"], found["password"]))) return res.status(401).json({ message: "Wrong username or password!"});
                const token = jwt.sign({ id: found["id"], username: found["username"] }, SECRET_KEY, { expiresIn: "1h" });
                res.cookie("jwt", token, { httpOnly: true });
                res.status(200).json({ "message": "The login was successful!" });

})

app.post("/logout", (req, res) => {
        res
        .cookie("jwt", "", { maxAge: 0 })
        .status(200)
        .json({ message: "Logout was successful!" });
});

/////////////////////////////////////////////

function loggedInByUsername(req, username) {
        try {
                const cookieToken = req.cookies["jwt"];
                if (!cookieToken) {
                        return undefined;
                }
                const decoded = jwt.verify(cookieToken, SECRET_KEY);
                if (decoded.username == username) return true;
                return false;
        } catch {
                return undefined
        }
}

function loggedInId(req) {
        try {
                const cookieToken = req.cookies["jwt"];
                if (!cookieToken) {
                        return undefined;
                }
                const decoded = jwt.verify(cookieToken, SECRET_KEY);
                return decoded.id;
        } catch {
                return undefined
        }
}

function loggedIn(req, res, next) {
        try {
                const cookieToken = req.cookies["jwt"];
                if (!cookieToken) {
                        return res.status(403).json({ "message": "Not authenticated." });
                }
                jwt.verify(cookieToken, SECRET_KEY);
                return next();
        } catch {
                return res.status(403).json({ "message": "Invalid or expired token." });
        }
}

app.get("/", (req, res) => {
        const result = imagesControl.GetAllImages();
        res.status(200).json(result)
})

app.get("/profile/:username", (req, res) => {
        if (!userControl.UserExists(req.params.username)) return res.status(404).json({"message": "User not found!"})
        const result = imagesControl.GetUserImages(req.params.username);
        if (!result || result.length == 0) return res.status(404).json({"message": "This user has no posts."})
        res.status(200).json(result);
})

app.get("/loggedin/:username", (req, res) => {
        return res.status(200).json({"result": loggedInByUsername(req, req.params.username)});
})

app.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;

  const filePath = path.join(__dirname, '../public', filename);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({"message": "Image not found!"});
    }
  });
});


app.post("/upload", loggedIn, UPLOAD.single('image'), async (req, res) => {
        try {
                const filePath = path.join(__dirname, '../public', req.file.filename);

                const message = req.body.message;
                if (!message) {
                        await unlink(filePath);
                        return res.status(400).json({"message" : "Message needs to be filled!"})
                }
                const file = req.file;
                const id = loggedInId(req);
                const db = imagesControl.UploadImage(file.filename, message, id);
                if (!db) {
                        await unlink(filePath);
                        return res.status(500).json({"message" : "Something went wrong."})
                }
                res.status(201).json({  "message": 'The upload was succesful!'});
        } catch {
                if (req.file && req.file.path) {
                try {
                        await unlink(filePath);
                        return res.status(500).json({"message" : "Something went wrong."})
                } catch {return res.status(500).json({"message" : "Something went wrong."})}
        }
        }

})

app.delete("/delete/:id", loggedIn, async (req, res) => {
        try {
                if (!imagesControl.FindByIdUserId(req.params.id, loggedInId(req))) return res.status(404).json({"message": "Post not found."})
                const filename = imagesControl.DeleteImage(req.params.id)
                try {
                        const filePath = path.join(__dirname, '../public', filename);
                        await unlink(filePath);
                } catch {}

                res.status(200).json({"message": "The post has been deleted!"})
        } catch {
                res.status(500).json({"message": "Something went wrong."})
        }


})

app.get("/posts/:id", (req, res) => {
        try {
                const message = imagesControl.GetMessageById(req.params.id)
                res.status(200).json(message)
        } catch {
                res.status(500).json({"message": "Something went wrong."})
        }
})

app.patch("/posts/:id", loggedIn, (req, res) => {
        try {
                if (!imagesControl.FindByIdUserId(req.params.id, loggedInId(req))) return res.status(404).json({"message": "Post not found."})
                const {message} = req.body;
                imagesControl.EditUserImages(req.params.id, message);
                res.status(204).end()
        } catch {
                res.status(500).json({"message": "Something went wrong."})
        }
})

app.get("/username", (req, res) => {
        try {
                const id = loggedInId(req);
                return res.status(200).json(userControl.findUsernameById(id));
        } catch {res.status(500).json({"message": "Something went wrong."})}
})

app.listen(PORT, () => console.log("Server is running on port: "+PORT));