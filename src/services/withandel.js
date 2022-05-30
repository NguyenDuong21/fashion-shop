function responseFromWit(data) {
  console.log("data from wit:");
  console.log(JSON.stringify(data));

  const intent = (data.intents.length > 0 && data.intents[0]) || "__foo__";
  switch (intent.name) {
    case "chao_hoi":
      return LoiGioiThieu(data);
    default:
      return handleGibberish();
  }
}

//Đây là câu trả lời mặc định
function handleGibberish() {
  return "Xin lỗi! Tôi chưa được dạy để trả lời câu này! :((";
}

// ----------------------------------------------------------------------------
// Chào hỏi
function LoiGioiThieu(data) {
  const entities = data.entities;
  var keys = Object.keys(entities);
  //Nếu xác định được thực thể
  if (keys.length > 0) {
    const entity = data.entities[keys[0]][0];
    switch (entity.name) {
      case "chat_bot":
        return "Đúng rồi! Tôi là Agitech bot.";
      case "admin":
        return "Không không! Tôi chỉ là chat bot. Admin là người đã tạo ra tôi :))";
      default:
        return handleGibberish();
    }
  } else {
    return "Xin chào! Tôi là Agitech bot chuyên viên trả lời tự động.";
  }
}

module.exports = responseFromWit;
