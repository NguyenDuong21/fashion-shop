$(document).ready(function() {
  $('.validate').on('click', function() {
    $(this).html($(this).data('loading'));
    $(this).prop('disabled', true);
    let otpArr = [];
    $('.rounded').each(function() {
      otpArr.push($(this).val());
    })
    let otpStr = otpArr.join('');
    $.ajax({
      url: '/validate-otp',
      method: "post",
      dataType: 'json',
      data: { plantOtp: otpStr, email: $('.form__email').val() }
    }).done(function(res) {
      if (res.code == "success") {
        $('.step-two__infor').removeClass('d-none');
        $('.verify-otp').addClass('d-none');
      } else {
        window.alert(res.message);
      }
    }).always(function() {
      $('.validate').html($('.validate').data('normal'));
      $('.validate').prop('disabled', false);
    })
  });

  $(".get-otp").on('click', function() {
    $(this).addClass('d-none');
    $('.button-loading').removeClass('d-none');
    let email = $('.form__email').val();
    $.ajax({
      url: '/get-otp',
      method: 'post',
      dataType: 'json',
      data: { email }
    }).done(function(res) {
      if (res.code == "success") {
        $('.verify-otp').removeClass('d-none');
        $('.form-parent__email').addClass('d-none');
        count_down();
      } else {
        $(this).removeClass('d-none');
        $('.button-loading').addClass('d-none');
        window.alert(res.message);
      }
    }).always(function() {
      $('.get-otp').removeClass('d-none');
      $('.button-loading').addClass('d-none');
    });
  })

  function count_down() {
    $('.count-down-wrap').html(`<p class="text-primary count-down">(<span class="count-đown__second">60</span>)s</p>`);
    let countDown = setInterval(function() {
      let curentSecond = $('.count-đown__second').html();
      if (curentSecond == '0') {
        clearInterval(countDown);
        $('.count-down-wrap').html('<a href="javascrip:void(0)" class="resendOtp">Gửi lại</a>');
      }
      $('.count-đown__second').html(curentSecond - 1);
    }, 1000);
  }
  count_down();
})