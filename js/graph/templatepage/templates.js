export default [
    {
        "name": "Graphlinq",
        "key": "graphlinq",
        "graphs": [
            {
                "title": "Custom event example",
                "file_url": "https://gist.githubusercontent.com/nightwolf93/cd15db01ef083f427f399086c89a3ef9/raw/64d5e457cf16a1b1b65e12a24d1b33a03640c93b/custom_event_example.glq",
                "description": "This graph how you to setup custom event listener and how to trigger them",
                "price": 0,
                "integration": ["graphlinq"]
            },
            {
                "title": "HostedAPI Website example",
                "file_url": "https://gist.githubusercontent.com/nightwolf93/98e68fa0a5e7c626ed114fdb50cec154/raw/e63fff947366e1a0ad4e068baa010515d4d8ab37/gistfile1.txt",
                "description": "This graph expose a public webpage with html, css and javascript content using the HostedAPI system from the Graphlinq Engine",
                "price": 0,
                "integration": ["graphlinq", "web"]
            }
        ]
    },
    {
        "name": "ChatGPT",
        "key": "chat-gpt",
        "graphs": [
            {
                "title": "Chat GPT conversation starter",
                "file_url": "https://gist.githubusercontent.com/nightwolf93/7f28f094b9ce65de54d1da565d351a78/raw/8f7a7a8b84e1aa286d143b826ae79a528507b68b/Open%2520AI%2520starter.glq",
                "description": "Create a conversation with Chat GPT and send prompt to it, you can create AI flow based on this template",
                "price": 0,
                "integration": ["chatgpt"]
            },
            {
                "title": "Chat GPT chatbot hosted API",
                "file_url": "https://gist.githubusercontent.com/nightwolf93/61dd46722de860a11f3d0fe92f10afcc/raw/922ab2b5af87dccdafc0cca4291e09a2b6cefc65/gistfile1.txt",
                "description": "This graph will expose a HTTP API to create a interactive chatbot for a website, it use the HostedAPI system from the Graphlinq Engine",
                "price": 0,
                "integration": ["chatgpt", "graphlinq", "web"]
            }
        ]
    },
    {
        "name": "Exchange",
        "key": "exchange",
        "graphs": [
            {
                "title": "Uniswap Price Tracking",
                "file_url": "",
                "description": "Track a specific liquidity pool to report the price to a telegram chanel",
                "price": 0,
                "integration": ["uniswap", "telegram"]
            }
        ]
    },
    {
        "name": "Dextools",
        "key": "dextools",
        "graphs": [
            /**
            {
                "title": "Dextools API starter",
                "file_url": "",
                "description": "Use this starter template to start to make a graph using the Dextools API",
                "price": 0,
                "integration": ["dextools"]
            },
            {
                "title": "Dextools Report Gainers",
                "file_url": "",
                "description": "Report gainers every x minutes to a telegram channel using a telegram bot and the Dextools API",
                "price": 0,
                "integration": ["dextools", "telegram"]
            },
            {
                "title": "Dextools Get DEXs Informations",
                "file_url": "",
                "description": "Get DEXs informations from the Dextools API",
                "price": 0,
                "integration": ["dextools"]
            },
             */
            {
                "title": "Dextools with Lua interaction",
                "file_url": "https://gist.githubusercontent.com/nightwolf93/011edcb3c4030bbc04f36ae6282b8fc2/raw/c12eac6e85306cbd6b5612891cf294608acd04a9/dextools_lua",
                "description": "This graph show you how to use Dextools data from the Lua context",
                "price": 0,
                "integration": ["dextools", "lua", "graphlinq"]
            }
        ]
    },
    {
        "name": "Lua",
        "key": "lua",
        "graphs": [
            {
                "title": "GET HTTP Lua example",
                "file_url": "https://gist.githubusercontent.com/nightwolf93/d6ca05fc880c695e09dec0466d6b2633/raw/258a6726338fef97e311d31f2d526f1c356fa0f5/get_http_lua_sample.glq",
                "description": "This example show you how to perform a HTTP call using the Lua Graphlinq Engine",
                "price": 0,
                "integration": ["lua", "graphlinq"]
            },
            {
                "title": "POST HTTP Lua example",
                "file_url": "https://gist.githubusercontent.com/nightwolf93/13aca815a7c9d20c7948cf1fdd469909/raw/1b443a94114e222b3b8666ab395d75725f0a0929/post_lua.glq",
                "description": "This example show you how to perform a send POST data",
                "price": 0,
                "integration": ["lua", "graphlinq"]
            },
            {
                "title": "Custom Event Trigger Lua",
                "file_url": "https://gist.githubusercontent.com/nightwolf93/ccb4db35aaf6617710d22b049a65e519/raw/8333c9aa9576b7618f94559da7f1851423c355d8/custom_event_lua.glq",
                "description": "Trigger a custom event node from the Lua context",
                "price": 0,
                "integration": ["lua", "graphlinq"]
            },
            {
                "title": "Telegram Lua Bot Starter",
                "file_url": "https://gist.githubusercontent.com/nightwolf93/be18ed237adedf6bb390dcd8e96079ab/raw/c19d921b255fa8db73183e2494d567c84f2650fd/telegram_lua_bot.glq",
                "description": "Starter graph to create a telegram bot using the Lua Graphlinq Engine",
                "price": 0,
                "integration": ["telegram", "lua", "graphlinq"]
            },
            {
                "title": "On-chain Lua data fetch",
                "file_url": "https://gist.githubusercontent.com/nightwolf93/b5fb1c539bc93ec6064dec4589df3a9d/raw/be90a4b47cfe4aee2f69b8d165f8a9b16a0ec491/gistfile1.txt",
                "description": "Using Lua, you can fetch data using on-chain evm contract, this example use the Chainlink price feed contract",
                "price": 0,
                "integration": ["lua", "graphlinq"]
            },
            {
                "title": "Lua HostedAPI example",
                "file_url": "https://gist.githubusercontent.com/nightwolf93/75921f9279de83827ede0d9088b70b0f/raw/3b975ca08022ad793b99f160e825e7415c040bc3/gistfile1.txt",
                "description": "Create a Hosted API that will execute Lua script to send back a JSON to the client",
                "price": 0,
                "integration": ["lua", "web"]
            }
        ]
    },
    {
        "name": "Blockchain",
        "key": "blockchain",
        "graphs": [
            {
                "title": "Watch Ethereum Wallet",
                "file_url": "https://gist.githubusercontent.com/nightwolf93/bdbbb09fb63540a250d7e8593b6c018c/raw/9fa8b52dc7d0e2d4b6999bcd2822d09a564ab970/gistfile1.txt",
                "description": "Listen transactions for a specific wallet on the Ethereum blockchain",
                "price": 0,
                "integration": ["ethereum"]
            },
            {
                "title": "Watch Ethereum New Blocks",
                "file_url": "https://gist.githubusercontent.com/nightwolf93/af6948a25d6ef36105ac5a949023f2eb/raw/e5019c77d221ca2248b64b485d9400e31ef0490b/gistfile1.txt",
                "description": "Listen every new blocks on the Ethereum blockchain",
                "price": 0,
                "integration": ["ethereum"]
            }
        ]
    }
];