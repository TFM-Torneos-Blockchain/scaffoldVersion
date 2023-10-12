# GAME WINNERS AND REWARDS IMPLEMENTATION

## 1. PLAY GAME

```solidity
struct Result {
    address player_address
    uint score
}
bytes32 results_hash;

function play(uint IDtour, Result[] calldata _results) {
    // require msg.sender inside tournament
    emit (new_result) // so we can make a list of scores offchain for everyone to be able to check all scores
}

```

## 2.  SET LEADER BOARD

### OBJECTIVES : gerate merkle tree to insert player into position order. And store root
```solidity
function set_leaderBoard (uint _IDtour, result[] calldata _results, uint[] calldata positions) {
    require(hash(_results) == results_hash);
    requier(positions.length == _results.length);  // TODO think about it... now _results is bytes array so can't compare to positions (array of uints)
    address[](results.length) memory leaderboard; // IDEA if merkle proof requires address and position, 
    uint lastScore = 0;
    for (uint i = 0; i < results.length; i++) {
        leaderboard[i] = _results[positions[i]].player_address;
        require(_results[positions[i]].score >= lastScore);  // if  tie caller decides order.
        lastScore = _results[positions[i]].score;
    }

    // TODO merkelize leaderboard and SOTRE root 

    }

```

##  CLAIM REWARDS

Check your position via merkle proof




