const {readCSV,readCSVProp}= require('./lib')

function ledger_request(feeder_id,action,amount,date,callback){ 
    var batt_index; 
    for(i in battery_ledger_stat){ 
        if(battery_ledger_stat[i].feeder_id===feeder_id){ 
            batt_index = i; 
        } 
    } 
        var i = batt_index 
        if(action=="Buy"){ //ggwp 
        for (j in rtp_list){ 
        if(rtp_list[j][0]==date){ 
        var hour = parseFloat(rtp_list[j][0].split(" ")[1].split(":")[0]);  var realtime_price=parseFloat(rtp_list[j][1]) 
        //console.log(realtime_price) 
        if(hour>=9 && hour<=22){ 
        }else{ 
        //console.log(hour+"offpeak") 
        if(offpeak_price<realtime_price){ 
        //console.log("offpeak_deny")
        callback("deny") 
        } 
        } 
        } 
        } 
        if(battery_ledger_stat[i].batt_bal>0){ 
        if(battery_ledger_stat[i].batt_bal>=amount){ 
        battery_ledger_stat[i].batt_bal = battery_ledger_stat[i].batt_bal-amount  
            callback("approve") 
        }else{ //If request < batt balance --> deny 
        callback("deny") 
        } 
        }else{ //No balance 
            callback("deny") 
        } 
        }else if(action=="Sell"){ 
        if(((battery_ledger_stat[i].batt_cap - battery_ledger_stat[i].batt_bal)-amount)>=0){  battery_ledger_stat[i].batt_bal += amount 
            callback("approve") 
        }else{ 
            callback("deny") 
        } 
    } 
} 

function loader(feeders,months,multiply,callback){//speed in second map to 15 min+  if(!loaded){ 
    loaded =true; 
    var feeder_list = feeders.split(','); 
    for (i of feeder_list){ 
        readCSV(i,months,multiply,function(result){ 
        loaded_datas.push(result) 
    }); 
    } 
    readCSVProp(function(result){ 
   /* 
    [ [ 'F2', '6', '167.4' ], 
    [ 'F3', '3', '83.7' ], 
    [ 'F4', '39', '1088.1' ], 
    [ 'F5', '41', '1143.9' ], 
    [ 'F6', '41', '1143.9' ], 
    [ 'F9', '11', '306.9' ] ] 
   */ 
        feeder_property=result 
        }); 
        callback('Load completed!'); 
    }
    else{ 
        callback('Simulation already loaded'); 
    } 
} 

module.exports = {ledger_request,loader}