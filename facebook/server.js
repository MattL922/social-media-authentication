var express = require("express");
var https   = require("https");
var qs      = require("querystring");
var mysql   = require("mysql");

var app = express();

/* Routes */

app.route("/")
    .all(function(req, res, next)
    {
        res.sendfile("index.html");
    });

app.route("/login")
    .get(function(req, res, next)
    {
        res.redirect("https://www.facebook.com/dialog/oauth?client_id={app_id}&redirect_uri={redirect_uri}");
    });

app.route("/auth")
    .get(function(req, res, next)
    {
        var code = req.query.code;
        console.log(code);
        https.get("https://graph.facebook.com/oauth/access_token?" + 
            "client_id={app_id}" +
            "&redirect_uri={redirect_uri}" +
            "&client_secret={app_secret}" +
            "&code=" + code,
            function(token_response)
            {
                token_response.on("data", function(token_response_data)
                {
                    token_data = qs.parse(token_response_data.toString());
                    console.log(token_data);
                    https.get("https://graph.facebook.com/debug_token?" +
                        "input_token=" + token_data.access_token + "&" +
                        "access_token={app_id}|{app_secret}",
                        function(inspect_response)
                        {
                            inspect_response.on("data", function(inspect_response_data)
                            {
                                inspect_data = JSON.parse(inspect_response_data.toString());
                                console.log("user_id: " + inspect_data.data.user_id);
                                // Do something meaningful
                            });
                        }
                    ).on("error", function(e)
                    {
                        console.log("error: " + e.message);
                    });
                });
            }
        ).on("error", function(e) {
            console.log("error: " + e.message);
        });
    });

/* Start the server */

var server = app.listen("3000", function()
{
    console.log("listening on port %d...", server.address().port);
});

