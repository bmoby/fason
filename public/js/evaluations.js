$(document).ready(function(){
  $('#evaluateStylistBtn').on('click', function(){
    var stylistId = this.getAttribute("data-stylist-id");
    var styleboxId = this.getAttribute("data-stylebox-id");
    var evalId = this.getAttribute("data-eval-id");
    var precision = $('.precision-rating').val();
    var quality = $('.quality-rating').val();
    var communication = $('.communication-rating').val();
    var ponctuality = $('.ponctuality-rating').val();
    var comment = $('.eval-comment-text').val();


    $.ajax({
      url: '/evaluate',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({"stylistId": stylistId, "styleboxId": styleboxId, "evalId": evalId, "precision": precision, "ponctuality": ponctuality, "quality": quality, "communication": communication, "comment": comment}),
      success: function(response){
        window.location.replace('https://fason.herokuapp.com/');
      }
    })
  });

  $('#evaluateUserBtn').on('click', function(){
    var styleboxId = this.getAttribute("data-stylebox-id");
    var evalId = this.getAttribute("data-eval-id");
    var userId = this.getAttribute("data-user-id");
    var comment = $('.eval-comment-text').val();

    $.ajax({
      url: '/evaluate',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({"userId": userId, "styleboxId": styleboxId, "evalId": evalId, "comment": comment}),
      success: function(response){
        window.location.replace('https://fason.herokuapp.com/');
      }
    })
  });
});
