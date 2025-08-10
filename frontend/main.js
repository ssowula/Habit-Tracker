const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const authSection = document.getElementById('auth-section');
const responseDiv = document.getElementById('response');
const habitsList = document.getElementById('habits-list');
const addHabitForm = document.getElementById('addHabitForm');
const apiBaseUrl = 'http://127.0.0.1:8000';

function getTokenOrRedirect() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = '/index.html';
    }
    return token;
}


function toggleView(){
    loginView.style.display = loginView.style.display === 'none' ? 'block' : 'none';
    registerView.style.display = registerView.style.display === 'none' ? 'block' : 'none';
    responseDiv.innerText = '';
    }

    document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const res = await fetch(`${apiBaseUrl}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Zarejestrowano pomyślnie");
            toggleView();
        } else {
            alert(`Rejestracja nie powiodła się: ${data.detail || "Nieznany błąd"}`);
        }
    } catch (err) {
        console.error(err);
        alert("Błąd połączenia z API");
    }
});

    document.getElementById('loginForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        try{
            const res = await fetch(`${apiBaseUrl}/token`,{
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });
            const data = await res.json();
                if (!res.ok) throw new Error(data.detail);

                localStorage.setItem('accessToken', data.access_token);

                loginView.style.display = 'none';
                registerView.style.display = 'none';
                authSection.style.display = 'block';
                responseDiv.style.display='block';
                responseDiv.innerText = 'Zalogowano pomyślnie!';
            } catch (error) {
                responseDiv.style.display='block';
                responseDiv.innerText = `Błąd: ${error.message}`;
            }
        });

    async function getProfile(){
        const token = getTokenOrRedirect();
        if (!token) return;

        try{
            const res = await fetch(`${apiBaseUrl}/users/me`,{
                method: "GET",
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);
            responseDiv.style.display='block';
            responseDiv.innerHTML = `<h3>Twoje dane:</h3><pre>${JSON.stringify(data, null, 2)}</pre>`;
        } catch (error) {
            responseDiv.style.display='block';
            responseDiv.innerText = `Błąd: ${error.message}`;
        }
    }
    function logout() {
        localStorage.removeItem('accessToken');
        loginView.style.display = 'block';
        authSection.style.display = 'none';
        responseDiv.style.display='block';
        responseDiv.innerText = 'Wylogowano.';
    }
    function goToHabitsDashboard(){
    window.location.href='HabitsDashboard.html';
}
    async function fetchAndDisplayHabits() {
        const token = getTokenOrRedirect();
            if (!token) return;
        try {
            const res = await fetch(`${apiBaseUrl}/habits/`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const habits = await res.json();
            if (!res.ok) {
                throw new Error('Nie udało się pobrać nawyków.');
            }
            habitsList.innerHTML = '';
            if (habits.length === 0) {
                habitsList.innerHTML = '<tr><td colspan="3" style="text-align:center;">Nie masz jeszcze żadnych nawyków.</td></tr>';
            } else {
                habits.forEach(habit => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${habit.name}</td>
                        <td>${habit.frequency}</td>
                        <td><input type="checkbox" class="checked_habit" data-habit-id="${habit.id}"></td>
                    `;
                    habitsList.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Błąd pobierania nawyków:', error);
            habitsList.innerHTML = '<tr><td colspan="3" style="text-align:center;">Wystąpił błąd.</td></tr>';
        }
    }
if (addHabitForm) {
    addHabitForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const name = document.getElementById('habitName').value;
        const frequency = document.getElementById('habitFrequency').value;
        const token = getTokenOrRedirect();
            if (!token) return;
        try {
            const res = await fetch(`${apiBaseUrl}/habits/`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, frequency })
            });
            const data = await res.json();
            if (res.ok) {
                await fetchAndDisplayHabits();
                addHabitForm.reset();
            } else {
                responseDiv.style.display = 'block';
                responseDiv.innerText = `Nie udało się dodać nawyku: ${data.detail}`;
            }
        } catch (err) {
            console.error(err);
            responseDiv.style.display = 'block';
            responseDiv.innerText = "Błąd połączenia z API";
        }
    });}
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('accessToken');
    if (token && loginView) {
        loginView.style.display = 'none';
        registerView.style.display = 'none';
        authSection.style.display = 'block';
        responseDiv.style.display = 'none';
    }

    if (habitsList) {
        fetchAndDisplayHabits();
    }
});
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('checked_habit')) {
        const habitId = event.target.dataset.habitId;
        const isChecked = event.target.checked;
        console.log(`Nawyk o ID: ${habitId} został zaznaczony jako: ${isChecked}`);
    }
});