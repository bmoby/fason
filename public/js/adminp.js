$(document).ready(function(){


  $('.everybody').on('click', function(){
    $.ajax({
      url: "/sendm",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({"methodtype": "everybody"}),
      success: function(response){
        if(response.complete){
          alert("C bon ca a été envoyé");
        }
      }
    })
  });

  $('.relookerall').on('click', function(){
    $.ajax({
      url: "/sendm",
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
      url: "/sendm",
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
      url: "/sendm",
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
