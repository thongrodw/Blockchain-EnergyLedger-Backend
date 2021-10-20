const express = require('express')
const router = express.Router()

//Default Constant
const loaded = false; 
const computed=false; 
const minPrice= 1.68 
const maxPrice= 3.5 //3.5 
const offpeak_price= 2.62 
const onpeak_price= 4.355 
const DEFAULT_BATT_CAP=13.5 //13.5kWh 
const DEFAULT_BATT_POW=5; //5kWh 
const DEFAULT_SOL_EFF=1; //16% 
const prosumer_batt_multiplier=1 
const ledger_batt_multiplier=1 
const multiply=1 

//Array
const feeders_list=["F2","F3","F4","F5","F6","F9"];
const month_list= ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]; //1.68 PEA Rate 
var loaded_datas=[] 
var rtp_list=[] 
var sum_data=[] //All feeder 
var feeder_property=[] 
var battery_property=[]; 
var battery_ledger_stat=[] 
var transaction_order=[] 

//Variable
var computed_data; 
var simed_data; 

//Lib 
const {
    addCash,
    addCoin,
    addEnergy,
    addFeeder,
    addLedger,
    deleteEnity,
    editEnergy
} = require('../services/blockchain')
const {compute,monthly_price} = require('../services/rtp')
const {ledger_request,loader} = require('../services/ledger')
const {readCSV,readCSVProp} = require('../services/lib')

//API
app.get('/load', (req, res) => { 
    var feeders = req.query.feeders; 
    var months = req.query.months; //ggwp 
    multiply=parseFloat(req.query.multiply) //Solar multiplier 
    prosumer_batt_multiplier=parseFloat(req.query.pro_batt_x) 
    ledger_batt_multiplier=parseFloat(req.query.ledg_batt_x) 
    
    if(feeders==="all"){ 
        feeders="" 
        for(i of feeders_list){ 
            feeders+=i+"," 
        } 
        feeders=feeders.slice(0,feeders.length-1) //trim last , 
    } 
    if(months==="all"){ 
        months="TotalYear" 
    } 
    let result = loader(feeders,months,multiply,function(result){ 
        res.send(result)
    }); 
}) 

app.get('/reset', (req, res) => { 
    loaded = false; 
    computed=false; 
    loaded_datas=[] 
    rtp_list=[] 
    sum_data=[] 
    feeder_property=[] 
    battery_property=[]; 
    battery_property=[]; 
    battery_ledger_stat=[] 
    transaction_order=[] 
    res.send('Simulation reset') 
}) 

app.get('/prosumer_batt_data', (req, res) => {  
    res.send(battery_property) 
}) 

app.get('/ledger_batt_data', (req, res) => {  
    res.send(battery_ledger_stat) 
}) 

app.get('/getLoadData', (req, res) => { 
    let body = JSON.stringify({ "payload": loaded_datas}) 
    res.send(body) 
}) 

app.get('/compute', (req, res) => { 
    let result = compute(function(result){ 
    let body = JSON.stringify({ //change into json string  "payload": result 
    })
    computed_data=body 
    res.send(body) 
    }); 
}) 

app.get('/getComputed', (req, res) => { 
    let result = compute(function(result){ 
    res.send(computed_data) 
    }); 
}) 

app.get('/getSimed', (req, res) => { 
    let result = compute(function(result){ 
    res.send(simed_data) 
    }); 
}) 

app.get('/setPriceRange', (req, res) => {
    // /setPriceRange?max=4&min=3  
    if(isNaN(req.query.max)&&isNaN(req.query.min)){ 
        maxPrice=req.query.max 
        minPrice=req.query.min 
    }else{ 
        res.send('setPrice failed') 
    } 
}) 

