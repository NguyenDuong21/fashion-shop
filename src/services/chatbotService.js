import request from "request";
require("dotenv").config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
let sendTypingOn = (sender_psid) => {
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    sender_action: "typing_on",
  };
  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v14.0/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        console.log("TypingOn sent!");
      } else {
        console.error("Unable to send TypingOn:" + err);
      }
    }
  );
};
let sendMark_seen = (sender_psid) => {
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    sender_action: "mark_seen",
  };
  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v14.0/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        console.log("mark_seen sent!");
      } else {
        console.error("Unable to send mark_seen:" + err);
      }
    }
  );
};
async function callSendAPI(sender_psid, response) {
  return new Promise(async (resolve, reject) => {
    try {
      let request_body = {
        recipient: {
          id: sender_psid,
        },
        message: response,
      };
      await sendMark_seen(sender_psid);
      await sendTypingOn(sender_psid);
      // Send the HTTP request to the Messenger Platform
      request(
        {
          uri: "https://graph.facebook.com/v14.0/me/messages",
          qs: { access_token: PAGE_ACCESS_TOKEN },
          method: "POST",
          json: request_body,
        },
        (err, res, body) => {
          if (!err) {
            resolve("message sent!");
          } else {
            console.error("Unable to send message:" + err);
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
  // Construct the message body
}

let getUserName = (sender_psid) => {
  return new Promise((resolve, reject) => {
    request(
      {
        uri: `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`,
        method: "GET",
      },
      (err, res, body) => {
        console.log(body);
        if (!err) {
          let response = JSON.parse(body);
          let userName = `${response.first_name} ${response.last_name}`;
          resolve(userName);
        } else {
          console.error("Unable to send message:" + err);
          reject(err);
        }
      }
    );
  });
};

let handleGetStarted = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    const info = await getUserName(sender_psid);
    const response = { text: `OK. Xin chào mừng bạn ${info} đến với nhà hàng` };
    const responseTemplate = getImageMessTemplate(sender_psid);
    const responseTemplateQuickReply =
      resTemplateGetStartedQuickReplyTemplate(sender_psid);
    try {
      await callSendAPI(sender_psid, response);
      await callSendAPI(sender_psid, responseTemplate);
      await callSendAPI(sender_psid, responseTemplateQuickReply);
      resolve("Done");
    } catch (error) {
      reject(error);
    }
  });
};
let resTemplateGetStarted = (sender_psid) => {
  const response = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [
          {
            title: "Xin chào bạn đến nhà hàng!",
            subtitle: "Dưới đây là các lựa chọn của nhà hàng",
            image_url:
              "https://img.freepik.com/free-photo/cozy-restaurant-with-people-waiter_175935-230.jpg?w=2000",
            buttons: [
              {
                type: "postback",
                title: "MENU CHÍNH",
                payload: "MAIN_MENU",
              },
              {
                type: "web_url",
                url: `${process.env.URL_WEB_VIEW_ORDER}/${sender_psid}`,
                title: "ĐẶT BÀN",
                webview_height_ratio: "tall",
                messenger_extensions: true,
              },
              {
                type: "postback",
                title: "HƯỚNG DẪN SỬ DỤNG BOT",
                payload: "GUIDE_TO_USE",
              },
            ],
          },
        ],
      },
    },
  };
  return response;
};

let resTemplateGetStartedQuickReplyTemplate = () => {
  let response = {
    text: "Đưới đây là các lựa chọn của nhà hàng",
    quick_replies: [
      {
        content_type: "text",
        title: "MENU CHÍNH",
        payload: "MAIN_MENU",
      },
      {
        content_type: "text",
        title: "HD SỬ DỤNG BOT",
        payload: "GUIDE_TO_USE",
      },
    ],
  };
  return response;
};
let getMainMenuTemplate = (sender_psid) => {
  const response = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [
          {
            title: "Menu của nhà hàng",
            subtitle:
              "Chúng tôi hân hạnh mang đến cho bạn thực đơn phong phú cho bữa trưa hoặc bữa tối.",
            image_url:
              "https://img.freepik.com/free-vector/modern-restaurant-menu-fast-food_52683-48982.jpg?w=2000",
            buttons: [
              {
                type: "postback",
                title: "BỮA TRƯA",
                payload: "LUNCH_MENU",
              },
              {
                type: "postback",
                title: "BỮA TỐI",
                payload: "DINNER_MENU",
              },
            ],
          },
          {
            title: "Giờ mở cửa",
            subtitle: "T2-T6 10AM - 11PM | T7 5PM - 10PM | CN 5PM - 9 PM",
            image_url:
              "https://upload.wikimedia.org/wikipedia/commons/6/62/Barbieri_-_ViaSophia25668.jpg",
            buttons: [
              {
                type: "web_url",
                url: `${process.env.URL_WEB_VIEW_ORDER}/${sender_psid}`,
                title: "ĐẶT BÀN",
                webview_height_ratio: "tall",
                messenger_extensions: true,
              },
            ],
          },
          {
            title: "Không gian nhà hàng",
            subtitle:
              "Nhà hàng có sức chứa lên đến 300 khách ngồi và phục vụ các bữa tiệc lớn",
            image_url:
              "https://dquahotel.com/FileStorage/Article/Thumbnail/restaurant-resize_22.jpg",
            buttons: [
              {
                type: "postback",
                title: "CHI TIẾT",
                payload: "SHOW_ROOMS",
              },
            ],
          },
        ],
      },
    },
  };
  return response;
};
const handleMainMenu = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    const responseTemplate = getMainMenuTemplate(sender_psid);
    try {
      await callSendAPI(sender_psid, responseTemplate);
      resolve("Done");
    } catch (error) {
      reject(error);
    }
  });
};
let getLunchTemplate = () => {
  const response = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [
          {
            title: "Món tráng miệng",
            subtitle: "Nhà hàng có nhiều món tráng miệng",
            image_url:
              "https://doanhnhanplus.vn/wp-content/uploads/2020/02/YummyBestDesserts-Main.jpg",
            buttons: [
              {
                type: "postback",
                title: "XEM CHI TIẾT",
                payload: "VIEW_APPETIZERS",
              },
            ],
          },
          {
            title: "Cá bảy màu",
            subtitle: "Cá bảy màu nước mặn và nước ngọt",
            image_url:
              "https://congthucmonngon.com/wp-content/uploads/2021/09/hoc-ngay-mon-ca-chien-gion-xot-chua-ngot-vua-ngon-vua-dep-cho-tiec-cuoi-nam-them-tron-d.jpg",
            buttons: [
              {
                type: "postback",
                title: "XEM CHI TIẾT",
                payload: "VIEW_FISH",
              },
            ],
          },
          {
            title: "Thịt hun khói",
            subtitle: "Thịt trâu hun khói đảm bảo chất lượng hàng đầu",
            image_url:
              "https://cdn.tgdd.vn/2020/11/CookProduct/thit-xong-khoi-bap-bo-ngon1200-1200x676-2.jpg",
            buttons: [
              {
                type: "postback",
                title: "XEM CHI TIẾT",
                payload: "VIEW_MEAT",
              },
            ],
          },
        ],
      },
    },
  };
  return response;
};

