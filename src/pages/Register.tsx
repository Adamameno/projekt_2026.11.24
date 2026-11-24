import { useState, type SyntheticEvent } from "react";
import { toast } from "react-toastify";
import { apiClient } from "../api/Api";

function Register() {
    const [username, setUsername] = useState<string>();
    const [password, setPassword] = useState<string>();

    function Submit(e: SyntheticEvent) {
        e.preventDefault();


        if (!username) {toast.warning("All field must be filled!", {theme: "colored"}); return;}

        if (!password) {toast.warning("All field must be filled!", {theme: "colored"}); return;}

        apiClient.post("/register", {username, password})
        .then((res) => {
            if (res.status != 201) toast.error(res.data["message"])
            else window.location.href = "/login"
        })
        .catch((err) => {
            const serverMessage = err.response?.data?.message;
            toast.error(serverMessage, {theme: "colored"})
        })


    }

    return (
        <>
            <h1>Create an account!</h1>
            <div className="FORM">
                <form method="POST" onSubmit={Submit}>
                    <label htmlFor="username">Username: </label>
                    <input type="text" id="username" onChange={((x) => setUsername(x.target.value))}></input>
                    <label htmlFor="password">Password: </label>
                    <input type="password" id="password" max="30" onChange={((x) => setPassword(x.target.value))}></input>
                    <button type="submit">Registration</button>
                </form>
            </div>

        </>
    )
}

export default Register;