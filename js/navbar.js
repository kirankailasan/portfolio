
    const sidebar = document.getElementById('sidebar');
    const togglebtn = document.getElementById('togglebtn');
    const image = document.getElementById('img');

    togglebtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      const opened = sidebar.classList.contains('open');
      image.src = opened
        ? "images/-sidebar.png"
        : "images/sidebar.png"
    });

    // Close sidebar if clicked outside
document.addEventListener('click', (e) => {
  const isClickInsideSidebar = sidebar.contains(e.target);
  const isClickOnToggleBtn = togglebtn.contains(e.target);

  if (!isClickInsideSidebar && !isClickOnToggleBtn && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    image.src = "images/sidebar.png";
  }
});

    