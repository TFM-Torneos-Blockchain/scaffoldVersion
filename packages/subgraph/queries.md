#Tournaments_full_info:
{
tournaments(first:100){
id
initDate
endDate
deFiBridgeAddress
maxParticipants
enrollmentAmount
players{
player{id}
}
results(orderBy: blockTimestamp, orderDirection: asc){ scoreNumber }
totalCollectedAmount
numParticipant
}
}
