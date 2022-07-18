import toast from "react-hot-toast";
import { useStore } from "../store";

const makePath = (path) => {
    return `https://peppermint-api.com/api${path}`
}

const call = async (method, path, params = null) => {

    const {
        apiToken,
        enableButtons,
        disableButtons
    } = useStore.getState();

    disableButtons();

    const resOptions = {
        method: method,
        headers: {
            "content-type": "application/json"
        }
    };

    if (["post", "put"].includes(method) && params) {
        resOptions.body = JSON.stringify(params);
    }

    if (apiToken) {
        resOptions.headers["authorization"] = `bearer ${apiToken}`;
    }

    const res = await fetch(makePath(path), resOptions);
    const data = await res.json();

    if (res.status >= 400) {
        toast.error(`Something went awry: ${data.detail ? data.detail : data.message}`);
    } else {
        toast.success(`api success: ${method} ${path}`);
    }

    enableButtons();

    return data;

}

const get = async (path) => {
    const res = await call("get", path);
    return res;
}

const post = async (path, params) => {
    const res = await call("post", path, params);
    return res;
}

const put = async (path, params) => {
    const res = await call("put", path, params);
    return res;
}

const login = async (username, password) => {

    const res = await call("post", "/v2/user/login/", { username, password });

    if (res.token) {
        console.info("Logged in succesfully");
        const apiToken = res.token;
        useStore.setState({ apiToken });
        return true;
    }

    console.warn("Failed to login:", res);
    return false;

}

const upload = async (path, form) => {

    const { apiToken } = useStore.getState();
    return new Promise((resolve) => {

        const xhr = new XMLHttpRequest();
        xhr.open('PUT', makePath(path));
        xhr.setRequestHeader("authorization", `bearer ${apiToken}`);
        xhr.send(form);
        xhr.addEventListener('readystatechange', () => {

            if (xhr.readyState !== 4) {
                return;
            }

            const res = JSON.parse(xhr.responseText);
            resolve(res);

        });

    });


};

export default { post, get, login, upload, put }