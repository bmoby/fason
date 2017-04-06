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

  var errorCounter = 0;

  $('.stylebox-description').textcounter({
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
      $('.style-minbudget-input-append').append('<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Budget minimum sans symbole (€) et espace</p></div></div>')
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
      $('.style-price-input-append').append('<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Prix horaire de ce look sans symbole (€) et espace</p></div></div>')
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
              url: '/styleboxdelete',
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
