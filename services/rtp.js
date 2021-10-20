function compute(callback){ //compute rtp 
    if(!computed){ 
    computed=true 
    if(sum_data.length<=1){ 
    for(index in loaded_datas){ 
    for(element_index in loaded_datas[index].data){ 
    if(index==0){
    sum_data.push(loaded_datas[index].data[element_index]) 
    }else { 
     
   sum_data[element_index][1]=parseFloat(sum_data[element_index][1])+parseFloat(loaded_datas [index].data[element_index][1]) 
     
   sum_data[element_index][2]=parseFloat(sum_data[element_index][2])+parseFloat(loaded_datas [index].data[element_index][2]) 
    } 
    } 
    } 
    } 
    var minmax=[]// container of daily_minmax 
    var daily_minmax=[] //variation container 
    var count_element=0 
    var count=0; 
    for(i in sum_data){ 
    count_element++; 
    //console.log(sum_data[i][0].split("/")[0]) 
    var s=parseFloat(sum_data[i][1]); 
    var d=parseFloat(sum_data[i][2]); 
    var variation = s/d; 
    if(d==0){ 
    variation=0 
    } 
    daily_minmax.push(variation); 
    if(count_element==96){ 
    count++; 
    count_element=0; 
    minmax.push(daily_minmax); 
    var minima= Math.min.apply(Math,daily_minmax) 
    var maxima= Math.max.apply(Math,daily_minmax) 
    var output_range= minPrice-maxPrice; 
    var input_range = maxima-minima; 
    for(j in sum_data.slice(parseFloat(i)-95,parseFloat(i)+1)){  timestamp= sum_data[parseFloat(i)-95+parseFloat(j)][0]; 
    var price = ((daily_minmax[j] - minima)*output_range / input_range + maxPrice)  if(isNaN(price)){//d==0 
    price=minPrice 
    }
    rtp_list.push([timestamp,price]); 
    } 
    daily_minmax=[] 
    } 
   } 
    callback(rtp_list) 
    } 
}

function monthly_price(feeder_id,callback){ 
    var order_index; 
    for(i in transaction_order){ 
    if(transaction_order[i][0].feeder_id===feeder_id){ 
    order_index = i; 
    } 
    } 
    var month_price_list=[] 
    for (i in transaction_order[order_index]){ 
    var data = transaction_order[order_index][i]; 
    //console.log(data.grid_buy*data.gride_price) 
    //Y/M/d h:m 
    var splitted = data.time.split("/"); 
    // Date(year, month, day, hours, minutes, seconds, milliseconds);  var month = splitted[1];
    var d = new Date(splitted[2].split(" ")[0],splitted[1],splitted[0])  let body = JSON.stringify({ 
    "feeder_id": feeder_id, 
    "month": splitted[1], 
    "profit_ledger": data.ledger_sell*data.rt_price, 
    "cost_ledger": data.ledger_buy*data.rt_price, 
    "cost_grid": data.grid_buy*data.grid_price, 
    "net_cost": (data.grid_buy*data.grid_price)+(data.ledger_buy*data.rt_price)- (data.ledger_sell*data.rt_price) 
    }) 
    if(month_price_list.length>0){ 
    var found=false 
    for (j in month_price_list){ 
    if(month_price_list[j].month==month){ 
    found=true 
    
    month_price_list[j].cost_ledger=month_price_list[j].cost_ledger+(data.ledger_buy*data.rt_ price) 
    
    month_price_list[j].cost_grid=month_price_list[j].cost_grid+(data.grid_buy*data.grid_pric e) 
    
    month_price_list[j].profit_ledger=month_price_list[j].profit_ledger+(data.ledger_sell*dat a.grid_price) 
    
    month_price_list[j].net_cost=month_price_list[j].net_cost+(data.grid_buy*data.grid_price) +(data.ledger_buy*data.rt_price)-(data.ledger_sell*data.rt_price) 
    } 
    } 
    if(!found){ 
    month_price_list.push(JSON.parse(body)) 
    } 
    }else{ 
    month_price_list.push(JSON.parse(body)) 
    } 
    } 
    
    console.log("==========================================================================")  console.log(" ") 
    console.log("Solar multiplier x"+multiply+" Prosumer batt multiplier  x"+prosumer_batt_multiplier+" Ledger batt multiplier x"+ledger_batt_multiplier) 
    console.log(" ")
    
    console.log("==========================================================================")  console.log(" ") 
    //console.log(month_price_list) 
    console.log("feeder_id,month,profit_ledger,cost_ledger,cost_grid,net_cost")  for (i in month_price_list){ 
    
    console.log(month_price_list[i].feeder_id+","+month_price_list[i].month+","+month_price_l ist[i].profit_ledger+","+month_price_list[i].cost_ledger+","+month_price_list[i].cost_gri d+","+month_price_list[i].net_cost) 
    } 
    console.log(" ") 
    console.log("============================== END  
    =======================================") 
    console.log(" ") 
    console.log(" ") 
} 

module.exports = {compute,monthly_price}