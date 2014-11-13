var flag = false;

function validateUserEnter() {
	if (document.getElementById("p1").value != "") {
		if (document.getElementById("p2").value != "") {
			if (document.getElementById("p1").value == document.getElementById("p2").value) {
				if (!validatePassword(document.getElementById("p1").value)) {
					alert("La contraseña no cumple con los requisitos. Vuelva a ingresar la contrasena.");
					document.getElementById("p1").focus();
					document.getElementById("p1").style.backgroundColor = "#FF4D4D";
					document.getElementById("p2").style.backgroundColor = "#FF4D4D";
					return false;
				} else {
					location.href = "./validacion_correcta.html";
				}
			} else {
				alert("El texto ingresado en \"Contraseña\" y \"Reingrese contraseña\" debe coincidir. Verifique los campos.");
				document.getElementById("p1").focus();
				document.getElementById("p1").style.backgroundColor = "#FF4D4D";
				document.getElementById("p2").style.backgroundColor = "#FF4D4D";
				return false;
			}
		} else {
			alert("El campo \"Reingrese contraseña\" no puede estar vacio.")
			document.getElementById("p2").focus();
			document.getElementById("p2").style.backgroundColor = "#FF4D4D";
			document.getElementById("p1").style.backgroundColor = "white";
			return false;
		}
	} else {
		alert("El campo \"Contraseña\" no puede estar vacio.");
		document.getElementById("p1").focus();
		document.getElementById("p1").style.backgroundColor = "#FF4D4D";
		document.getElementById("p2").style.backgroundColor = "white";
		return false;
	}
	document.getElementById("p1").style.backgroundColor = "white";
	document.getElementById("p2").style.backgroundColor = "white";
	return true;
} 

function validatePassword(password_to_test) {
	var filter = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,}$/;
	return filter.test(password_to_test);
}

function showInstructions() {
	if (!flag) {
		document.getElementById("instructions").style.display="block";
		flag = true;
	} else {
		document.getElementById("instructions").style.display="none";
		flag = false;
	}
}