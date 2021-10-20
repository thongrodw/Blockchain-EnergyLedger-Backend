//Import Function
const {curlDelete,curlGet,curlPost,curlPut } = require('./request')


function addCoin(coinID,value,ownerID,type) { 
    let body = JSON.stringify({ //change into json string  "$class": "org.decentralized.energy.network.Coins",  "coinsID": coinID, 
        "value": value, 
        "ownerID": ownerID, 
        "ownerEntity": type 
        }) 
        // curl 
        curlPost("Coins/",body) 
} 

function addCash(cash_id,value,ownerID,type) { let body = JSON.stringify({ //change into json string  "$class": "org.decentralized.energy.network.Cash",  "cashID": cash_id, 
    "currency": "THB", 
    "value": value, 
    "ownerID": ownerID, 
    "ownerEntity": type 
    }) 
    // curl 
   curlPost("Cash/",body) 
} 
   
function addEnergy(energy_id,value,ownerID,type) { 
    let body = JSON.stringify({ //change into json string  "$class": "org.decentralized.energy.network.Energy",  "energyID": energy_id, 
    "units": "kWh", 
    "value": parseFloat(value),
    "ownerID": ownerID, 
    "ownerEntity": type 
    }) 
    // curl 
   curlPost("Energy/",body) 
} 

//Peer Node
function addFeeder(residentID,firstName,lastName,capacity,energy,coin) {  
    addCoin("CO_"+residentID,coin,residentID,"Resident") 
    addCash("CA_"+residentID,0,residentID,"Resident") 
    addEnergy("EN_"+residentID,energy,residentID,"Resident") 
    let body = JSON.stringify({ //change into json string 
    "$class": "org.decentralized.energy.network.Resident",  
    "residentID": residentID, 
    "firstName": firstName, 
    "lastName": lastName, 
    "capacity": parseFloat(capacity), 
    "coins": "CO_"+residentID, 
    "cash": "CA_"+residentID, 
    "energy": "EN_"+residentID 
    }) 
    var count = 0 
    let curl = curlPost("Resident/",body,function(curl){  while(curl!=200&&count!=5){ 
    let curl2 = curlPost("Resident/",body,function(curl2){  curl=curl2; 
    }); 
    count++; 
    } 
    }); 
} 

//Ledger
function addLedger(utilityID,name,capacity,coin,energy) {  
    addCoin("CO_"+utilityID,coin,utilityID,"UtilityCompany")  //addCash("CA_"+utilityID,0,utilityID,"UtilityCompany")  addEnergy("EN_"+utilityID,energy,utilityID,"UtilityCompany") let body = JSON.stringify({ //change into json string 
    let body = {
        "$class": "org.decentralized.energy.network.UtilityCompany",  "utilityID": utilityID,
        "name": name, 
        "capacity": capacity, 
        "coins": "CO_"+utilityID, 
        "energy": "EN_"+utilityID 
    }
    // curl 
    var count = 0 
    let curl = curlPost("UtilityCompany/",body,function(curl){  
        while(curl!=200&&count!=5){ 
            let curl2 = curlPost("UtilityCompany/",body,function(curl2){  
                curl=curl2; 
                count++; 
            })
        }
    });
}

function deleteEnity(participantID) { 
    // curl 
    curlDelete("Resident/"+participantID) 
    curlDelete("UtilityCompany/"+participantID) 
    curlDelete("Coins/"+"CO_"+participantID) 
    curlDelete("Cash/"+"CA_"+participantID) 
    curlDelete("Energy/"+"EN_"+participantID) 
} 

function editEnergy(energy_id,value,ownerID) { 
    let body = JSON.stringify({ //change into json string  "$class": "org.decentralized.energy.network.Energy",  "energyID": energy_id, 
    "units": "kWh", 
    "value": parseFloat(value),
    "ownerID": "ownerID", 
    "ownerEntity": "Resident" 
    }) 
    console.log(body) 
    // curl 
    curlPut("Energy/"+energy_id,body) 
} 

module.exports = {
    addCash,
    addCoin,
    addEnergy,
    addFeeder,
    addLedger,
    deleteEnity,
    editEnergy
}
 