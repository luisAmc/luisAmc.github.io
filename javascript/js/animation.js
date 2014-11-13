function startAnimation() {
	var frames = document.getElementById("llamaAnimation").children;
	var frameCount = frames.length;
	var index = 0;
	setInterval(function() {
		frames[index % frameCount].style.display = "none";
		frames[++index % frameCount].style.display = "block";
	}, 80);
}