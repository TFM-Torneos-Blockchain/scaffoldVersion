# Blockchain Tournaments FMP Project

Welcome to the Blockchain Tournaments FMP (Final Master's Project) Project! This project is a culmination of the BlockChain Technologies Master's Degree at the UPC Tech School.

## Overview
The Blockchain Tournaments FMP Project is a decentralized application (DApp) built using Solidity, Ethereum, and web technologies. It's designed to create and manage blockchain-based tournaments where participants can enroll by paying an entry fee. These tournaments accept various ERC20 tokens, which are then invested in different DeFi (Decentralized Finance) protocols to generate interest. The interest generated serves as the prize pool for tournament winners.

## Technologies

The technologies used by this project:
- **Web**
    - Next.js
    - TailwindCSS
    - TypeScript
    - Scaffold
    - Vercel
- **Solidity**
    - Hardhat
    - Goerli

## Features

- **Tournament Creation**: Users can create new tournaments by specifying parameters like maximum and minimum participants, entry fee, acceptable ERC20 tokens, and more.

- **Tournament Enrollment**: Participants can enroll in tournaments by paying the specified entry fee and meeting the tournament's criteria.

- **DeFi Investment**: The project integrates with DeFi protocols to invest the funds collected from participants. This investment generates interest, which forms the tournament's prize pool.

- **Frontend Interface**: The project includes a user-friendly frontend web application where users can view, enroll in, and monitor tournaments.

## How It Works

- **Tournament Creation**: Users create new tournaments by specifying tournament parameters.

- **Tournament Enrollment**: Participants pay the entry fee and meet the tournament's requirements to enroll.

- **Tournament Play**: Generate a spongehash: hash(hash(address+score)+hash(address+score)) to be the cryptographic proof.

- **Tournament Start**: The admin set the tournament started to let players play.

- **Tournament End**: The admin set the tournament ended to let players claim.

- **DeFi Investment**: Collected fees are invested in DeFi protocols to generate interest.

- **Tournament Progress**: Users can track the progress of tournaments and see the increasing prize pool.

- **Tournament Completion**: Tournaments are completed, and winners are determined based on predefined rules.

- **Claiming Rewards**: Winners can claim their rewards from the prize pool.

## Project Structure

The project consists of the following components:

- **Smart Contracts**: Ethereum smart contracts written in Solidity to manage tournaments, investments, and user interactions.
    - **TournamentManager.sol**: Is the base contract, which manages all the tournaments information and the logic.
    - **MajorHashGame.sol**: Is the contract which manages the start of the major hash game.
    - **UniswapV2Protocol.sol**: Is the contract of the bridge between our contracts and the Uniswap protocol.
    - **RocketProtocol.sol**: Is the contract of the bridge between our contracts and the Rocket protocol.
    - **CompoundProtocol**: Is the contract of the bridge between our contracts and the Compound Protocol.

- **Frontend**: A web-based user interface built using web technologies like React.js to interact with the smart contracts and provide a user-friendly experience.
    - **Create Tournament**: Is the view that if you are admin, allows you to create many tournaments as you want
    - **Tournaments**: Is the view that shows all the tournaments of the website and allows you to enroll, play, and claim the tournament reward.

## Demo
[LINK](https://defi-smart-tournaments-tfm.vercel.app/)

## Project Flow Diagram
<br>

![alt text](./AppFlowSchema.drawio.png "Title")

<br>

![alt text](./GameFlowSchema.drawio.png "Title")


## Getting Started

To get started with the Blockchain Tournaments FMP Project, follow these steps:

1. **Clone the Repository**: Clone this GitHub repository to your local machine.

``` shell
git clone https://github.com/your-username/blockchain-tournaments-fmp.git
```

2. **Install Dependencies**: Navigate to the project directory and install the necessary dependencies for both the smart contracts and frontend.

```shell
cd blockchain-tournaments-fmp
yarn install
```

3. **Compile and Deploy**: Compile the smart contracts and deploy them to your preferred Ethereum testnet or network.

4. **Start the Frontend**: Run the frontend application to interact with the smart contracts.

```shell
yarn start
```

5. **Run hardhat and deploy contracts**: Run the hardhat network and deploy the smart contracts.

```shell
yarn chain
yarn deploy
```

6. **Explore**: Open your web browser and visit http://localhost:3000 to explore and interact with the DApp.






