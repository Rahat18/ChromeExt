
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    // Store the values in local storage
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);
    authenticateUser();

  });
});
function authenticateUser() {
  // Get the values of the email and password fields from local storage
  var email = localStorage.getItem("email");
  var password = localStorage.getItem("password");
  // console.log(email);
  // console.log(password)

  fetch("https://apitest.digiboxx.com/dgb_login_func/dgb_user_login_post_fn/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json"
    },
    body: JSON.stringify({
      logUsername: email,
      logUserpass: password,
      force_delete_sessions: 1
    })
  })
    .then(response => response.json())
    .then(data => {
      // console.log(data)
      if (data.status === "success") {
        // User is authenticated, do something here
        console.log("User is authenticated");
        // console.log(data.token)
        localStorage.setItem('userToken', data.token)
        // console.log(localStorage.getItem('userToken'))

        chrome.storage.sync.set({userToken : data.token}, function() {
          // console.log('Settings saved');
        });
      }
      else {
        // User is not authenticated, do something here
        console.log("User is not authenticated");
        // window.close();
        alert("Error!");
      }
    })
    .catch(error => {
      console.log("Error:", error);
    });
}

function saveToLocalStorage(data) {
  // localStorage.setItem("token", "value");
  localStorage.setItem('session-data', data.message)
  localStorage.setItem('userToken', data.token)
  localStorage.setItem('role', data.role_id)
  localStorage.setItem('is_first_time', data.is_first_time)
  localStorage.setItem('package_type', data.package_type)
  localStorage.setItem('total_storage_allowed', data.total_storage_allowed)
  localStorage.setItem('digispace', data.digispace)
  localStorage.setItem('id', data.user_id)
  localStorage.setItem('org_id', data.organization_id)
  sessionStorage.setItem('pageterm', 'created_by')
  sessionStorage.setItem('is_managed', 'N')
}



 
