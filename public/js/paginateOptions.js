$(document).ready(function(){

  // var looksCount = ($('#listitems li').size()/4.01).toFixed(2);
  var looksCount = $('#listitems li').size();

  function sizestyleboxes(count){
    if(count%5 == 0){
      return count/5
    }else{
      return parseInt((count/5) +1);
    }
  }

  function showmaxpage(nombre){
    if(nombre >= 3){
      return 3;
    } else {
      return nombre;
    }
  }
  // alert(showmaxpage(sizestyleboxes(looksCount)))
  $('#listitems').paginathing({
    perPage:5,
    limitPagination: showmaxpage(sizestyleboxes(looksCount)),
    firstText: '1',
    lastText: sizestyleboxes(looksCount),
    insertAfter: null,
  });

});
