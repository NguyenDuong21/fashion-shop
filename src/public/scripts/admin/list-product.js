$(document).ready(function() {
  $('.adjust-price').on('click', function(e) {
    e.preventDefault();
    let cellPrice = $(this).parents('tr').find('td.cell-price');
    cellPrice.html(`<div class="input-group">
    <input type="text" class="form-control" value='${cellPrice.data('price')}' >
    <span class="input-group-text">Đ</span>
  </div>`)
    $(this).addClass('confirm-adjust');
    $(this).html('<i class="fas fa-check"></i>');
  });
});