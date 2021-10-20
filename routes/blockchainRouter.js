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


app.get('/editEnergy', (req, res) => { 
    // /editEnergy?EnergyID=xx&value=xx&ownerID=xx  
    editEnergy(req.query.EnergyID,req.query.value,req.query.ownerID) 
    res.send("done") 
}) 

app.get('/addLedger', (req, res) => { //  
    // /addLedger?utilityID=xx&name=xx&capacity=xx&coin=xx&energy=xx 
    addLedger(req.query.utilityID,req.query.name,req.query.capacity,req.query.coin,req.query. energy) 
    res.send("done") 
}) 

app.get('/addLedgerALL', (req, res) => { //  
// /addLedger?utilityID=xx&name=xx&capacity=xx&coin=xx&energy=xx 
    var cap=0 
    var energy=0 
    for(batt_prop of battery_property){ 
    cap+=batt_prop.batt_cap 
    energy+=batt_prop.batt_pow 
    } 
    addLedger("L1","Microgrid Manager",cap,1000000,energy) 
    res.send("done") 
}) 

app.get('/addFeeder', (req, res) => { //  
    // /addFeeder?residentID=xx&firstName=xx&lastName=xx&capacity=xx&energy=xx&coin=xx
    addFeeder(req.query.residentID,req.query.firstName,req.query.lastName,req.query.capacity, req.query.energy,req.query.coin) 
    res.send("done") 
}) 

app.get('/addFeederAll', (req, res) => { //  
    // /addFeeder?residentID=xx&firstName=xx&lastName=xx&capacity=xx&energy=xx&coin=xx 
    for(i of feeders_list){ 
        for(batt_prop of battery_property){ 
            if(batt_prop.feeder_id===i){ 
                addFeeder(i,"Feeder_"+i,"TU",batt_prop.batt_cap,batt_prop.batt_pow,0)  
            } 
        } 
    } 
    res.send("done") 
}) 

app.get('/delete', (req, res) => { // /delete?id=? 
 deleteEnity(req.query.id) 
 res.send("done") 
})

module.exports = router