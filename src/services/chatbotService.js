import request from "request";
require('dotenv').config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    }
    // Send the HTTP request to the Messenger Platform
    request({
      "uri": "https://graph.facebook.com/v14.0/me/messages",
      "qs": { "access_token": PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    }); 
  }

let getUserName = (sender_psid) => {
    return new Promise((resolve, reject) => {
        request({
            "uri": `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`,
            "method": "GET"
          }, (err, res, body) => {
              console.log(body);
            if (!err) {
                let response = JSON.parse(body);
                let userName = `${response.first_name} ${response.last_name}`;
                resolve(userName);
            } else {
              console.error("Unable to send message:" + err);
              reject(err);
            }
          }); 
    })
      
}

let handleGetStarted = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        const info = await getUserName(sender_psid);
        const response = { "text": `OK. Xin chào mừng bạn ${info} đến với nhà hàng` };
        const responseTemplate = resTemplateGetStarted();
        try {
            await callSendAPI(sender_psid, response);
            await callSendAPI(sender_psid, responseTemplate);
            resolve("Done");
        } catch (error) {
            reject(error);
        }

    })
}
let resTemplateGetStarted = () => {
    const response = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": "Xin chào bạn đến nhà hàng!",
              "subtitle": "Dưới đây là các lựa chọn của nhà hàng",
              "image_url": 'https://img.freepik.com/free-photo/cozy-restaurant-with-people-waiter_175935-230.jpg?w=2000',
              "buttons": [
                {
                  "type": "postback",
                  "title": "MENU CHÍNH",
                  "payload": "MAIN_MENU",
                },
                {
                  "type": "postback",
                  "title": "ĐẶT BÀN",
                  "payload": "RESERVE_TABLE",
                },
                {
                    "type": "postback",
                    "title": "HƯỚNG DẪN SỬ DỤNG BOT",
                    "payload": "GUIDE_TO_USE",
                  }
              ],
            }]
          }
        }
    };
    return response;
}
module.exports = {handleGetStarted};