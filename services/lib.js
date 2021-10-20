function readCSV (feeder,month,multiply,callback) { 
    //multiply=3//force solar multiply 
    if(multiply ==0){ 
    multiply=1; 
    } 
    var data=[]; 
    return new Promise(function(resolve, reject) { 
    csv.fromPath('Data/'+feeder+'/'+feeder+'_'+month+'.csv' ) //await  csv.fromPath('Data/'+feeder+'/'+feeder+'_TotalYear.csv' ) 
    .on("data", function(str){data.push(str) 
    str[1]=parseFloat(str[1])*multiply 
    }) 
    .on("end", function(){
     
   callback(JSON.parse("{\"feeder_id\":"+JSON.stringify(feeder)+",\"data\":"+JSON.stringify( data)+"}")) 
    }); 
    }); 
} 

function readCSVProp (callback) { 
    var data=[]; 
    return new Promise(function(resolve, reject) { 
    csv.fromPath('Data/solar_property.csv' ) //await  
   csv.fromPath('Data/'+feeder+'/'+feeder+'_TotalYear.csv' ) 
    .on("data", function(str){data.push(str) 
    var n_of_prosumer_batt =  
   Math.ceil((parseFloat(str[2])/DEFAULT_BATT_POW)*prosumer_batt_multiplier); 
    var n_of_ledger_batt =  
   Math.ceil((parseFloat(str[2])/DEFAULT_BATT_POW)*ledger_batt_multiplier);  var batt_cap=n_of_prosumer_batt * DEFAULT_BATT_CAP; // * simulation_multiply  var batt_pow=(n_of_prosumer_batt * DEFAULT_BATT_POW)/4; // per 15 min 
    let body = JSON.stringify({ 
    "feeder_id": str[0], 
    "batt_cap": batt_cap, 
    "batt_pow": batt_pow 
    }) 
    battery_property.push(JSON.parse(body)) 
    batt_cap=n_of_ledger_batt * DEFAULT_BATT_CAP; // * simulation_multiply  batt_pow=(n_of_ledger_batt * DEFAULT_BATT_POW)/4; // per 15 miny  body = JSON.stringify({ 
    "feeder_id": str[0], 
    "batt_cap": batt_cap, 
    "batt_pow": batt_pow, 
    "batt_bal": 0 
    }) 
    battery_ledger_stat.push(JSON.parse(body)) 
    /* 
    [ [ 'F2', '6', '167.4' ], 
    */ 
    })
    .on("end", function(){ 
    callback(data) 
    }); 
}

module.exports = {readCSV,readCSVProp}