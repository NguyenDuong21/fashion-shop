$(document).ready(function () {
    function showLoadDetail(th) {
        $('#load').addClass('loading2');
        $(th).attr('disabled', true);
        $(th).css('cursor', 'not-allowed');
    }
    function hideLoadDetail(th) {
        $('#load').removeClass('loading2');
        $(th).attr('disabled', false);
        $(th).css('cursor', 'pointer');
    }
    $('.detail-trans').on('click', function () {
        let transId = $(this).data('id');
        let th = this;
        showLoadDetail(th);
        $.ajax({
            url: "/admin/get-detail-tran",
            method: "post",
            dataType: "json",
            data: { transId }
        }).done(function (res) {
            if (res.code == 200) {
                let targetTransaction = res.message;
                let itemPurchase = '';
                $('.person-trans').html(targetTransaction.TranOrder[0].Customer[0].userName);
                $('.date-trans').html( moment(targetTransaction.createdAt).format("MMMM Do YYYY"));
                $('.bill-address').html( targetTransaction.TranOrder[0].address);
                $('.tran-id').html( targetTransaction.code);
                $('.tran-email').html(targetTransaction.TranOrder[0].email);
                $('.method').html(targetTransaction.mode);
                $('.total').html(targetTransaction.mode == "PAYPAL" ? `$${targetTransaction.amount}` : formatter.format(targetTransaction.amount));
                targetTransaction.TranOrder[0].Product.forEach(function(e,i){
                    itemPurchase +=` 
                            <a href="/admin/detail?o=${targetTransaction.TranOrder[0].id}" target="_blank" style="text-decoration: underline;"> ${e.name} <i class='bx bx-arrow-to-right'></i>  </a> 
                        <br> `;
                });
                $('.item-purchase').html(itemPurchase);
            }
            hideLoadDetail(th);
            if($('.trans-detail').hasClass('d-none')) {
                $('.trans-detail').removeClass('d-none');
                $('.blank-detail').remove();
            }
        }).fail(function (jqXHR, exception) {
            showToast("Thông báo", "error", "Đã có lỗi xảy ra, không thể tải dữ liệu");
        }).always(function () {
            hideLoadDetail(th);
        });
    })
})