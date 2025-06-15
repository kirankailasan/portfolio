
    window.addEventListener('DOMContentLoaded', () => {
      VANTA.WAVES({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x0e0e0e, 
        shininess: 40,
        waveHeight: 20,
        waveSpeed: 0.4,
        zoom: 1.2
      });
    });
 

      $(document).ready(function () {
      $('.ripple-background').ripples({
        resolution: 256,
        perturbance: 1000,
        dropRadius: 20,
        interactive: true
      });
    });