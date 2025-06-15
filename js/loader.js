document.addEventListener("DOMContentLoaded", function () {
  // Show the loader
  const loader = document.getElementById("loading");
  loader.style.display = "flex";

  const minDuration = 5000; // 5 seconds
  const startTime = Date.now();

  // When the page finishes loading
  window.addEventListener("load", function () {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minDuration - elapsed);

    setTimeout(() => {
      loader.style.display = "none";
      document.getElementById("body").style.display = "block";
      if (typeof window.waveTwiceThenPose === "function") {
        window.waveTwiceThenPose();
      }
    }, remaining);
  });
});