import { use, useEffect, useState } from "react";
import type { User } from "../types/User";
import { apiClient, BASE_URL } from "../api/Api";
import type { Post } from "../types/Post";
import { Button, Card, Row } from "react-bootstrap";

function App() {

    const [posts, setPosts] = useState<User[]>([]);
    const [username, setUsername] = useState<string>();

    useEffect(() => {
        apiClient.get("/username")
        .then((res) => setUsername(res.data["username"]))
        .catch()


        apiClient.get("/")
        .then((res) => {
            const newUsers : User[] = [];
            let newPost : Post[] = [];
            let actualUser = "";

            res.data.forEach((x: any) => {
                if (actualUser != x.username) {
                    if (actualUser != "") {
                        newUsers.push({
                            username: actualUser,
                            post: newPost
                        });
                    }
                    actualUser = x.username;
                    newPost = []
                }
                newPost.push({
                    id: x.id,
                    image: x.src,
                    message: x.message
                })
            })
            
            newUsers.push({
                username: actualUser,
                post: newPost
            });

            setPosts(newUsers);
        })
    }, [])

    function generateCard(post : Post, username: string) {
        return (
                <Card style={{width: "10rem", margin: "20px"}}>
                    <Card.Img src={BASE_URL+"/images/"+post.image} width="100px"></Card.Img>
                    <Card.Body>
                        <Card.Title>{post.message}</Card.Title>
                    </Card.Body>
                    <Card.Footer>
                        <p>By: <a href={`http://localhost:5173/profile/${username}`}>{username}</a></p>
                    </Card.Footer>
                </Card>
        )
    }

    function generateMenubox() {
        if (username == undefined) {
            return (
                <div className="DIV_menubox">
                    <Button onClick={() => window.location.href = "/register"} variant="info" className="BUTTON_registration">Registration</Button>
                    <Button onClick={() => window.location.href = "/login"} variant="success" className="BUTTON_login">Log in</Button>
                </div>
            )
        } else {
        return (
                <div className="DIV_menubox">
                    <Button onClick={() => window.location.href = "/profile/"+username} variant="secondary" className="BUTTON_profile">My profile</Button>
                    <Button onClick={() => window.location.href = "/logout"} variant="danger" className="BUTTON_logout">Log out</Button>
                </div>
            )
        }
    }


    return (
        <>
         {generateMenubox()}
         <Row>
            {posts.map((x) => {
                return x.post.map((y) => generateCard(y, x.username))
            })}
         </Row>

        </>
   

    )
}

export default App;