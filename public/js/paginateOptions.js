$(document).ready(function(){
  $('#listitems').paginate({itemsPerPage: 5});
  $('.next').on('click', function(){
    window.scrollTo(0, 0);
  });
  $('.previous').on('click', function(){
    window.scrollTo(0, 0);
  })
});
