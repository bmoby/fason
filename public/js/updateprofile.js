$(document).ready(function(){

  $('.stylebox-description').textcounter({
    stopInputAtMaximum: false,
    displayErrorText: false
  });


  $('.update-btn').on('click', function(){
    $('.errorsBlock').empty();
    var userFirstName = $('#userFirstNameUpdate').val();
    var userLastName = $('#userLastNameUpdate').val();
    var userCity = $('#userCityUpdate').val();
    var userPhone = $('#userPhoneUpdate').val();
    var uPassword = $('#userPasswordUpdate').val();
    var userPassword = uPassword.toLowerCase();
    var uEmail = $('#userEmailUpdate').val();
    var userEmail = uEmail.toLowerCase();
    var userAvailability = $('.availability-input').val();
    var userDescription = $('.about-me').val();
    var descriptionCount = parseInt($('.text-count').text());

    $.ajax({
      url: '/users/updateprofil',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({"userAvailability": userAvailability, "userDescription":userDescription, "userFirstName": userFirstName, "userLastName":userLastName, "userEmail":userEmail, "userPhone":userPhone, "userPassword":userPassword, "userCity":userCity, "descriptionCount":descriptionCount}),
      success: function(response){
        if (response.errors){
          response.errors.forEach(function(error){
            $('.errorsBlock').removeClass('hiddenclass');
            $('.errorsBlock').append(
              '<div class="row oneError text-center"><p class="errorMessage">'+error.msg+'</p></div>'
            )
          });
        }
        if(response.ok){
          $('.updateavatar').click();
        }
      }
    });
    if($('.errorMessage')){
      $("html, body").animate({ scrollTop: 0 }, "slow");
    }
  })
});
