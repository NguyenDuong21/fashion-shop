$(document).ready(function() {
  $('.minus').on('click', function() {
    if ($(this).parents('tr').find('.qty').val() > 1) {
      const idProduct = $(this).data('id');
      addToCart(idProduct, -1);
    }

  });
  $('.plus').on('click', function() {
    if ($(this).parents('tr').find('.qty').val() < 10) {
      const idProduct = $(this).data('id');
      addToCart(idProduct, 1);
    }
  })
  $('.del-pro').on('click', function(e) {
    e.preventDefault();
    const idProduct = $(this).data('id');
    $.ajax({
      url: '/cart/delete-cart',
      method: 'post',
      dataType: 'json',
      data: { idProduct }
    }).done(function(res) {})
    $(this).parents('tr').remove();
  })
})