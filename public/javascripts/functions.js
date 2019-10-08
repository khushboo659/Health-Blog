function  myfunc(){
    var value=document.getElementById("search").value;
    window.location.href='/showpost/'+value;
}
function  myfunc2(){
    var value=document.getElementById("search2").value;
    window.location.href='/by/'+value;
}
function func2(){
    var value=document.getElementById("editinput").value;
    window.location.href='/editpost/'+value;
}