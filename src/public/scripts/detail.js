$(document).ready(function() {
  let objClassify = {};

  function addConditionFindModel() {
    $('.product-variation--selected').each(function() {
      let nameClassify = $(this).parent().data('classify');
      objClassify[nameClassify] = $(this).html().trim();
    });
  }

  function sendAjaxGetModelProduct() {
    let arrCondition = [];
    for (const key in objClassify) {
      arrCondition.push(objClassify[key]);
    }
    // let combineCondition = arrCondition.join();
    const urlParams = new URLSearchParams(window.location.search);
    const spid = urlParams.get('spid');
    $.ajax({
      url: '/get-model',
      method: 'post',
      dataType: 'json',
      data: { spid, arrCondition }
    }).done(function(res) {
      if (res.message === "success") {
        const { normal_stock, price, id } = res.model;
        $('.pro-price__standash').html(formatter.format(price.$numberDecimal));
        $('#stock').html(normal_stock);
        $('.cart').data('id', id);
      }
    })

  }
  $('.product-variation').on('click', function() {
    if ($(this).hasClass('product-variation--selected')) {
      $(this).removeClass('product-variation--selected');
      let nameClassify = $(this).parent().data('classify');
      delete objClassify[nameClassify];
    } else {
      $(this).parent('.items-center').find('.product-variation--selected').removeClass('product-variation--selected');
      $(this).addClass('product-variation--selected');
      addConditionFindModel();
    }
    sendAjaxGetModelProduct();
  });
  $('.cart').on('click', function(e) {
    e.preventDefault();
    let id = $(this).data('id');
    addToCart(id, $('.qty').val());
    console.log(id);
    getCartModal();
  });
})