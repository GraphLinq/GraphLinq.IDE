# GraphLinq IDE Changelog

## 2.1
- Implement a Dependency System: Introduce a dependency management feature that enables users to embed sub-graphs within other graphs. This integration facilitates the reuse of functions without the need for duplication, streamlining the development process.
- New Node Group System: Implement a system for grouping nodes, allowing users to move them collectively. This enhancement will boost productivity and improve the user experience by simplifying the organization and manipulation of graph components.
- Color-Coded Parameter Lines for Nodes: Introduce color-coding for node parameter lines based on their data types. This visual cue will enhance readability and make it easier for users to understand the flow of data types across the graph.
- Sub-graph Merging on Export: Ensure that when a graph containing sub-graphs is exported, the sub-graphs are merged into the main graph. This approach guarantees that when a graph with dependencies is imported into the Integrated Development Environment (IDE), all associated dependencies are automatically included, streamlining the import process.
- Dependency Checking Mechanism: Add a mechanism to check for dependencies in graphs containing sub-graphs. This feature aims to prevent compilation if a graph includes sub-graph dependencies, thereby avoiding potential execution errors or undesired behavior during runtime.
- Added a checkbox for the boolean type instead of typing "true" or "false"
- The search node input will now reset when a node is selected
- You can now embed html elements in your graph, to add videos for examples using the description of a comment group and using the prefix !embed

## 2.0
- Revamp the entire design to match the new graphlinq website
- Block snapping, now block move with a grid system that will improve the visual quality of the graph
- When a graph is saved, the camera position is saved, when you reload the graph you will return at the exact position
- Improve performance, for better experience
- Minimap rework, the minimap now show the comments from the graph
- Add Dextools blocks
- Add lua script graph context execution, you can now execution lua script without smart contract context, to create complex workflow easily
- Add icons for some blocks
- New template wizard window, allow you to grab a existing template to start a project based on it
- Lua engine improvement, introducing Lua HTTP call, that function allow you to call external services from the Lua Graphlinq Engine to create new blocks

## 1.3.7
- URL Shortener Blocks - https://glq.link
- WebSocket Blocks

## 1.3.6
- OpenAI blocks are now available
- Twitch blocks are now available
- You can now create dictionary to store data with keys
- Add some blocks like "Generate random number"

## 1.3.5
- Node block groups can be collapsed/expanded individually
- All node block groups can be collapsed/expanded at once
- Individual block help button with popup
- Main popup with getting started help on first load
- Updated block group icons

## 1.3.4
- Update IDE messages and prompt wording
- Engine offset timestamp now supports weeks
- String Get All Matches Using Regex
- String Replace Using Regex
- String Get Match Using Regex
- String Contains Multi
- String Matches Regex
- String Split
- Added link to output of Twitter On Tweet

## 1.3.3
- LCW Block for Single Coin History
- Telegram blocks for sending photos
- Engine get timestamp with milliseconds
- Engine get offset timestamps
- Engine Millisecond to Date block
- Create Charts from Data

## 1.3.2
- KuCoin Blocks to fully execute and manage trading
- Avalanche Blockchain Integration
- SnowTrace Integration (Avalanche)
- Avascan Integration (Avalanche)

## 1.3.1
- Edges of canvas are easier to see why a line between blocks becomes invisible
- QuickSwap integration
- Code refactoring
- Bug fixes and optimisation

## 1.3.0
- Introducing the GraphLinq Lua Scripting Engine, allow you to read any smart contract data from the ethereum blockchain (Solidity compatible chain in future update)
- New blocks for the lua scripting is available on the IDE (Lua Block, JSON ABI Block, Smart Contract Reader Block)
- GraphLinq Lua Scripting documentation website : <mettre un ndd>
- Minimap on the IDE that help you organize your graph more easily
- Engine optimisation

## 1.2.0
- Loading project speed improvement
- Current Graph is now in the window title
- Loading toolbox speed improvement
- New "Secret String" block that allow you to hide string variables in the IDE
- New "Santiment" API block integrated
- Ropsten testnet is now supported for the login
- Node Blocks are now smaller
- Font for variables input is now more readable
- New shortcuts available
- Parameters line are now animated, for more visibility on links