/* jshint node: true */
var express = require("express");
var router = express.Router();
var request = require("request");
var euri_credential = "https://rhn-support-dzhao:redhat@api.access.redhat.com/rs/entitlements";
var euri = "https://api.access.redhat.com/rs/entitlements";
var euri1 = "https://summitdemo:redhat100@api.access.redhat.com/rs/entitlements";
var eurl_ci="https://summitdemo:redhat100@api.access.devgssci.devlab.phx1.redhat.com/rs/entitlements";
var eurl_qa="https://api.access.qa.redhat.com/rs/entitlements";
var noEntitlements="rs/entitlements/null";
var cookie    = require('cookie');
var fs = require('fs');
var cookies;
var jwt = require('jsonwebtoken');
var jwt_token;
fs.readFile('cookie.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  cookies=cookie.parse(data);
  console.log("jwt" + cookies.rh_jwt);
  console.log("sso" + cookies.rh_sso);
});

fs.readFile('jwt.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  console.log(data);
  jwt_token=data;
});

function getToken(){
    if (!jwt_token) {
        console.error("No jwt found!");
        return;
    }

    var info = jwt.decode(jwt_token);
    if (!info) {
        console.log("Failed to decode jwt!");
        return;
    }
    console.log(info);
    var isInternal = false;
    if (info.realm_access && info.realm_access.roles) {
        var roles = info.realm_access.roles;
        for (var i in roles) {
            if (roles[i] === "redhat:employees") {
                isInternal = true;
                break;
            }
        }
    }
    return {
        sso_username: info.username,
        first_name: info.firstName,
        last_name: info.lastName,
        account_number: info.account_number,
        email: info.email,
        is_internal: isInternal
    };
}


/* GET entitlements listing. */
 router.get("/", function (req, res, next) {
 //request = request.defaults({jar: true});
   var ss='a string';
   var type = typeof ss;
   console.log("type " + typeof ss);
   if(type === 'string'){
     console.log("a string");
}
   request({
        uri: eurl_qa,
        method: "GET",
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10,
        rejectUnauthorized: false,
        headers: {
            'Cookie': 'rh_jwt='+cookies,
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json, application/xml, */*'
        }
    }, function(error, response, body) {
        if (body==null || body.startsWith("401 Unauthorized")){
            console.log("Failed to get entitlement data");
            res.send("Failed to get entitlement data\n" + body);
        }else if(body.indexOf(noEntitlements)!=-1){
             console.log("No entitlements");
             res.send("<strong>You have no entitlements</strong>"+body);
        }else {
             console.log("Valid entitlements found");
             res.send("<strong>You have entitlements</strong><br>"+body);
        }
    });
    
});

module.exports = router;