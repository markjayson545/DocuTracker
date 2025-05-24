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
    fetch("php/services/check-session.php")
      .then((response) => response.json())
      .then((data) => {
        console.log("Data: " + data);
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
      if (userDashboardLink) {
      userDashboardLink.style.display = "block";
      }
      if (identityVerificationLink) {
      identityVerificationLink.style.display = "none";
      }
      if (indexPage && getStartedButton) {
      getStartedButton.style.display = "none";
      }
    } else {
      if (userDashboardLink) {
      userDashboardLink.style.display = "none";
      }
      if (identityVerificationLink) {
      identityVerificationLink.style.display = "block";
      }
      if (indexPage && getStartedButton) {
      getStartedButton.href = "identity-verification.html";
      getStartedButton.innerHTML = "<i class='fas fa-check'></i> Verify your Identity";
      }
    }
  }

  function userRoleRedirect(role){
    const pathname = window.location.pathname;
    const currentPage = pathname.substring(pathname.lastIndexOf('/') + 1);

    // Pages that should not trigger role-based redirection
    const nonRedirectPages = [
        "index.html",
        "sign-in.html", // Should not be reachable if logged in, but good to list
        "sign-up.html", // Should not be reachable if logged in
        "identity-verification.html",
        "account-suspended.html",
        "user-profile.html", // Assuming user-profile.html is generic or for non-admins
        "user-settings.html", // Assuming user-settings.html is generic or for non-admins
        "user-request-history.html" // Assuming this is for non-admins
    ];

    if (nonRedirectPages.includes(currentPage)) {
        return; 
    }

    const adminPages = [
        "admin-dashboard.html",
        "admin-manage-applications.html",
        "admin-manage-requests.html",
        "admin-manage-users.html",
        "admin-reports.html",
        "admin-settings.html",
        "admin-user-profile.html"
    ];

    const userDashboardPage = "user-dashboard.html";
    const adminDashboardPage = "admin-dashboard.html";

    if (role === "admin") {
        // If admin is on user-dashboard.html, redirect to admin-dashboard.html
        if (currentPage === userDashboardPage && currentPage !== adminDashboardPage) {
            window.location.href = adminDashboardPage;
        }
    } else if (role && role !== "admin") { // For any logged-in role other than admin
        // If non-admin is on an admin page, redirect to user-dashboard.html
        if (adminPages.includes(currentPage) && currentPage !== userDashboardPage) {
            window.location.href = userDashboardPage;
        }
    }
  }

  fetch("php/services/check-session.php")
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
        const dashboardLink = document.getElementById("dashboard-btn-link");
        if (dashboardLink) {
          if (data.data.role === "admin") {
            dashboardLink.href = "admin-dashboard.html";
          } else {
            dashboardLink.href = "user-dashboard.html";
          }
        }

        
        updateVerificationUI(data.data.is_verified);
        userRoleRedirect(data.data.role); // Added call for role-based redirection
        
        // Add event listener to logout button
        const logoutButton = document.getElementById("logout-button");
        if (logoutButton) {
          logoutButton.addEventListener("click", function () {
            window.location.href = "php/auth/logout.php";
          });
        }

        if (data.data.status === "suspended") {
          alert(
            "Your account has been suspended. Please contact support for more information."
          );
          setTimeout(() => {
            const url = new URL(window.location.href);
            const path = url.pathname;
            // Only redirect if user is not already on the suspended page or index page
            if(!path.endsWith("account-suspended.html") && !path.endsWith("index.html")) {
              window.location.href = "account-suspended.html";
            }
            
          }, 100);
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
