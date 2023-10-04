# GAME WINNERS AND REWARDS IMPLEMENTATION

## 1. PLAY GAME

```solidity
struct result {
    address player_address
    uint score
}
bytes32 results_hash;

function play(uint IDtour, result[] calldata _results) {
    // require msg.sender inside tournament
    require(hash(_results) == results_hash);
    // TODO calculate player score (result[] new_result)
    _results.push(result(msg.sender, score))
    updated_results_hash = hash (_results) 
    results_hash = updated_results_hash
    emit (new_result)
}

```

## 2.  SET LEADER BOARD

### OBJECTIVES : gerate merkle tree to insert player into position order. And store root
```solidity
function set_leaderBoard (result[] calldata _results, uint[] calldata positions) {
    require(hash(_results) == results_hash);
    requier(positions.length == _results.length);
    address[](results.length) memory leaderboard;
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




