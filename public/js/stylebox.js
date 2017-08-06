$(document).ready(function(){

  $('.off').each(function(){
    $(this).find('img').addClass('hidden');
  })

  var pusher = new Pusher('095ff3028ab7bceb6073', {
    encrypted: true
  });

  $('.select-style').niceSelect();
  $('.select-gender').niceSelect();

  $('.rating').each(function(){
    var styleboxId = this.getAttribute("data-stylebox-id");
    var ratingValue = this.getAttribute("data-rating-value");

    $('.general-rating-'+styleboxId).barrating({
      theme: "fontawesome-stars-o",
      initialRating: ratingValue,
      readonly: true
    });
  })

  $('.stylistDescription').readmore({
    speed: 500,
    lessLink: '<a href="" class="afficher">Réduire</a>',
    moreLink: '<a href="" class="afficher">Afficher plus</a>',
    collapsedHeight: 70
  });


  $('.disponibility-btn').on('click', function(){
    $('.full-page').addClass('hidden');
    $('.availabilities-page').removeClass('hidden');
  });

  $('.send-message-btn').on('click', function(){
    $('.full-page').addClass('hidden');
    $('.message-page').removeClass('hidden');
  });

  $('.send-demand-btn').on('click', function(){
    $('.full-page').addClass('hidden');
    $('.demand-page').removeClass('hidden');
  });

  $('.close-icon').on('click', function(){
    $('.full-page').addClass('hidden');
  });

  $('.register-link').on('click', function(){
    $('.full-page').addClass('hidden');
    $('.register-append').removeClass('hidden');
  })

  $('.connection-btn').on('click', function(){
    $('.full-page').addClass('hidden');
    $('.login-append').removeClass('hidden');
  });
  // Send message route ajax request
  $('.message-submit-btn').on('click', function(e){
    $(".errorsBlock").empty();
    var message = $('.messageText').val();
    var styleboxId = location.href.substr(location.href.lastIndexOf('/') + 1);
    if(message){
      $.ajax({
        url: '/users/sendMsg',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({"message": message, "styleboxId": styleboxId}),
        success: function(response){
          if (response.sent){
            document.getElementById("clearit").value = "";
            setTimeout(function(){
              alert("Votre message a bien été envoyé. Vous recevrez une notification en cas de réponse.");
            }, 200);
            $('.full-page').addClass('hidden');
          }

          if (response.creator){
            document.getElementById("clearit").value = "";
            setTimeout(function(){
              alert("Vous ne pouvez pas envoyer des messages a vous meme.");
            }, 200);
            $('.full-page').addClass('hidden');
          }
        }
      });
    } else {
      $(".errorsBlock").removeClass("hidden");
      $(".errorsBlock").append(
        '<div class="row oneError text-center"><p class="errorMessage">Entrez votre message</p></div>'
      )
    }
  });

   $(".form_datetime").datetimepicker({
    format: "dd mm yyyy - hh:ii",
    startDate: '+0d',
    language:"fr"
   });


  // Send verification email route ajax request
  $('.resend-email-btn').on('click', function(){
    alert("Un e-mail vient d'être envoyé avec un lien pour confirmer votre e-mail. N'oubliez pas de vérifier les Courriers Indésirbales (Spams) de votre boîte e-mail.");
    $.ajax({
      url: '/sendEmailVerify',
      method: 'GET'
    })
  });

  // Send verification email route ajax request
  $('.resendSms').on('click', function(){
    $.ajax({
      url: '/sendPhoneCode',
      method: 'GET',
      success: function(response){
        if(response.smsSent){
          alert("Un sms vient d'être envoyé avec le code de vérification.");
        }
      }
    })

  })

  $('.confirm-code').on('click', function(){
    $('.errorsBlock').remove();
    var code = $('.validation-code').val();
    $.ajax({
      url: '/verifyMyPhone',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({"code": code}),
      success: function(response){
        if(response.err){
          $('.phone-verify-row').before('<div class="row text-center errorsBlock">'+
          '<p class="errorMessage">'+response.err+'</p>'+
          '</div>')
        }
      }
    })
  });


// Submit demand route Request
// SUBMIT A DEMAND FUNCTIONS -> Declined if user have a valid demand **********************************************************
  $('.submit-demand').on('click', function(){
    $('.errorsBlock').remove();
    var styleboxId = location.href.substr(location.href.lastIndexOf('/') + 1);
    var date = $('.form_datetime').val();
    if(date == ""){
      $('.error-after').after().append(
        '<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Veuillez choisir une date.</p></div></div>'
      );
    }else{
      var forstyle = $('.forstyleTitle').text();
      $.confirm({
        title: 'Confirmation',
        content: 'Voulez-vous vraiment faire la demande de relooking pour ce look ? En appuyant sur le bouton "Oui", vous vous engagez à rencontrer le Relooker.',
        buttons: {
            oui: function () {
              $.ajax({
                url: '/demand',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({"date": date, "styleboxId": styleboxId, "forstyle": forstyle}),
                success: function(response){
                  if (response.ok){
                    alert("Votre demande de relooking a bien été envoyée. Relooker a 24 heures pour l'accepter. Dans le cas contraire, vous pouvez en faire une autre.");
                    location.reload();
                  }

                  if(response.creator){
                    alert("Vous ne pouvez pas envoyer des demandes a vous meme");
                    location.reload();
                  }

                  if(response.err){
                    alert(response.err);
                    location.reload();
                  }
                }
              });
            },
            non: function () {
            }
        }
      });
    }
  });
})
