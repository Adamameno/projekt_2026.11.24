import { useEffect, useState, type SyntheticEvent } from "react";
import { apiClient } from "../api/Api";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

function Edit() {
     const [oldMessage, setOldMessage] = useState<string>();
    const [message, setMessage] = useState<string>();
    const [username, setUsername] = useState<string>();
   

    const {id} = useParams();

    useEffect(() => {
        apiClient.get("/username")
        .then((res) => setUsername(res.data["username"]))
        .catch()

        apiClient.get("/posts/"+id)
        .then((res) => {
            setOldMessage(res.data["message"])
        })
        .catch((err) => toast.error(err.response?.data?.message))
    }, [])

    function Submit(e: SyntheticEvent) {
        e.preventDefault();
        if (!message) {toast.warning("Message cannot be empty!", {theme: "colored"}); return;}
        apiClient.patch("/posts/"+id, {message: message})
        .then(() => window.location.href = "/profile/"+username)
        .catch((err) => toast.error(err.response?.data?.message, {theme: "colored"}))
    
    
    }
    if (!oldMessage) return <h1>Post not found!</h1>
    return (
        <>
            <div className="FORM">
                <h3>Old message: {oldMessage}</h3>
                <form method="POST" onSubmit={Submit}>
                    <label htmlFor="username">New message: </label>
                    <input type="text" id="username" onChange={((x) => setMessage(x.target.value))}></input>
                    <button type="submit">Edit</button>
                </form>
            </div>

        </>
    )
}

export default Edit