const handelLunchMenu = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    const responseTemplate = getLunchTemplate();
    try {
      await callSendAPI(sender_psid, responseTemplate);
      resolve("Done");
    } catch (error) {
      reject(error);
    }
  });
};

let getDinnerTemplate = () => {
  const response = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [
          {
            title: "Đồ uống",
            subtitle: "Các loại đồ uống của nhà hàng",
            image_url:
              "https://capherangxay.vn/wp-content/uploads/2020/02/Kinh-doanh-do-uong-va-nhung-dieu-can-chuan-bi.jpg",
            buttons: [
              {
                type: "postback",
                title: "XEM CHI TIẾT",
                payload: "VIEW_DRINKS",
              },
            ],
          },
          {
            title: "Thịt chân giò luộc",
            subtitle: "Thịt chân lợn luộc ngũ vị",
            image_url:
              "https://cdn.tgdd.vn/2020/07/CookProduct/123445-1200x676-1.jpg",
            buttons: [
              {
                type: "postback",
                title: "XEM CHI TIẾT",
                payload: "VIEW_DINNER2",
              },
            ],
          },
          {
            title: "Tép rang",
            subtitle: "Tép rang tươi ngon",
            image_url:
              "https://nauankhongkho.com/wp-content/uploads/2015/12/21.png",
            buttons: [
              {
                type: "postback",
                title: "XEM CHI TIẾT",
                payload: "VIEW_DINNER3",
              },
            ],
          },
        ],
      },
    },
  };
  return response;
};

const handelDinnerMenu = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    const responseTemplate = getDinnerTemplate();
    try {
      await callSendAPI(sender_psid, responseTemplate);
      resolve("Done");
    } catch (error) {
      reject(error);
    }
  });
};

const getImageMessTemplate = () => {
  const res = {
    attachment: {
      type: "image",
      payload: {
        url: "https://farm8.staticflickr.com/7889/45671348435_0708c170a1_o.jpg",
        is_reusable: true,
      },
    },
  };
  return res;
};

const getButtonTemplate = (sender_psid) => {
  const res = {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: "Nhà hàng có thể phục vụ tối đa 300 khách",
        buttons: [
          {
            type: "postback",
            title: "MENU CHÍNH",
            payload: "MAIN_MENU",
          },
          {
            type: "web_url",
            url: `${process.env.URL_WEB_VIEW_ORDER}/${sender_psid}`,
            title: "ĐẶT BÀN",
            webview_height_ratio: "tall",
            messenger_extensions: true,
          },
        ],
      },
    },
  };
  return res;
};

const handelReserveTable = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    const responseTemplate = getImageMessTemplate();
    const responseBtnTemplate = getButtonTemplate(sender_psid);

    try {
      await callSendAPI(sender_psid, responseTemplate);
      await callSendAPI(sender_psid, responseBtnTemplate);
      resolve("Done");
    } catch (error) {
      reject(error);
    }
  });
};
const handleGuideToUse = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    const info = await getUserName(sender_psid);
    const response = {
      text: `Xin chào bạn ${info}, mình là chatbot bán hàng. \n Xem video để biết thêm chi tiết. 😀😀  `,
    };
    const responseBtnTemplate = getBotMediaTemplate(sender_psid);

    try {
      await callSendAPI(sender_psid, response);
      await callSendAPI(sender_psid, responseBtnTemplate);
      resolve("Done");
    } catch (error) {
      reject(error);
    }
  });
};

function getBotMediaTemplate() {
  let response = {
    attachment: {
      type: "template",
      payload: {
        template_type: "media",
        elements: [
          {
            media_type: "video",
            url: "https://business.facebook.com/ecommercefashiondev/videos/738400213859757/",
            buttons: [
              {
                type: "postback",
                title: "MENU CHÍNH",
                payload: "MAIN_MENU",
              },
              {
                type: "web_url",
                title: "Shop now",
                url: "https://restaurant-bot-mess.herokuapp.com/",
              },
            ],
          },
        ],
      },
    },
  };
  return response;
}

module.exports = {
  handleGetStarted,
  handleMainMenu,
  handelLunchMenu,
  handelDinnerMenu,
  handelReserveTable,
  getUserName,
  handleGuideToUse,
};
