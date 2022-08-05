$(document).ready(function() {
  $('.btn-save-voucher').on('click', function(e) {
    let voucherId = $(this).data('id');
    if (voucherId) {
      $.ajax({
        url: "/saveVoucher",
        method: 'post',
        data: { voucherId },
        dataType: 'json'
      }).done(function(res) {
        if (res.code = 200) {
          showToast('Thông báo', 'success', 'Lưu voucher thành công');
        } else {
          showToast('Thông báo', 'error', 'Có lỗi xảy ra. Vui lòng thử lại');
        }
      })
    }
    $(this).parents('.voucher-wraper').remove();
  })
})