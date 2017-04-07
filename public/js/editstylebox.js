$(document).ready(function(){

  $('.stylebox-create-continue-btn').on('click', function(){
    errorCounter = 0;
    $('.errorsBlock').remove();
    var budget = $('.style-minbudget-input').val();
    var title = $('.style-title-input').val();
    var price = $('.style-price-input').val();
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

  var errorCounter = 0;

  $('.stylebox-description').textcounter({
    stopInputAtMaximum: false,
    displayErrorText: false
  });

  $('.back-btn').on('click', function(){
    $('.stylebox-info-page').removeClass('hidden');
    $('.stylebox-pics-page').addClass('hidden');
  })

  $('.style-title-input').focus(function () {
     $('.stylebox-create-input-title-span').removeClass('hidden');
  });

  $('.style-title-input').focusout(function () {
     $('.stylebox-create-input-title-span').addClass('hidden');
  });

  $('.select-minTime-proper').focus(function () {
     $('.stylebox-create-input-title-span-2').removeClass('hidden');
  });

  $('.select-minTime-proper').focusout(function () {
     $('.stylebox-create-input-title-span-2').addClass('hidden');
  });

  $('.stylebox-description').on("click", function () {
     $('.stylebox-create-input-description-span-2').removeClass('hidden');
  });

  $('.stylebox-description').focusout(function () {
     $('.stylebox-create-input-description-span-2').addClass('hidden');
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
})
