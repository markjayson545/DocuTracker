document.addEventListener("DOMContentLoaded", function () {
  const loginButton = document.getElementsByClassName("login-or-create");
  const userInfo = document.getElementsByClassName("user-info");
  const userName = document.getElementsByClassName("user-name");
  const userEmail = document.getElementsByClassName("user-email");

  const userDashboardLink = document.getElementById("user-dashboard-btn");
  const identityVerificationLink = document.getElementById(
    "identity-verification-btn"
  );

  const getStartedButton = document.getElementById("get-started-a");

  // TODO: Add a admin mode and client mode session check implementation

  window.getUserInfo = function () {
    fetch("php/check-session.php")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.status === "success") {
          loginButton[0].style.display = "none";
          userInfo[0].style.display = "flex";
          userName[0].innerHTML = data.data.username;
          userEmail[0].innerHTML = data.data.email;
          userEmail[1].innerHTML = data.data.email;
          userName[1].innerHTML = data.data.username;
          updateVerificationUI(data.data.is_verified);
        } else {
          loginButton[0].style.display = "flex";
          userInfo[0].style.display = "none";
          userName[0].innerHTML = "";
          userEmail[0].innerHTML = "";
          userEmail[1].innerHTML = "";
          userName[1].innerHTML = "";
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  function updateVerificationUI(status) {
    const indexPage = window.location.pathname.endsWith("index.html");

    if (status == 1) {
      userDashboardLink.style.display = "block";
      identityVerificationLink.style.display = "none";
      if (indexPage) {
        getStartedButton.style.display = "none";
      }
    } else {
      userDashboardLink.style.display = "none";
      identityVerificationLink.style.display = "block";
      if (indexPage) {
        getStartedButton.href = "identity-verification.html";
        getStartedButton.innerHTML = "<i class='fas fa-check'></i> Verify your Identity";
      }
    }
  }

  fetch("php/check-session.php")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.status === "success") {
        // User is logged in
        loginButton[0].style.display = "none";
        userInfo[0].style.display = "flex";
        userName[0].innerHTML = data.data.username;
        userEmail[0].innerHTML = data.data.email;

        userEmail[1].innerHTML = data.data.email;
        userName[1].innerHTML = data.data.username;

        updateVerificationUI(data.data.is_verified);

        // Add event listener to logout button
        const logoutButton = document.getElementById("logout-button");
        if (logoutButton) {
          logoutButton.addEventListener("click", function () {
            window.location.href = "php/logout.php";
          });
        }
      } else {
        // User is not logged in
        loginButton[0].style.display = "flex";
        userInfo[0].style.display = "none";
        userName[0].innerHTML = "";
        userEmail[0].innerHTML = "";

        userEmail[1].innerHTML = "";
        userName[1].innerHTML = "";
      }
    })
    .catch((error) => {
      console.log(error);
    });
});
