<?php
$name = $_POST['name1'];
$email = $_POST['email1'];
$message = $_POST['message1'];
$subject = $_POST['subject1'];

$email = filter_var($email, FILTER_SANITIZE_EMAIL);

if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
  $firstTo ="luis_amc@unitec.edu";
  $secondTo = "lualmaca1@gmail.com";
  $headers = "Content-Type: text/html; charset=iso-8859-1\n"; 
  $headers .= "From:".$_POST['nombre']."\r\n";      
  $tema="Contacto desde el Sitio Web";
  $mensaje="
  <table border='0' cellspacing='2' cellpadding='2'>
    <tr>
      <td width='20%' align='center' bgcolor='#FFFFCC'><strong>Nombre:</strong></td>
      <td width='80%' align='left'>$_POST[nombre]</td>
    </tr>
    <tr>
      <td align='center' bgcolor='#FFFFCC'><strong>E-mail:</strong></td>
      <td align='left'>$_POST[email]</td>
    </tr>
     <tr>
      <td width='20%' align='center' bgcolor='#FFFFCC'><strong>Asunto</strong></td>
      <td width='80%' align='left'>$_POST[asunto]</td>
    </tr>
    <tr>
      <td align='center' bgcolor='#FFFFCC'><strong>Comentario:</strong></td>
      <td align='left'>$_POST[mensaje]</td>
    </tr>
  </table>
  ";
  @mail($firstTo,$tema,$mensaje,$headers); 
  @mail($secondTo,$tema,$mensaje,$headers); 
  echo "aceptar";
} else {
  echo "No se puede enviar el formulario, verifica los campos";
}
?>
