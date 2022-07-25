$("#apply-coupon").on("click", function () {
  if (!$("#coupon-code").val()) {
    $(".status-coupon").html("Mã giảm giá chưa được nhập");
    return;
  }
});
