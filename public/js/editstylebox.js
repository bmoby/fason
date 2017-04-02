$(document).ready(function(){

  $('.stylebox-edit-continue-btn').on('click', function(){
    errorCounter = 0;
    $('.errorsBlock').remove();
    var budget = $('.style-minbudget-input').val();
    var title = $('.style-title-input').val();
    var price = $('.style-price-input').val();
    var style = $('.select-style-proper').val();
    var gender = $('.select-gender-proper').val();
    var minTime = $('.select-minTime-proper').val();
    var description = $('.stylebox-description').val();

    if(style == "nothing"){
      $('.select-style-proper-append').append('<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Veuillez séléctioner un style</p></div></div>')
      errorCounter = errorCounter+1;
    }

    if(budget != "" && $.isNumeric(budget) == false){
      $('.style-minbudget-input-append').append('<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Le budget dois etre numérique et sans symboles € ou $</p></div></div>')
      errorCounter = errorCounter+1;
    }

    if(gender == "nothing"){
      $('.select-gender-proper-append').append('<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Selectionnez homme ou femme</p></div></div>')
      errorCounter = errorCounter+1;
    }

    if(minTime == "nothing"){
      $('.select-minTime-proper-append').append('<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Séléctionnez le temps nécéssaire pour réaliser ce travail</p></div></div>')
      errorCounter = errorCounter+1;
    }

    if(title == ""){
      $('.style-title-input-append').append('<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Donnez un titre a votre style</p></div></div>')
      errorCounter = errorCounter+1;
    }

    if(description == ""){
      $('.stylebox-description-append').append('<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Décrivez votre style min 200 chars</p></div></div>')
      errorCounter = errorCounter+1;
    }

    if(price == "" || $.isNumeric(price) == false) {
      $('.style-price-input-append').append('<div class="errorsBlock"><div class="row oneError text-center"><p class="errorMessage">Indiquez votre prix par heure sans les symboles € $</p></div></div>')
      errorCounter = errorCounter+1;
    }

    if(errorCounter == 0) {
      $('.stylebox-info-page').addClass('hidden');
      $('.stylebox-pics-page').removeClass('hidden');
    }
  });
})
