const HEADERS = { 
    'Content-Type': 'application/json' 
} 

function curlPut(method, body) { 
    request.put({ 
    url: 'http://0.0.0.0:3000/api/' + method, headers: HEADERS, 
    body: body 
    }, (err, res, body) => { 
    console.log('status = ' + res.statusCode)  // console.log('body = '+body) 
    }) 
} 

function curlPost(method, body,callback) { request.post({ 
    url: 'http://0.0.0.0:3000/api/' + method, headers: HEADERS, 
    body: body 
    }, (err, res, body) => { 
    console.log('status = ' + res.statusCode)  
    if(callback){ 
    callback(res.statusCode); 
    } 
    //console.log('body = '+body) 
    }) 
} 

function curlGet(method, body) { 
    request.get({ 
        url: 'http://0.0.0.0:3000/api/' + method, headers: HEADERS, 
        body: body
    }, (err, res, body) => { 
    console.log('status = ' + res.statusCode) 
    //console.log('body = '+body) 
    }) 
} 

function curlDelete(method, body) { 
    request.delete({ 
    url: 'http://0.0.0.0:3000/api/' + method, 
    headers: HEADERS, 
    body: body 
    }, (err, res, body) => { 
    console.log('status = ' + res.statusCode) 
    //console.log('body = '+body) 
    }) 
} 

module.exports = {
    curlDelete,
    curlGet,
    curlPost,
    curlPut
}
