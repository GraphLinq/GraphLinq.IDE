//const apiBaseUrl = "http://localhost:3000";
const apiBaseUrl = "https://prompt-api.graphlinq.io";

export const createThread = () => {
    return new Promise((result) => {
        fetch(apiBaseUrl + '/create-thread',
        { method: 'POST', body: JSON.stringify({}), headers: { 'Content-Type': 'application/json' } })
        .then(res => res.json())
        .then(json => {
            result(json)
        });
    })
};

export const createRun = (threadId, content) => {
    return new Promise((result) => {
        fetch(apiBaseUrl + '/update-thread/' + threadId,
        { method: 'POST', body: JSON.stringify({content: content}), headers: { 'Content-Type': 'application/json' } })
        .then(res => res.json())
        .then(json => {
            result(json)
        });
    })
};

export const checkRun = (threadId, runId) => {
    return new Promise((result) => {
        fetch(apiBaseUrl + '/check-run/' + threadId + "/" + runId,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } })
        .then(res => res.json())
        .then(json => {
            result(json)
        });
    })
};

export const getRunCode = (threadId, runId) => {
    return new Promise((result) => {
        fetch(apiBaseUrl + '/get-run-code/' + threadId + "/" + runId,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } })
        .then(res => res.text())
        .then(json => {
            result(json)
        });
    })
};