$(document).ready(function(){
  var pusher = new Pusher('095ff3028ab7bceb6073', {
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

  //
  // $('.close-conversation').on('click', function(){
  //     $.ajax({
  //       url: '/clearNotif',
  //       method: 'POST',
  //       contentType: 'application/json',
  //       data: JSON.stringify({"conversationId":convId}),
  //       success: function(response){
  //         if(response){
  //           participants = [];
  //           convId = "";
  //           $('.full-page').addClass('hidden');
  //           $('.errorsBlock').addClass('hiddenclass');
  //         }
  //       }
  //     });
  // })
  //
  //
  // $('.conversation-row').on('click', function(){
  //   var conversationId = this.getAttribute("data-conv-id");
  //   $('.'+conversationId+'icon').removeClass('notRead');
  //   $('.'+conversationId+'icon').addClass('read');
  //   $('.'+conversationId+'new').text("");
  //   convId = this.getAttribute("data-conv-id");
  //
  //   function scrollAfterAll(callback){
  //     $('.messages-container-div').empty();
  //     $.ajax({
  //       url: '/getmessages',
  //       method: 'POST',
  //       contentType: 'application/json',
  //       data: JSON.stringify({"conversationId": conversationId}),
  //       success: function(response){
  //         if(response.conv){
  //           participants = response.conv.participants;
  //           $('.messages-container-div').empty();
  //           $('.messages-page').removeClass('hidden');
  //           response.conv.messages.forEach(function(msg, index){
  //             if(msg.msgOwner == response.userId){
  //               var myava = response.myAva;
  //               if(response.myAva == ""){
  //                 myava = "http://fason.co/images/noavatar.png";
  //               }
  //               $('.messages-container-div').append(
  //                 '<div class="from-me">'+
  //                     '<div class="row general-row">'+
  //                         '<div class="col-lg-8 col-lg-offset-2 col-md-8 col-md-offset-2 col-sm-9 col-xs-10">'+
  //                             '<p class="message-body my-text">'+msg.msg+'</p>'+
  //                             '<div class="row general-row hidden-xs">'+
  //                               '<p class="message-time-p">'+msg.msgTime+'</p>'+
  //                             '</div>'+
  //                         '</div>'+
  //                         '<div class="col-lg-2 col-md-2 col-sm-3 col-xs-2 text-center">'+
  //                             '<div class="messages-avatar" style="background-image: url('+myava+')"></div>'+
  //                         '</div>'+
  //                     '</div>'+
  //                 '</div>'
  //               )
  //             }
  //
  //             if(msg.msgOwner != response.userId){
  //               var theavatar = response.avatar;
  //               if(response.avatar == ""){
  //                 theavatar = "http://fason.co/images/noavatar.png"
  //               }
  //               $('.messages-container-div').append(
  //                 '<div class="not-from-me">'+
  //                     '<div class="row general-row">'+
  //                         '<div class="col-lg-2 col-md-2 col-sm-3 col-xs-2 text-center">'+
  //                             '<div class="messages-avatar" style="background-image: url('+theavatar+')"></div>'+
  //                         '</div>'+
  //                         '<div class="col-lg-8 col-md-8 col-sm-9 col-xs-10">'+
  //                             '<p class="message-body not-my-text">'+msg.msg+'</p>'+
  //                             '<div class="row general-row text-right hidden-xs">'+
  //                               '<p class="message-time-p">'+msg.msgTime+'</p>'+
  //                             '</div>'+
  //                         '</div>'+
  //                     '</div>'+
  //                 '</div>'
  //               )
  //             }
  //
  //             if(index + 1 == response.conv.messages.length){
  //               callback();
  //             }
  //           })
  //         }
  //       }
  //     })
  //   }
  //
  //   scrollAfterAll(function(){
  //     $('.messages-container-div').animate({
  //         scrollTop: $(".message-time-p").last().offset().top
  //     }, "slow");
  //     $.ajax({
  //       url: '/clearNotif',
  //       method: 'POST',
  //       contentType: 'application/json',
  //       data: JSON.stringify({"conversationId":conversationId}),
  //       success: function(response){
  //         console.log('messages are now marked as read');
  //       }
  //     });
  //   })
  // })

    $(".close-conv-2").on('click', function(){
      var conversationIdd = this.getAttribute("data-conv-id-data2");
      $.ajax({
        url: '/clearNotif',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({"conversationId":conversationIdd}),
        success: function(response){
          if(response){
            window.location.replace("http://fason.co/inbox");
          }
        }
      });
    })

    $('.conversation-row').on('click', function(){
        var conversationId = this.getAttribute("data-conv-id");
        $.ajax({
          url: '/clearNotif',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({"conversationId":conversationId}),
          success: function(response){
            console.log('messages are now marked as read');
          }
        });
    })


  $('.send-message-btn-proper').on('click', function(){
    var message = $('.message-text-body').val();
    var convrId = this.getAttribute("data-conv-id-data");
    var participants = [];
    var participant1 = $('.participant').first().text();
    var participant2 = $('.participant').last().text();
    var participants = [participant1, participant2];
    if(message != ""){
      $.ajax({
        url: '/getMyInfo',
        method: 'GET',
        success: function(response){
          if(response.found){
            $('.messages-container-div').append(
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
            $('.messages-container-div').animate({
                scrollTop: 1E10
            }, "slow");
          }

          if(response.err){
            console.log(response.err)
          }
        }
      })

      function saveAndNotify(callback){
        $.ajax({
          url: '/checkIfConvParticipantsActiv',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({"participants": participants, "conversationId": convrId}),
          success: function(response){
            callback();
          }
        });
      };

      saveAndNotify(function(){
        $.ajax({
          url: '/saveMsg',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({"message": message, "conversationId": convrId})
        });
      })

      $.ajax({
        url: '/msgNotif',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({"msg": message, "participants": participants, "convId": convrId}),
        success: function(response){
          $('.message-text-body').val("");
        }
      });
    } else {
      alert("Vous ne pouvez pas envoyer un message vierge")
    }
  })

  // GETTING THE CURRENT USER INFO TO OPEN A CHANNEL ON pusher --  STEP 1
  function getUserChannel(callback){
    $.ajax({
      url: '/currentUser',
      method: 'GET',
      success: function(response){
        var currentUserChannel = response.userId;
        callback(currentUserChannel);
      }
    });
  };

  // SETTING THE PART WHERE THE USER RECEIVES THE NOTIFICATION -- STEP 2
  getUserChannel(function(response){
    var channel = pusher.subscribe(response);
    channel.bind('new-message', function(data) {
      if(convId != data.dataId){
        $('.'+data.dataId+'icon').removeClass('read');
        $('.'+data.dataId+'icon').addClass('notRead');
        $('.'+data.dataId+'last').text(data.msg);
        $('.'+data.dataId+'new').remove();
        $('.'+data.dataId+'icon').append('<p class="newMessage inlinep '+data.dataId+'new">Nouveau</p>');
      }
      if(data.msg){
        $('.messages-container-div').append(
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
        $('.messages-container-div').animate({
            scrollTop: 1E10
        }, "slow");
      }
    });
  });

  // REMOVE CONV
var removeDiv = $('div');
$('.delete-conversation-icon').on('click', function(e){
  e.stopPropagation();
  e.preventDefault();
  removeDiv =  this.closest('.conversation-row');
  var converId = this.closest('.conversation-row').getAttribute("data-conv-id");
  $.confirm({
    title: 'Supprimer',
    content: 'Etes vous sure de vouloir supprimer cette conversation?',
    buttons: {
        oui: function () {
          $.ajax({
            url: '/deleteConversation',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({"convId": converId}),
            success: function(response){
              if (response.ok){
                $(removeDiv).remove();
                $.ajax({
                  url: '/clearNotif',
                  method: 'POST',
                  contentType: 'application/json',
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