app.get('/sim', (req, res) => { //propose order table 
    //Simulator var 
    var excess_energy=[] // Supply - Demand 
    //var transaction_order=[] 
    var feederlist=[]; 
    for (data of loaded_datas.slice(0,loaded_datas.length)){ // [[feeder_id,data],..]  var temp_batt=0 
        var order=[] 
        var batt_prop_index; 
        for(i in battery_property){ 
            if(battery_property[i].feeder_id===data.feeder_id){ 
                batt_prop_index = i; 
            }
        } 
        var ledger_batt_index; 
        for(i in battery_ledger_stat){ 
            if(battery_ledger_stat[i].feeder_id===data.feeder_id){ 
            ledger_batt_index = i; 
        } 
    } 
    var count = 0 
    for(i in data.data.slice(0,data.data.length)){ //0 time 1production 2consumption 
        var supply = parseFloat(data.data[i][1]); 
        var demand = parseFloat(data.data[i][2]); 
        var time = data.data[i][0]; 
        var excess_energy = supply-demand; 
        var grid_buy = demand-supply; 
        var ledger_buy = 0 
        var ledger_sell = 0 
        if (excess_energy>0){ 
            grid_buy=0; 
        } 
        var action = ["","",0,0] //["Sell","Charge",sell_amount,charge_amount]  var batt_pow = battery_property[batt_prop_index].batt_pow; 
        var batt_cap = battery_property[batt_prop_index].batt_cap; 
        if(temp_batt===0){ 
            if(excess_energy>0){ //SELL ACTION  if(excess_energy>batt_pow){ 
            var sell_amount=excess_energy-batt_pow //Sell 
            var charge_amount=batt_pow; 
            temp_batt+=charge_amount //Charge 
            if (sell_amount>batt_pow){ //limit sell amount 
            sell_amount=batt_pow 
            } 
            let result =  
            ledger_request(data.feeder_id,"Sell",sell_amount,time,function(result){
            if(!(result=="deny")){ 
            ledger_sell = sell_amount 
            } 
            }); 
            action=["Sell","Charge",sell_amount,charge_amount] 
            }else if(excess_energy<=batt_pow){ 
            var charge_amount=excess_energy; 
            temp_batt+=charge_amount //Charge 
            action=["","Charge",0,charge_amount] 
            } 
        } 
        else if(excess_energy<0){ //BUY ACTION  var buy_amount= -excess_energy 
            if(buy_amount>batt_pow){ 
                buy_amount=batt_pow 
            } 
            let result =  ledger_request(data.feeder_id,"Buy",buy_amount,time,function(result){ 
            if(!(result=="deny")){ 
                grid_buy=grid_buy-buy_amount 
                ledger_buy=buy_amount 
            } 
        }); 
            action=["Buy","",buy_amount,0] 
            }else { 
            //Noaction 
            } 
         
        //NORMAL 
        else if(temp_batt<batt_cap && temp_batt>0){ 
            if(excess_energy>0){ //SELL  ACTION 
            if(excess_energy>batt_pow){ 
            var sell_amount=excess_energy-batt_pow 
            var charge_amount=batt_pow; 
            if(temp_batt+batt_pow >batt_cap){
            sell_amount+=temp_batt+batt_pow-batt_cap 
            charge_amount=batt_cap-temp_batt 
            } 
            if (sell_amount>batt_pow){ 
            sell_amount=batt_pow 
            } 
            let result =  
            ledger_request(data.feeder_id,"Sell",sell_amount,time,function(result){  if(!(result=="deny")){ 
            ledger_sell = sell_amount 
            } 
            }); 
            temp_batt+=charge_amount 
            action=["Sell","Charge",sell_amount,charge_amount] 
            }else if(excess_energy<=batt_pow){ 
            var charge_amount=excess_energy; 
            if(temp_batt+excess_energy >batt_cap){ 
            charge_amount=batt_cap-temp_batt 
            } 
            temp_batt+=charge_amount //Charge 
            action=["","Charge",0,charge_amount] 
            } 
            }else if(excess_energy<0){ //BUY ACTION  if(-excess_energy<=batt_pow){ 
            var discharge_amount = excess_energy 
            if(temp_batt+excess_energy <= 0 ){ 
            discharge_amount = -temp_batt 
            } 
            temp_batt+=discharge_amount 
            grid_buy=0; 
            action=["","Dcharge",0,discharge_amount] 
            }else if(-excess_energy>batt_pow){ 
            var discharge_amount = -batt_pow 
            if(temp_batt-batt_pow <= 0 ){ 
            discharge_amount = -temp_batt 
            } 
            temp_batt+=discharge_amount
            var buy_amount= -excess_energy-discharge_amount 
            if (buy_amount>batt_pow){ 
            buy_amount=batt_pow 
            } 
            let result =  
            ledger_request(data.feeder_id,"Buy",buy_amount,time,function(result){  if(!(result=="deny")){ 
            grid_buy=grid_buy-buy_amount 
            ledger_buy=buy_amount 
            } 
            }); 
            action=["Buy","Dcharge",buy_amount,-discharge_amount] 
            } 
        } 
    
        //FULL 
        else if(temp_batt>=batt_cap){ 
        if(excess_energy>0){ //SELL  ACTION 
        var sell_amount=excess_energy 
        if (sell_amount>batt_pow){ 
        sell_amount=batt_pow 
        } 
        let result =  
        ledger_request(data.feeder_id,"Sell",sell_amount,time,function(result){  if(!(result=="deny")){ 
        ledger_sell = sell_amount 
        } 
        action=["Sell","",sell_amount,0] 
        }); 
        }else if(excess_energy<0){ //BUY  ACTION 
        if(-excess_energy<=batt_pow){ 
        temp_batt+=excess_energy 
        action=["","Dcharge",0,-excess_energy] 
        }else if(-excess_energy>batt_pow){ 
        temp_batt-=batt_pow 
        var buy_amount= -excess_energy-batt_pow 
        if (buy_amount>batt_pow){
        buy_amount=batt_pow 
        } 
        let result =  
        ledger_request(data.feeder_id,"Buy",buy_amount,time,function(result){  if(!(result=="deny")){ 
        grid_buy=grid_buy-buy_amount 
        ledger_buy=buy_amount 
        } 
        }); 
        action=["Buy","Dcharge",buy_amount,batt_pow] 
        } 
        } 
        } 
        var splitted=time.split(" ")[1].split(":") 
        var grid_price=2.62 
        if(splitted[0]>=9 && splitted[0]<=22){ 
        grid_price=4.355 
        } 
        let body = JSON.stringify({ 
            "feeder_id": data.feeder_id, 
            "time": time, 
            "action": action, 
            "grid_buy" : grid_buy, 
            "ledger_buy" : ledger_buy, 
            "ledger_sell" : ledger_sell, 
            "temp_batt" : temp_batt, 
            "batt_percent" : (temp_batt/batt_cap)*100, 
            "ledg_batt_percent" :  (battery_ledger_stat[ledger_batt_index].batt_bal/battery_ledger_stat[ledger_batt_index].batt_cap)*100, 
            "rt_price" : rtp_list[count][1], 
            "grid_price" : grid_price 
        }) 
        process.stdout.clearLine(); 
        process.stdout.write("Time :"+JSON.parse(body).time+" action:"+JSON.parse(body).action); 
        process.stdout.cursorTo(0); 
        order.push(JSON.parse(body)) 
        count++; 
    } 
    transaction_order.push(order) 
    } 
    let body = JSON.stringify({ 
    "payload": transaction_order 
    }) 
    simed_data=body; 
    //monthly_price("F2","") 
    monthly_price("F9","") 
    res.send(body) 
}) 

module.exports = router








