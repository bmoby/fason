$(document).ready(function(){
  // REGISTER JQUERY ERROR HANDLING PROCESS
  $('.register-btn').on('click', function(){
    // getting the data from the fields
    $("html, body").animate({ scrollTop: 0 }, "slow");
    var first = $('#firstName').val();
    var last = $('#lastName').val();
    var emai = $('#userEmail').val();
    var city = $('#userCity').val();
    var pass = $('#userPassword').val();
    var phone = $('#userPhone').val();
    var userType = $(".user-type input[type='radio']:checked").val();
    var conditions =  $(".conditions input").is(":checked");
    // removing all existing error messages from the html page
    $('.oneError').remove();
    // Ajax request to the server
    $.ajax({
      url: '/users/register',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ "firstName": first, "city": city, "lastName": last, "email": emai, "password": pass, "phone": phone, "userType": userType, "conditions": conditions}),
      success: function(response){
        if (response.errors){
          response.errors.forEach(function(error){
            $('.errorsBlock').removeClass('hiddenclass');
            $('.errorsBlock').append(
              '<div class="row oneError text-center"><p class="errorMessage">'+error.msg+'</p></div>'
            )

          });
        } else {
          if(response.ok){
            $('.useridtoserver').val(response.userId);
            if(response.stylist){
              $('.userType').val("stylist");
              $('.submitavatar').click();
            }else{
              $('.userType').val("user");
              $('.submitavatar').click();
            }
          }
        }
      }
    });
  });

  $('.user-type input').iCheck({
    radioClass: 'iradio_square-purple'
  });

  $('.conditions input').iCheck({
    checkboxClass: 'icheckbox_square-red'
  });
})