// const contractAddress = "0xB7B066f0057BB06cA909cC7818E13Ac15E9b5355";

// const contractABI = [
//     {
//         "inputs": [
//             { "internalType": "address", "name": "_to", "type": "address" },
//             { "internalType": "string", "name": "_content", "type": "string" }
//         ],
//         "name": "sendMessage",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [],
//         "name": "getMessages",
//         "outputs": [
//             {
//                 "components": [
//                     { "internalType": "address", "name": "sender", "type": "address" },
//                     { "internalType": "string", "name": "content", "type": "string" },
//                     { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
//                 ],
//                 "internalType": "struct MessageContract.Message[]",
//                 "name": "",
//                 "type": "tuple[]"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             { "internalType": "address", "name": "", "type": "address" },
//             { "internalType": "uint256", "name": "", "type": "uint256" }
//         ],
//         "name": "messages",
//         "outputs": [
//             { "internalType": "address", "name": "sender", "type": "address" },
//             { "internalType": "string", "name": "content", "type": "string" },
//             { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     }
// ];

// let web3;
// let contract;
// let account;

// window.addEventListener("load", async () => {
//     if (window.ethereum) {
//         web3 = new Web3(window.ethereum);
//         await window.ethereum.request({ method: "eth_requestAccounts" });

//         const accounts = await web3.eth.getAccounts();
//         account = accounts[0];
//         document.getElementById("account").innerText = account;

//         contract = new web3.eth.Contract(contractABI, contractAddress);

//         loadMessages();
//     } else {
//         alert("Please install MetaMask!");
//     }
// });

// async function sendMessage() {
//     const recipient = document.getElementById("recipient").value;
//     const message = document.getElementById("message").value;

//     if (!web3.utils.isAddress(recipient)) {
//         alert("Invalid recipient address.");
//         return;
//     }

//     if (message.trim() === "") {
//         alert("Message cannot be empty.");
//         return;
//     }

//     await contract.methods.sendMessage(recipient, message).send({ from: account });
//     alert("Message sent!");
//     document.getElementById("message").value = "";
//     loadMessages();
// }

// async function loadMessages() {
//     const messages = await contract.methods.getMessages().call({ from: account });
//     const list = document.getElementById("messageList");
//     list.innerHTML = "";

//     messages.forEach(msg => {
//         const date = new Date(msg.timestamp * 1000);
//         const item = document.createElement("li");
//         item.innerText = `[${date.toLocaleString()}] ${msg.sender}:\n${msg.content}`;
//         list.appendChild(item);
//     });
// }
const contractAddress = "0xB7B066f0057BB06cA909cC7818E13Ac15E9b5355";
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_content",
                "type": "string"
            }
        ],
        "name": "sendMessage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getMessages",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "sender",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "content",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct MessageContract.Message[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "messages",
        "outputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "content",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

let web3;
let contract;
let account;

window.addEventListener("load", async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const accounts = await web3.eth.getAccounts();
        account = accounts[0];
        document.getElementById("account").innerText = account;

        contract = new web3.eth.Contract(contractABI, contractAddress);

        document.getElementById("sendBtn").addEventListener("click", sendMessage);

        loadInbox();
    } else {
        alert("Please install MetaMask");
    }
});

async function loadInbox() {
    const messages = await contract.methods.getMessages().call({ from: account });
    const users = new Set();

    messages.forEach(msg => {
        users.add(msg.sender.toLowerCase());
    });

    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    users.forEach(user => {
        const li = document.createElement("li");
        li.innerText = user;
        li.style.cursor = "pointer";
        li.onclick = () => loadConversation(user);
        userList.appendChild(li);
    });
}

async function loadConversation(selectedUser) {
    const received = await contract.methods.getMessages().call({ from: account });
    const sent = await contract.methods.getMessages().call({ from: selectedUser });

    const messages = [];

    received.forEach(m => {
        if (m.sender.toLowerCase() === selectedUser.toLowerCase()) {
            messages.push({ ...m, type: "received" });
        }
    });

    sent.forEach(m => {
        if (m.sender.toLowerCase() === account.toLowerCase()) {
            messages.push({ ...m, type: "sent" });
        }
    });

    messages.sort((a, b) => a.timestamp - b.timestamp);

    const chat = document.getElementById("chatMessages");
    chat.innerHTML = "";

    messages.forEach(m => {
        const li = document.createElement("li");
        li.className = m.type;
        const time = new Date(m.timestamp * 1000).toLocaleTimeString();
        li.innerHTML = `<span>${m.content}</span><div class="timestamp">${time}</div>`;
        chat.appendChild(li);
    });

    document.getElementById("chatHeader").innerText = `Chat with: ${selectedUser}`;
    document.getElementById("recipient").value = selectedUser;
}

async function sendMessage() {
    const recipient = document.getElementById("recipient").value;
    const message = document.getElementById("message").value;

    if (!web3.utils.isAddress(recipient)) {
        alert("Invalid address");
        return;
    }

    if (message.trim() === "") {
        alert("Message cannot be empty");
        return;
    }

    await contract.methods.sendMessage(recipient, message).send({ from: account });
    document.getElementById("message").value = "";
    loadConversation(recipient);
}
