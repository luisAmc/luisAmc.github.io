$(document).ready(function() {
  $("#submit").click(function() {
    var name = $("#name").val();
    var email = $("#email").val();
    var subject = $("#subject").val();
    var message = $("#message").val();
    
    // Checking for blank fields.
    if (name == '' || email == '' || subject == '') {
      alert("Porfavor llene los campos requeridos.");
    } else {
      // Returns successful data submission message when the entered information is stored in database.
      $.post("php/contact_form.php", {
        name1: name,
        email1: email,
        message1: message,
        subject1: subject
      }, function(data) {
        if (data == "aceptar") {
          alert("Su mensaje fue enviado.");
        } else {
          alert("Hubo un error en el envio del mensaje.");
        }
      });
    }
  });
});