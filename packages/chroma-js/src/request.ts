import "isomorphic-fetch";

function request(arg1: any, arg2: any) {
    return fetch(arg1, arg2);
}

export default request;
