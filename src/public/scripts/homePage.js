$(document).ready(function () {
  $(".add-to-card").on("click", function (e) {
    e.preventDefault();
    const product_id = $(this).data("idsp");
    const urlAddCart =
      location.protocol + "//" + location.host + "/cart/add-cart";
    $.ajax({
      url: urlAddCart,
      method: "post",
      data: { id: product_id },
      dataType: "json",
    }).done(function (res) {
      if (res.message == "success") {
        $("#modalAddcart").find(".amount").html(res.numItem);
        $("#modalAddcart").find(".totalPrice").html(res.totalPrice);
        $("#modalAddcart").find(".img-cart").attr("src", res.productAdd.image);
        $(".item-count").html(res.numItemDistince);
        $("#modalAddcart").modal("show");
      } else {
        console.log(
          "Có lỗi sảy ra. Hãy chắc chắn bạn đã đăng nhập. Hãy thử lại!"
        );
      }
    });
  });
  $(".quick-view").on("click", function (e) {
    e.preventDefault();
    let idPro = $(this).data("idquickview");
    const urlGetDetail =
      location.protocol + "//" + location.host + "/detail/" + idPro;
    $.ajax({
      url: urlGetDetail,
      method: "get",
      data: { isAjax: 1 },
      dataType: "json",
    }).done(function (res) {
      $(".product-image-large-image img").attr("src", res.image);
      $("#namequickview").html(res.name);
      $("#pricequickview").html(formatter.format(res.price.$numberDecimal));
      $("#pricequickview").html(formatter.format(res.price.$numberDecimal));
    });
    //#modalQuickview
  });
});
