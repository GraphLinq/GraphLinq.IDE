const engineBaseUrl = "http://localhost:1337";
const apiBaseUrl = "https://api.graphlinq.io";

const engineBasedAPI = false;

export const fetchCompressed = (data, token) => {
    if(engineBasedAPI) return fetchCompressedEngine(data);
    return new Promise((result) => {
        fetch(apiBaseUrl + '/graphs/compress', 
        { method: 'POST', body: JSON.stringify({data: data}), headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } })
        .then(res => res.json())
        .then(json => {
            result(json)
        });
    })
}

export const fetchTemplate = (id) => {
    return new Promise((result) => {
        fetch(apiBaseUrl + '/graphs/template/' + id, 
        { method: 'GET', headers: { 'Content-Type': 'application/json' } })
        .then(res => res.json())
        .then(json => {
            result(json)
        });
    })
}

export const fetchDecompress = (data, token) => {
    if(engineBasedAPI) return fetchDecompressEngine(data);
    return new Promise((result) => {
        fetch(apiBaseUrl + '/graphs/decompress', 
        { method: 'POST', body: JSON.stringify({data: data}), headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } })
        .then(res => res.json())
        .then(json => {
            result(json)
        });
    })
}

export const fetchDecompressEngine = (data) => {
    return new Promise((result) => {
        fetch(engineBaseUrl + '/graphs/decompress', 
        { method: 'POST', body: JSON.stringify({JsonData: data}), headers: { 'Secret-Key': 'c3VwZXJwcml2YXRla2V5', 'Content-Type': 'application/json' } })
        .then(res => res.json())
        .then(json => {
            result(json)
        });
    })
}

export const fetchCompressedEngine = (data) => {
    return new Promise((result) => {
        fetch(engineBaseUrl + '/graphs/compress', 
        { method: 'POST', body: JSON.stringify({JsonData: data, WalletIdentifier: -1}), headers: { 'Secret-Key': 'c3VwZXJwcml2YXRla2V5', 'Content-Type': 'application/json' } })
        .then(res => res.json())
        .then(json => {
            result(json)
        });
    })
}

export const deployGraph = (bytes, token, name, state = 1) => {
    if(engineBasedAPI) return deployGraphEngine(bytes);
    return new Promise((resolve) => {
        fetch(apiBaseUrl + '/graphs/deploy', 
        { method: 'POST', body: JSON.stringify({bytes: bytes, alias: name, state: state, debug: true}), headers: { "Authorization": "Bearer " + token, 'Secret-Key': 'c3VwZXJwcml2YXRla2V5', 'Content-Type': 'application/json' } })
        .then(res => res.json())
        .then(json => {
            resolve(json);
        });
    })
}

export const deployGraphEngine = (bytes, walletIdentifier = -1, state = 1) => {
    return new Promise((resolve) => {
        fetch(engineBaseUrl + '/graphs/deploy', 
        { method: 'POST', body: JSON.stringify({RawBytes: bytes, WalletIdentifier: walletIdentifier, DeployedState: state}), headers: { 'Secret-Key': 'c3VwZXJwcml2YXRla2V5', 'Content-Type': 'application/json' } })
        .then(res => res.json())
        .then(json => {
            resolve(json);
        });
    })
}

export const fetchToken = (address, signature) => {
    return new Promise((resolve) => {
        fetch(apiBaseUrl + '/wallets/auth', 
        { method: 'POST', body: JSON.stringify({address: address, signature: signature}), headers: { 'Content-Type': 'application/json' } })
        .then(res => res.json())
        .then(json => {
            resolve(json);
        });
    })
}

export const fetchLogs = (hash, token) => {
    if(engineBasedAPI) return fetchLogsEngine(hash);
    return new Promise((resolve) => {
        fetch(apiBaseUrl + '/graphs/logs', 
        { method: 'POST', body: JSON.stringify({hash: hash}), headers: { "Authorization": "Bearer " + token, 'Content-Type': 'application/json' } })
        .then(res => res.json())
        .then(json => {
            resolve(json);
        });
    })
}

export const fetchLogsEngine = (hash) => {
    return new Promise((resolve) => {
        fetch(engineBaseUrl + '/graphs/logs', 
        { method: 'POST', body: JSON.stringify({UniqueHash: hash}), headers: { 'Secret-Key': 'c3VwZXJwcml2YXRla2V5', 'Content-Type': 'application/json' } })
        .then(res => res.json())
        .then(json => {
            resolve(json);
        });
    })
}