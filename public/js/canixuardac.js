$(document).ready(function(){


  $('.everybody').on('click', function(){
    var message = $('.message').val();
    var subject = $('.subject').val();
    $.ajax({
      url: "/dayahit",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({"methodtype": "everybody", "message": message, "subject": subject}),
      success: function(response){
        if(response.complete){
          alert("C bon ca a été envoyé brozer");
        }
      }
    })
  });

  $('.relookerall').on('click', function(){
    $.ajax({
      url: "/dayahit",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({"methodtype": "relookerall"}),
      success: function(response){
        if(response.complete){
          alert("C bon ca a été envoyé");
        }
      }
    })
  });


  $('.clientsall').on('click', function(){
    $.ajax({
      url: "/dayahit",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({"methodtype": "clientsall"}),
      success: function(response){
        if(response.complete){
          alert(response.complete);
        }
      }
    })
  });


  $('.relookerno').on('click', function(){
    $.ajax({
      url: "/dayahit",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({"methodtype": "relookerno"}),
      success: function(response){
        if(response.complete){
          alert("C bon ca a été envoyé");
        }
      }
    })
  });


});
