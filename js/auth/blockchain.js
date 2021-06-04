import Web3 from "web3";
import * as API from "../services/api";
import toastr from "toastr";

let web3Instance = null;
let account = "";
let token = "";

export const getToken = () => { return token; }

export const initWeb3 = async () => {
    if(!window.web3) {
        return false;
    }
    web3Instance = new Web3(Web3.givenProvider);
    if((await web3Instance.eth.getAccounts()).length > 0) {
        await requestLogin();
    }
    window.ethereum.on('accountsChanged', function (accounts) {
        if(accounts.length == 0) logout();
    })

    return true;
};

export const isLogged = () => {
    return account != "" && token != "";
}

export const logout = async () => {
    token = "";
    account = "";
    document.querySelector("[data-app-menu='login']").style.display = "block";
    document.querySelector("[data-app-menu='logged.as']").style.display = "none";
    toastr.warning("Your wallet is now disconnected");
}

export const requestLogin = async () => {
    if(web3Instance == null) return;
    await window.ethereum.enable();
    const accounts = await web3Instance.eth.getAccounts();
    if(accounts.length == 0) return;
    const chainId = await web3Instance.eth.getChainId();
    if(chainId != 1 && chainId != 137 && chainId != 3) {
        alert("You are on the wrong network please change your network on metamask to ETH Mainnet and reload");
        return;
    }
    account = accounts[0];

    var networkName = "ETH";
    if(chainId == 137) {
        networkName = "POLYGON";
    }
    document.querySelector("[data-app-menu='login']").style.display = "none";
    document.querySelector("[data-app-menu='logged.as']").style.display = "block";
    document.querySelector("[data-app-menu='logged.as'] span").innerHTML = account + " (" + networkName + ")";

    await fetchSignedToken();
}

export const fetchSignedToken = async() => {
    let signature = "";
    if(localStorage.getItem('signature/' + account) == "" || localStorage.getItem('signature/' + account) == null) {
        const key = "I agree to connect my wallet to the GraphLinq Interface.";
        signature = await web3Instance.eth.personal.sign(key, account, "");
        localStorage.setItem('signature/' + account, signature);
    }
    else {
        signature = localStorage.getItem('signature/' + account);
    }
    const tokenResponse = await API.fetchToken(account, signature);
    if(tokenResponse.auth == false) return;
    token = tokenResponse.accessToken;
    toastr.success("Logged with success");
}