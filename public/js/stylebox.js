$(document).ready(function(){
  $('.rating').each(function(){
    var styleboxId = this.getAttribute("data-stylebox-id");
    var ratingValue = this.getAttribute("data-rating-value");

    $('.general-rating-'+styleboxId).barrating({
      theme: "fontawesome-stars-o",
      initialRating: ratingValue,
      readonly: true
    });
  })

  // $('#search-city').geocomplete({
  //   dropdownWidth: '100%',
  //   dropdownStyle: {},
  //   itemStyle: {},
  //   hintStyle: false,
  //   style: false,
  //   minLength: 3
  // });

  //loading images before masonry executed
  $('.masoneryContainer').imagesLoaded(function(){
    $('.grid').masonry({
      // options
      itemSelector: '.grid-item',
      columnWidth: '.sizer4'
    });
  })

  $('.masoneryContainer').imagesLoaded(function(){
    var img1 = $('.grid-item').eq(0);
    var img2 = $('.grid-item').eq(1);
    var img3 = $('.grid-item').eq(2);
    var height1 = img1.height();
    var height2 = img2.height();
    var height3 = img3.height();

    function getmaxwidth(a, b, c){
      if(a>b && a>c){
        return a
      } else if (b>a && b>c) {
        return b
      } else {
        return c
      }
    }

    function getminwidth(a, b, c){
      if(a<b && a<c){
        return a
      } else if (b<a && b<c) {
        return b
      } else {
        return c
      }
    }


    function sendheight(){
      if ($('.grid-item').length < 6){
        return getminwidth(height1, height2, height3)
      } else {
        return getmaxwidth(height1, height2, height3)
      }
    }

    $('.masoneryContainer').readmore({
      speed: 2000,
      lessLink: '<div class="up-div"><p class="afficherPhotos"></p><i class="glyphicon glyphicon-menu-up afficherLesPhotos"></i></div>',
      moreLink: '<div class="up-div"><p class="afficherPhotos"></p><i class="glyphicon glyphicon-menu-down afficherLesPhotos"></i></div>',
      collapsedHeight: sendheight()
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
    var message = $('.messageText').val();
    var styleboxId = location.href.substr(location.href.lastIndexOf('/') + 1);
    $.ajax({
      url: '/users/sendMsg',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({"message": message, "styleboxId": styleboxId}),
      success: function(response){
        if (response){
          alert("Votre message a bien été envoyé, Vous seriez notifiées lorsque le stylist vous répondra");
          $('.full-page').addClass('hidden');
        }
      }
    });
  });

  // Enable pusher logging - don't include this in production
     // Declaring bianors pusher
     var pusher = new Pusher('095ff3028ab7bceb6073', {
       encrypted: true
     });


   $(".form_datetime").datetimepicker({
    format: "dd mm yyyy - hh:ii",
    startDate: '+0d',
    language:"fr"
   });


  // Send verification email route ajax request
  $('.resend-email-btn').on('click', function(){
    alert("Un email vient d'être envoyé avec un lien pour confirmer votre email. N'oubliez pas de verifier les spams de votre boite email!");
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
          alert('Un sms vient de vous être envoyé avec le code de vérification');
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
        '<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Veuillez séléctioner une date</p></div></div>'
      );
    }else{
      var forstyle = $('.forstyleTitle').text();
      $.ajax({
        url: '/demand',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({"date": date, "styleboxId": styleboxId, "forstyle": forstyle}),
        success: function(response){
          if (response.ok){
            alert("Votre demande a été envoyée, vous n'avez qu'a attendre une réponse de la part de votre stylist");
            location.reload();
          } else {
            alert(response.err);
            location.reload();
          }
        }
      });
    }
  });

  $('.style-title-input').focus(function () {
     $('.stylebox-create-input-title-span').removeClass('hidden');
  });

  $('.style-title-input').focusout(function () {
     $('.stylebox-create-input-title-span').addClass('hidden');
  });

  $('.style-price-input').focus(function () {
     $('.stylebox-create-input-price-span').removeClass('hidden');
  });

  $('.style-city-input').focus(function () {
     $('.stylebox-create-input-city-span').removeClass('hidden');
  });

  $('.style-price-input').focusout(function () {
     $('.stylebox-create-input-price-span').addClass('hidden');
  });

  $('.style-city-input').focusout(function () {
     $('.stylebox-create-input-city-span').addClass('hidden');
  });

  $('.style-minbudget-input').focus(function () {
     $('.stylebox-create-input-budget-span').removeClass('hidden');
  });

  $('.style-minbudget-input').focusout(function () {
     $('.stylebox-create-input-budget-span').addClass('hidden');
  });

  //Become stylist styling
  $('.about-me').focus(function () {
     $('.stylist-description-span').removeClass('hidden');
  });

  $('.about-me').focusout(function () {
     $('.stylist-description-span').addClass('hidden');
  });

  $('.availability-input').focus(function () {
     $('.stylist-availability-span').removeClass('hidden');
  });

  $('.availability-input').focusout(function () {
     $('.stylist-availability-span').addClass('hidden');
  });

  $('.become-stylist-btn').on('click', function(){
    $('.oneError').remove();
    var description = $('.about-me').val();
    var availability = $('.availability-input').val();
    var counter = parseInt($('.text-count').text());
    if(description != "" && counter >= 200){
      $.ajax({
        url: '/users/becomestylist',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({"description": description, "availability": availability}),
        success: function(response){
          if(response.stylist){
            window.location.replace('https://fason.herokuapp.com/createStylebox');
          } else {
            $('.errorsBlock').removeClass('hiddenclass');
            $('.errorsBlock').append(
              '<div class="row oneError text-center"><p class="errorMessage">'+response.err+'</p></div>'
            )
          }
        }
      })
    }

    if (description == ""){
      $('.errorsBlock').removeClass('hiddenclass');
      $('.errorsBlock').append(
        '<div class="row oneError text-center"><p class="errorMessage">Veuillez résumez votre expérience (minimum 200 caractères).</p></div>'
      )
    }

    if (counter < 200){
      $('.errorsBlock').removeClass('hiddenclass');
      $('.errorsBlock').append(
        '<div class="row oneError text-center"><p class="errorMessage">Votre déscription dois être composé de 200 characters minimum</p></div>'
      )
    }

  });

  var errorCounter = 0;

  $('.stylebox-description').textcounter({
    stopInputAtMaximum: false,
    displayErrorText: false
  });

  $('.about-me').textcounter({
    stopInputAtMaximum: false,
    displayErrorText: false
  });

  $('.stylebox-create-continue-btn').on('click', function(){
    errorCounter = 0;
    $('.errorsBlock').remove();

    var budget = $('.style-minbudget-input').val();
    var title = $('.style-title-input').val();
    var price = $('.style-price-input').val();
    var city = $('.style-city-input').val();
    var style = $('.select-style-proper').val();
    var gender = $('.select-gender-proper').val();
    var minTime = $('.select-minTime-proper').val();
    var description = $('.stylebox-description').val();
    var descriptionCount = parseInt($('.text-count').text());



    if(style == "nothing"){
      $('.select-style-proper-append').append('<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Choisissez un look</p></div></div>')
      errorCounter = errorCounter+1;
    }

    if(budget != "" && $.isNumeric(budget) == false){
      $('.style-minbudget-input-append').append('<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Budget minimum sans symbole (€)</p></div></div>')
      errorCounter = errorCounter+1;
    }

    if(gender == "nothing"){
      $('.select-gender-proper-append').append('<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Choisissez homme ou femme</p></div></div>')
      errorCounter = errorCounter+1;
    }

    if(minTime == "nothing"){
      $('.select-minTime-proper-append').append('<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Choisissez le temps nécessaire pour ce look</p></div></div>')
      errorCounter = errorCounter+1;
    }

    if(title == ""){
      $('.style-title-input-append').append('<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Donnez un titre à ce look</p></div></div>')
      errorCounter = errorCounter+1;
    }

    // if(description == ""){
    //   $('.stylebox-description-append').append('<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Décrivez votre style</p></div></div>')
    //   errorCounter = errorCounter+1;
    // }

    if(descriptionCount < 200){
      $('.stylebox-description-append').append('<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Décrivez ce look (minimum 200 caractères)</p></div></div>')
      errorCounter = errorCounter+1;
    }

    if(price == "" || $.isNumeric(price) == false) {
      $('.style-price-input-append').append('<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Prix horaire de ce look sans symbole (€)</p></div></div>')
      errorCounter = errorCounter+1;
    }

    if(errorCounter == 0) {
      $('.stylebox-info-page').addClass('hidden');
      $('.stylebox-pics-page').removeClass('hidden');
    }
  });

  $('.back-btn').on('click', function(){
    $('.stylebox-info-page').removeClass('hidden');
    $('.stylebox-pics-page').addClass('hidden');
  })


  $('.delete').on('click', function(){
    var styleboxId = this.getAttribute('data-stylebox-id-remove');
    $.confirm({
      title: 'Supprimer',
      content: 'Etes vous sure de vouloir supprimer ce stylebox? Toutes les photos ainsi que les informations seront définitivement perdu.',
      buttons: {
          oui: function () {
            $.ajax({
              url: '/stylebox/delete',
              method: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({"styleboxId": styleboxId}),
              success: function(response){
                if(response.list == 0){
                  window.location.replace('https://fason.herokuapp.com/');
                } else {
                  window.location.replace('https://fason.herokuapp.com/mystyleboxes');
                }
              }
            })
          },
          non: function () {
          }
      }
    });
  });
})
