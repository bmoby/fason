$(document).ready(function(){
  $.ajax({
    url: '/checkevals',
    method: 'GET',
    success: function(response){
      if(response.evals){
        $('.evalsheaderlink').removeClass('hidden');
        $('.newevalsnotifs').text(response.evals);
        var newnotif = parseInt($('.notifCountIcon').text());
        newnotifcount = 0;
        if(newnotif > 0){
         newnotifcount = newnotif + response.evals;
       } else {
         newnotifcount = response.evals;
       }
        $('.notifCount').removeClass('hidden');
        $('.notifCountIcon').text(newnotifcount)
      }
    }
  })

  $.ajax({
    url: '/currentUser',
    method: 'GET',
    success: function(response){
      if(window.location.pathname == '/inbox'){
        var messagesnumber = parseInt($('.newmessagesnotifs').text());
        var allnotifs = parseInt($('.notifCountIcon').text());
        if (allnotifs - messagesnumber >=1){
          $('.notifCountIcon').text(allnotifs - messagesnumber);
        } else {
          $('.notifCountIcon').addClass('hidden');
        }
      }

      if(window.location.pathname == '/demandes'){
        var demandsnumber = parseInt($('.newdemandsnotifs').text());
        var allnotifs = parseInt($('.notifCountIcon').text());
        if (allnotifs - demandsnumber >=1){
          $('.notifCountIcon').text(allnotifs - demandsnumber);
        } else {
          $('.notifCountIcon').addClass('hidden');
        }
      }

      if(response.userId){
        // Enable pusher logging - don't include this in production
        // Declaring bianors pusher
       var pusher = new Pusher('095ff3028ab7bceb6073', {
         encrypted: true
       });

       var channel = pusher.subscribe(response.userId);

         channel.bind('emailVerify', function(data) {
           if(data.emailverified){
             if(data.phoneV == false){
               $('.email-verify-row').empty();
               $('.email-verify-row').append(
                 '<div class="row envoyer-un-message-btn login-register-btn-row">'+
                 '<div class="col-lg-9 col-md-9 col-sm-9 col-xs-9">'+
                     '<h4 class="success-msg">Votre email est confirmé</h4></div>'+
                 '<div class="col-lg-3 col-md-3 col-sm-3 col-xs-3"><i class="glyphicon glyphicon-ok success-icon"></i></div>'+
                 '</div>'
               );
             } else {
               $('.all-demand-container').empty();
               $('.haveVerified').removeClass('hidden');
             }
           }
         })

         channel.bind('phoneVerify', function(data){
           if(data.phoneverified){
             if(data.emailV == false){
               $('.phone-verify-row').empty();
               $('.phone-verify-row').append(
                 '<div class="row envoyer-un-message-btn login-register-btn-row">'+
                 '<div class="col-lg-9 col-md-9 col-sm-9 col-xs-9">'+
                     '<h4 class="success-msg">Votre numéro est confirmé</h4></div>'+
                 '<div class="col-lg-3 col-md-3 col-sm-3 col-xs-3"><i class="glyphicon glyphicon-ok success-icon"></i></div>'+
                 '</div>'
               )
             } else {
               $('.all-demand-container').empty();
               $('.haveVerified').removeClass('hidden');
             }
           }
         })

       channel.bind('new-message', function(data) {
         if(data){
           if(window.location.pathname != '/inbox'){
             $('.notifCount').removeClass('hidden');
             var notifs = parseInt($('.notifCountIcon').text());
             var messagescout = parseInt($('.newmessagesnotifs').text());
             $('.notifCountIcon').text(notifs+1);

             if(messagescout){
               $('.newmessagesnotifs').text(messagescout+1)
             } else {
               $('.newmessagesnotifs').text("1");
             }
           }
         }
       });

       channel.bind('demands', function(data) {
         if(data){
           $('.notifCount').removeClass('hidden');
           var notifs = parseInt($('.notifCountIcon').text());
           var demandcout = parseInt($('.newdemandsnotifs').text());
           $('.notifCountIcon').text(notifs+1);

           if(demandcout){
             $('.newdemandsnotifs').text(demandcout+1)
           } else {
             $('.newdemandsnotifs').text("1");
           }
         }
       })
      } else {
        console.log(response)
      }
    }
  })
  $('.connection').on('click', function(){
    $('.full-page').addClass('hidden');
    $('.login-append').removeClass('hidden');
    $('.photosContainer').addClass('hidden');
  });


  $('.apropos').on('click', function(){
    $('.full-page').addClass('hidden');
    $('.apropos-append').removeClass('hidden');
    $('.photosContainer').addClass('hidden');
  });


  $('.register').on('click', function(){
    $('.full-page').addClass('hidden');
    $('.register-append').removeClass('hidden');
    $('.photosContainer').addClass('hidden');
  });

  $('.home-xs-search-redirect-btn').on('click', function(){
    $('.full-page').addClass('hidden');
    $('.xs-search-append').removeClass('hidden');
    $('.photosContainer').addClass('hidden');
  });

  $('.close-icon').on('click', function(){
    $('.full-page').addClass('hidden');
    $('.errorsBlock').addClass('hiddenclass');
    $('.photosContainer').removeClass('hidden');
  });

  $('.select-avatar').on('click', function(){
    $('.avatarUpload').click();
  })

  function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $('.select-avatar').attr('src', e.target.result);
      }
      reader.readAsDataURL(input.files[0]);
    }
  }

  $(".avatarUpload").change(function(){
      readURL(this);
  });

  // REGISTER JQUERY ERROR HANDLING PROCESS
  $('.register-btn').on('click', function(){
    // getting the data from the fields
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
              location.reload();
            }
          });
        }
      }
    })
  });

  $('.header-ava').on('click', function(e){
    e.stopPropagation();
    $('.header-menu').toggleClass('hidden');
  })

  $(window).click(function(){
    if(!$(this).hasClass("menuitem")){
      $('.header-menu').addClass('hidden');
    }
  });

});
