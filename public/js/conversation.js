$(document).ready(function(){
  var pusher = new Pusher("095ff3028ab7bceb6073", {
    encrypted: true
  });

  $(function(){
    $(".limit").each(function(i){
      len=$(this).text().length;
      if(len>40)
      {
        $(this).text($(this).text().substr(0,40)+'...');
      }
    });
  });

  $(function(){
    $(".limit-large").each(function(i){
      len=$(this).text().length;
      if(len>70)
      {
        $(this).text($(this).text().substr(0,70)+'...');
      }
    });
  });

  $(".close-conv-2").on("click", function(){
    var conversationIdd = this.getAttribute("data-conv-id-data2");
    $.ajax({
      url: "/clearNotif",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({"conversationId":conversationIdd}),
      success: function(response){
        if(response){
          window.location.replace("http://fason.co/inbox");
        }
      }
    });
  })

  $(".conversation-row").on("click", function(){
      var conversationId = this.getAttribute("data-conv-id");
      $.ajax({
        url: "/clearNotif",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({"conversationId":conversationId}),
        success: function(response){
          console.log("messages are now marked as read");
        }
      });
  })

  $(".message-text-body").keypress(function (e) {
   var key = e.which;
   if(key == 13)
    {
      $(".send-message-btn-proper").click();
      return false;
    }
    if(key == 27){
      $(".close-conv-2").click();
      return false;
    }
  });

  $(".send-message-btn-proper").on("click", function(){
    var message = $(".message-text-body").val();
    var convrId = this.getAttribute("data-conv-id-data");
    var participants = [];
    var participant1 = $(".participant").first().text();
    var participant2 = $(".participant").last().text();
    var participants = [participant1, participant2];
    if(message != ""){
      $.ajax({
        url: "/getMyInfo",
        method: "GET",
        success: function(response){
          if(response.found){
            $(".messages-container-div").append(
              '<div class="from-me">'+
                  '<div class="row general-row">'+
                      '<div class="col-lg-8 col-lg-offset-2 col-md-8 col-md-offset-2 col-sm-9 col-xs-10">'+
                          '<p class="message-body my-text">'+message+'</p>'+
                          '<div class="row general-row hidden-xs">'+
                            '<p class="message-time-p">'+response.time+'</p>'+
                          '</div>'+
                      '</div>'+
                      '<div class="col-lg-2 col-md-2 col-sm-3 col-xs-2 text-center">'+
                          '<div class="messages-avatar" style="background-image: url('+response.avatar+')"></div>'+
                      '</div>'+
                  '</div>'+
              '</div>')
            $(".messages-container-div").animate({
              scrollTop: $(".messages-container-div")[0].scrollHeight}, -500);
          }

          if(response.err){
            console.log(response.err)
          }
        }
      })

      function saveAndNotify(callback){
        $.ajax({
          url: "/checkIfConvParticipantsActiv",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({"participants": participants, "conversationId": convrId}),
          success: function(response){
            callback();
          }
        });
      };

      saveAndNotify(function(){
        $.ajax({
          url: "/saveMsg",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({"message": message, "conversationId": convrId})
        });
      })

      $.ajax({
        url: "/msgNotif",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({"msg": message, "participants": participants, "convId": convrId}),
        success: function(response){
          $(".message-text-body").val("");
        }
      });
    } else {
      alert("Vous ne pouvez pas envoyer un message vierge")
    }
  })

  function getUserChannel(callback){
    $.ajax({
      url: "/currentUser",
      method: "GET",
      success: function(response){
        var currentUserChannel = response.userId;
        callback(currentUserChannel);
      }
    });
  };

  getUserChannel(function(response){
    var channel = pusher.subscribe(response);
    channel.bind("new-message", function(data) {

      if(data.msg){
        $(".messages-container-div").append(
          '<div class="not-from-me">'+
              '<div class="row general-row">'+
                  '<div class="col-lg-2 col-md-2 col-sm-3 col-xs-2 text-center">'+
                      '<div class="messages-avatar" style="background-image: url('+data.avatar+')"></div>'+
                  '</div>'+
                  '<div class="col-lg-8 col-md-8 col-sm-9 col-xs-10">'+
                      '<p class="message-body not-my-text">'+data.msg+'</p>'+
                      '<div class="row general-row text-right hidden-xs">'+
                        '<p class="message-time-p">'+data.msgTime+'</p>'+
                      '</div>'+
                  '</div>'+
              '</div>'+
          '</div>'
        )
        $(".messages-container-div").animate({
          scrollTop: $(".messages-container-div")[0].scrollHeight}, -500);
      }
    });
  });

var removeDiv = $("div");
$(".delete-conversation-icon").on("click", function(e){
  e.stopPropagation();
  e.preventDefault();
  removeDiv =  this.closest(".conversation-row");
  var converId = this.closest(".conversation-row").getAttribute("data-conv-id");
  $.confirm({
    title: "Supprimer",
    content: "Etes vous sure de vouloir supprimer cette conversation?",
    buttons: {
        oui: function () {
          $.ajax({
            url: "/deleteConversation",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({"convId": converId}),
            success: function(response){
              if (response.ok){
                $(removeDiv).remove();
                $.ajax({
                  url: "/clearNotif",
                  method: "POST",
                  contentType: "application/json",
                  data: JSON.stringify({"conversationId":converId})
                });
              } else {
                alert("Une erreur s'est produite, veuillez réessayer plus tard.")
              }
            }
          });
        },
        non: function () {
      }
    }
  });
});
})
