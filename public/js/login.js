$(document).ready(function(){
  // REGISTER JQUERY ERROR HANDLING PROCESS
  $('.login-btn').on('click', function(){
    var email = $('.login-email-field').val();
    var pass = $('.login-password-field').val();
    $('.oneError').remove();
    $.ajax({
      url: '/users/login',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({"lemail":email, "lpassword": pass}),
      success: function(response){
        if (response.errors){
          response.errors.forEach(function(error){
            $('.errorsBlock').removeClass('hiddenclass');
            $('.errorsBlock').append(
              '<div class="row oneError text-center"><p class="errorMessage">'+error.msg+'</p></div>'
            )
          });
        } else {
          $.ajax({
            url: '/users/loginValid',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({"email": email, "password": pass}),
            success: function(response){
              window.location.replace(document.referrer);
		          return false;
            }
          });
        }
      }
    })
  });
});
