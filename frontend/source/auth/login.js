const axios = require('axios');


function loginUser(email, password) {
  axios.post('http://localhost:8080/api/auth/login', { email, password })
    .then(response => {
      if (response.data.success) {
        console.log('Zalogowano pomyślnie!');
        localStorage.setItem('token', response.data.token);
        window.location.href = '../home/home.html';
      } else {
        alert('Błąd logowania! Spróbuj ponownie.');
      }
    })
    .catch(error => {
      console.error('Wystąpił błąd logowania:', error);
    });
}

function handleLoginFormSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  loginUser(email, password);
}

document.getElementById('loginForm').addEventListener('submit', handleLoginFormSubmit);
