const axios = require('axios');

function logoutUser() {
  axios.post('http://localhost:8080/api/logout', {}, {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
  .then(response => {
    console.log('Odpowiedź z backendu:', response);

    if (response.data === "Wylogowano pomyślnie!") {
      console.log('Wylogowano pomyślnie!');
      localStorage.removeItem('token');
      window.location.href = '../auth/login.html';
    } else {
      alert('Błąd wylogowywania! Spróbuj ponownie.');
    }
  })
  .catch(error => {
    console.error('Wystąpił błąd wylogowywania:', error);
    alert('Wystąpił błąd wylogowywania! Spróbuj ponownie.');
  });
}

document.getElementById('logoutButton').addEventListener('click', logoutUser);
