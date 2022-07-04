$(document).ready(function(){
    $("#register-form").validate({
        rules: {
            "username": {
                required: true,
                minlength: 5
            },
            "email": {
                required: true,
                email: true
            }
        },
        messages: {
            "username": {
                required: "Please, enter a name"
            },
            "email": {
                required: "Please, enter an email",
                email: "Email is invalid"
            }
        },
    });
    // $('#register-form').validate({
    //     onfocusout: false,
	// 	onkeyup: false,
	// 	onclick: false,
    //     rules:{
    //         "email" : {
    //             required : true,
    //             email : true
    //         },
    //         "username" : {
    //             required : true,
    //             minlength : 5
    //         },
    //         "password" : {
    //             required : true,
    //             minlength : 5
    //         },
    //         "confirmpassword" : {
    //             required : true,
    //             equalTo : "#password"
    //         }
    //     },
    //     message: {
    //         "email" : {
    //             required : "Email là trường bắt buộc",
    //             email : "Không đúng định dạng email"
    //         },
    //         "username" : {
    //             required : "Username là trường bắt buộc",
    //             minlength : "Phải lớn hơn 5 ký tự"
    //         },
    //         "password" : {
    //             required : "Password là trường bắt buộc",
    //             minlength : "Phải lớn hơn 5 ký tự"
    //         },
    //         "confirmpassword" : {
    //             required : "Confirm password là trường bắt buộc",
    //             equalTo : "Phải trùng với mật khẩu"
    //         }
    //     }
    // })
})