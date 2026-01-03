let web3;
let contract;
let account;
let selectedAddress = null;

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
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getInbox",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "sender",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "recipient",
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
                "internalType": "struct SecureMessage.Message[]",
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
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getOutbox",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "sender",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "recipient",
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
                "internalType": "struct SecureMessage.Message[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
const contractAddress = "0x0025Bb8715A3f4C86159B7F25613333084c22845";

window.addEventListener("load", async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        account = accounts[0];
        document.getElementById("account").textContent = `Connected: ${account}`;

        contract = new web3.eth.Contract(contractABI, contractAddress);
        loadInbox();
    } else {
        alert("Please install MetaMask.");
    }
});

async function loadInbox() {
    const messages = await contract.methods.getInbox(account).call();
    const inboxList = document.getElementById("inbox");
    inboxList.innerHTML = "";

    const uniqueSenders = [...new Set(messages.map(msg => msg.sender))];

    uniqueSenders.forEach(sender => {
        const li = document.createElement("li");
        li.textContent = sender;
        li.onclick = () => {
            document.querySelectorAll("#inbox li").forEach(el => el.classList.remove("active"));
            li.classList.add("active");
            loadConversation(sender);
        };
        inboxList.appendChild(li);
    });
}

async function loadConversation(address) {
    selectedAddress = address;
    const all = await contract.methods.getInbox(account).call();
    const sent = await contract.methods.getOutbox(account).call();

    const filtered = [
        ...all.filter(m => m.sender === address),
        ...sent.filter(m => m.recipient === address)
    ].sort((a, b) => a.timestamp - b.timestamp);

    const convo = document.getElementById("conversation");
    convo.innerHTML = "";

    filtered.forEach(msg => {
        const div = document.createElement("div");
        const isYou = msg.sender === account;

        div.className = isYou ? "message message-you" : "message message-them";

        const time = new Date(msg.timestamp * 1000).toLocaleString();

        div.innerHTML = `
            <div class="bubble">${msg.content}</div>
            <div class="timestamp">${time}</div>
        `;
        convo.appendChild(div);
    });

    convo.scrollTop = convo.scrollHeight;
}


document.getElementById("sendBtn").addEventListener("click", async () => {
    const to = document.getElementById("recipient").value || selectedAddress;
    const msg = document.getElementById("message").value;

    if (!web3.utils.isAddress(to)) {
        return alert("Invalid recipient address.");
    }

    if (!msg) return alert("Message cannot be empty.");

    await contract.methods.sendMessage(to, msg).send({ from: account });
    document.getElementById("message").value = "";

    if (selectedAddress === to) {
        loadConversation(to);
    }
    loadInbox();
});
