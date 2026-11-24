import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { apiClient, BASE_URL } from "../api/Api";
import { useParams } from "react-router-dom";

import type { User } from "../types/User";
import type {Post} from "../types/Post";
import { Button, Card, Row } from "react-bootstrap";

function Profile() {
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string>();
    const [post, setPost] = useState<User>();

    const [username, setUsername] = useState<string>();

    const formRef = useRef<HTMLDivElement>(null);
    const messageRef = useRef<HTMLHeadingElement>(null);

    const USERNAME = useParams().username;

    useEffect(() => {
        apiClient.get("/username")
            .then((res) => setUsername(res.data["username"]))
            .catch()
        LoadData();
    }, [])

    function Edit(id: number) {
        window.location.href = "/edit/"+id;
    }

    function generateCard(post : Post) {
        if (USERNAME == username) {
            return (
                <Card style={{width: "10rem", margin: "20px"}}>
                    <Button style={{position: "absolute", right: 0, top:0, color: "black"}} variant="danger" size="sm" className="border-dark" onClick={() => Delete(post.id)}>X</Button>
                    <Card.Img src={BASE_URL+"/images/"+post.image} width="100px"></Card.Img>
                    <Card.Body>
                        <Card.Title>{post.message}</Card.Title>
                    </Card.Body>
                    <Card.Footer>
                        <Button onClick={() => Edit(post.id)}>Edit</Button>
                    </Card.Footer>
                </Card>
            )
        }
        return (
                <Card style={{width: "10rem", margin: "20px"}}>
                    <Card.Img src={BASE_URL+"/images/"+post.image} width="100px"></Card.Img>
                    <Card.Body>
                        <Card.Title>{post.message}</Card.Title>
                    </Card.Body>
                    <Card.Footer>
                        <p>By: {USERNAME}</p>
                    </Card.Footer>
                </Card>
        )
    }

    function LoadData() {

        apiClient.get("/loggedin/"+USERNAME)
            .then((res) => {
                if (formRef.current) {
                    if (res.data["result"] == true) formRef.current.style.visibility = "visible";
                    else formRef.current.style.visibility = "hidden";
                }
            
            })
            .catch();

        apiClient.get("/profile/"+USERNAME)
        .then((res) => {
            const posts : Post[] = [];
            res.data.forEach((x: any) => posts.push({
                id: x["id"],
                image: x["src"],
                message: x["message"]
            }));
            const newUser : User = {
                username: res.data[0]["username"],
                post: posts
            };

            if (USERNAME?.toLowerCase().endsWith("s")) messageRef.current!.innerHTML = `${USERNAME}' posts:`;
            else messageRef.current!.innerHTML = `${USERNAME}'s posts:`;
            setPost(newUser);

        })
        .catch((err) => {
            setPost(undefined);
            if (messageRef.current) {messageRef.current.innerHTML = err.response?.data.message}
        });
    }

    function Submit(e: React.SyntheticEvent) {
        e.preventDefault();

        const formData = new FormData();
    
        if (file) formData.append("image", file);
        else {
            toast.warning("File not found!", {theme: "colored"}); return;
        }

        if (!message) {toast.warning("Message cannot be empty!", {theme: "colored"}); return;}
        
        if (message) formData.append("message", message);
        else formData.append("message", "");

        apiClient.post("/upload", formData)
        .then((res) => {
            if (res.status == 201) {
                toast.success("The post has been created!", {theme: "colored"});
                LoadData();
            }
            else toast.error("Something went wrong.", {theme: "colored"})
        })
        .catch((err) => {
            if (err.status == 403) window.location.href = "/login"
            else toast.error(err.response?.data?.message, {theme: "colored"})
        });
    }

    function Delete(id : number) {
        apiClient.delete("/delete/"+id)
        .then((res) => {
            toast.success(res.data["message"], {theme: "colored"})
            LoadData();
        })
        .catch((err) => {
            const serverMessage = err.response?.data?.message;
            toast.error(serverMessage, {theme: "colored"})
        })
    }


    return (
        <>
            <h1 ref={messageRef}/>
            <Row>
                {post?.post.map((x) => generateCard(x))}
            </Row>
            
            <div className="FORM" ref={formRef}  style={{visibility: "hidden"}}>
                <form method="POST" encType="multipart/form-data" onSubmit={Submit}>
                    <label htmlFor="imageFile">Image: </label>
                    <input type="file" name="image" id="imageFile" onChange={(x) => setFile(x.target.files?.[0] || null)}></input>
                    <label htmlFor="message">Message: </label>
                    <input type="text" id="message" max="30" onChange={((x) => setMessage(x.target.value))}></input>
                    <button type="submit">Upload</button>
                </form>
            </div>

        </>
    );
}

export default Profile;