# Tournaments_full_info:

{
tournaments(first:100){
id
initDate
endDate
deFiBridgeAddress
maxParticipants
enrollmentAmount
acceptedTokens
playersInfo(orderBy: blockTimestamp, orderDirection: asc){
player{id}
scoreNumber }
totalCollectedAmount
numParticipant
}
}

# Played_tournaments

{
players(first:100){
id
tournaments{
tournamentID{
id }
scoreNumber
test

}

}
}
