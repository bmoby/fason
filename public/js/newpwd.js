$(document).ready(function(){
  $('.request-password-btn').on('click', function(){
    $('.errorsBlock').empty();
    var email = $('.reset-email-field-2').val();

    $.ajax({
      url: "/users/requestpasswordreset",
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({"email": email}),
      success: function(response){
        if(response.sent) {
          alert(response.sent);
          window.location.replace('https://fason.herokuapp.com/');
        }
        if(response.err && !response.errors){
            $('.errorsBlock').append(
              '<div class="row oneError text-center"><p class="errorMessage">'+response.err+'</p></div>'
            )
        }

        if(response.errors){
          response.errors.forEach(function(error){
            $('.errorsBlock').removeClass('hiddenclass');
            $('.errorsBlock').append(
              '<div class="row oneError text-center"><p class="errorMessage">'+error.msg+'</p></div>'
            )
          })
        }
      }
    })
  })


  $('.change-password-btn').on('click', function(){
    $('.errorsBlock').empty();
    var password = $('.login-password-field-3').val();
    var repeat = $('.login-password-field-2').val();
    var id = this.getAttribute("data-id-token");

    if(password && repeat){
      if(password != repeat){
        $('.errorsBlock').removeClass('hiddenclass');
        $('.errorsBlock').append(
          '<div class="row oneError text-center"><p class="errorMessage">Les deux mots de passe ne sont pas identiques.</p></div>'
        )
      } else {
        $.ajax({
          url: "/users/resetPassword/"+id,
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({"password": password}),
          success: function(response){
            if(response.changed){
              alert("Votre mot de passe à été modifié, vous pouvez vous connecter en utilisant votre nouveau mot de passe.")
              window.location.replace('https://fason.herokuapp.com/');
            }

            if(response.erreur){
              alert("Une erreur empéche le changement de votre mot de passe. Veuillez réessayer.")
              window.location.replace('https://fason.herokuapp.com/');
            }
          }
        })
      }
    } else {
      $('.errorsBlock').removeClass('hiddenclass');
      $('.errorsBlock').append(
        '<div class="row oneError text-center"><p class="errorMessage">Veuillez remplir les deux champs.</p></div>'
      )
    }
  });
})
