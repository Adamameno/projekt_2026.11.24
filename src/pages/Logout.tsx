import { useEffect } from "react"
import { apiClient } from "../api/Api"

function Logout() {

    useEffect(() => {
        apiClient.post("/logout")
        .then(() => window.location.href = "/")
        .catch(() => window.location.href = "/")
    }, [])


    return <div>Logout...</div>
}

export default Logout