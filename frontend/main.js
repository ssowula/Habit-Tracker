const apiBaseUrl = 'http://127.0.0.1:8000';
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const authSection = document.getElementById('auth-section');
const responseDiv = document.getElementById('response');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const addHabitForm = document.getElementById('addHabitForm');
const allHabitsContainer = document.getElementById('habits-list');
const todayHabitsContainer = document.getElementById('habits-today-list');
const todayDateSpan = document.getElementById('current-date');
const noHabitsMessage = document.getElementById('no-habits-message');
const completeHabitsBtn = document.getElementById('complete-habits-btn');

function getTokenOrRedirect() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.location.href = '/index.html';
        }
    }
    return token;
}

async function getHabitsFromAPI(endpointUrl) {
    const token = getTokenOrRedirect();
    if (!token) return [];

    try {
        const res = await fetch(`${apiBaseUrl}${endpointUrl}`, {
            method: "GET",
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) {
            logout();
            return [];
        }
        if (!res.ok) {
            console.error("Błąd odpowiedzi API: ", await res.text());
            return [];
        }
        return await res.json();
    } catch (error) {
        console.error("Błąd sieci lub połączenia z API: ", error);
        return [];
    }
}

function renderHabitsTable(habits) {
    if (!allHabitsContainer) return;

    allHabitsContainer.innerHTML = '';
    if (habits.length === 0) {
        allHabitsContainer.innerHTML = '<tr><td colspan="3" style="text-align:center;">Nie masz jeszcze żadnych nawyków.</td></tr>';
    } else {
        habits.forEach(habit => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${habit.name}</td>
                <td>${habit.frequency}</td>
                <td><input type="checkbox" class="checked_habit" data-habit-id="${habit.id}"></td>
            `;
            allHabitsContainer.appendChild(row);
        });
    }
}

function renderHabitsList(habits) {
    if (!todayHabitsContainer) return;

    todayHabitsContainer.innerHTML = '';
    if (noHabitsMessage) {
        noHabitsMessage.style.display = habits.length === 0 ? 'block' : 'none';
    }

    if (habits.length > 0) {
        habits.forEach(habit => {
            const listItem = document.createElement('li');
            listItem.dataset.habitId = habit.id;
            listItem.innerHTML = `
                <input type="checkbox" id="habit-${habit.id}" class="today_checkbox">
                <label for="habit-${habit.id}">${habit.name}</label>
            `;
            todayHabitsContainer.appendChild(listItem);
        });
    }
    updateCompleteButtonVisibility();
}

function toggleView() {
    if (loginView && registerView) {
        loginView.style.display = loginView.style.display === 'none' ? 'block' : 'none';
        registerView.style.display = registerView.style.display === 'none' ? 'block' : 'none';
    }
    if (responseDiv) responseDiv.innerText = '';
}

function updateCompleteButtonVisibility() {
    if (!todayHabitsContainer || !completeHabitsBtn) return;
    const checkedCheckboxes = todayHabitsContainer.querySelectorAll('input[type="checkbox"]:checked:not(:disabled)');
    completeHabitsBtn.style.display = checkedCheckboxes.length > 0 ? 'block' : 'none';
}

async function getProfile() {
    const token = getTokenOrRedirect();
    if (!token) return;

    try {
        const res = await fetch(`${apiBaseUrl}/users/me`, {
            method: "GET",
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail);
        if (responseDiv) {
            responseDiv.style.display = 'block';
            responseDiv.innerHTML = `<h3>Twoje dane:</h3><pre>${JSON.stringify(data, null, 2)}</pre>`;
        }
    } catch (error) {
        if (responseDiv) {
            responseDiv.style.display = 'block';
            responseDiv.innerText = `Błąd: ${error.message}`;
        }
    }
}

function logout() {
    localStorage.removeItem('accessToken');
    window.location.href = '/index.html';
}

function goToHabitsDashboard() {
    window.location.href = 'HabitsDashboard.html';
}

function goToHabitsToday() {
    window.location.href = 'HabitsToday.html';
}

if (registerForm) {
    registerForm.addEventListener('submit', async(event) => {
        event.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const res = await fetch(`${apiBaseUrl}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
}

if (loginForm) {
    loginForm.addEventListener('submit', async(event) => {
        event.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const res = await fetch(`${apiBaseUrl}/token`, {
                method: "POST",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);

            localStorage.setItem('accessToken', data.access_token);
            loginView.style.display = 'none';
            registerView.style.display = 'none';
            authSection.style.display = 'block';
            responseDiv.style.display = 'block';
            responseDiv.innerText = 'Zalogowano pomyślnie!';
        } catch (error) {
            if (responseDiv) {
                responseDiv.style.display = 'block';
                responseDiv.innerText = `Błąd: ${error.message}`;
            }
        }
    });
}

if (addHabitForm) {
    addHabitForm.addEventListener('submit', async(event) => {
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
                const allHabits = await getHabitsFromAPI('/habits/');
                renderHabitsTable(allHabits);
                addHabitForm.reset();
            } else if (responseDiv) {
                responseDiv.style.display = 'block';
                responseDiv.innerText = `Nie udało się dodać nawyku: ${data.detail}`;
            }
        } catch (err) {
            console.error(err);
            if (responseDiv) {
                responseDiv.style.display = 'block';
                responseDiv.innerText = "Błąd połączenia z API";
            }
        }
    });
}

if (completeHabitsBtn) {
    completeHabitsBtn.addEventListener('click', async() => {
        const checkedCheckboxes = todayHabitsContainer.querySelectorAll('input[type="checkbox"]:checked:not(:disabled)');
        const token = getTokenOrRedirect();
        if (!token || checkedCheckboxes.length === 0) return;

        const completionPromises = Array.from(checkedCheckboxes).map(checkbox => {
            const habitId = checkbox.closest('li').dataset.habitId;
            return fetch(`${apiBaseUrl}/completions/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ habit_id: parseInt(habitId) })
            });
        });

        try {
            const responses = await Promise.all(completionPromises);
            const allOk = responses.every(res => res.ok);

            if (allOk) {
                checkedCheckboxes.forEach(checkbox => checkbox.disabled = true);
                updateCompleteButtonVisibility();
            } else {
                alert('Wystąpił błąd podczas zapisywania niektórych nawyków.');
            }
        } catch (error) {
            console.error("Błąd wysyłania danych:", error);
            alert("Błąd połączenia z serwerem.");
        }
    });
}

document.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('checked_habit')) {
        const habitId = target.dataset.habitId;
        console.log(`Zaznaczono nawyk (tabela) o ID: ${habitId}, status: ${target.checked}`);
    }

    if (target.classList.contains('today_checkbox')) {
        const listItem = target.closest('li');
        if (listItem) {
            listItem.classList.toggle('done', target.checked);
            updateCompleteButtonVisibility();
        }
    }
});

document.addEventListener('DOMContentLoaded', async() => {
    const token = localStorage.getItem('accessToken');
    if (token && loginView) {
        loginView.style.display = 'none';
        registerView.style.display = 'none';
        authSection.style.display = 'block';
        if (responseDiv) responseDiv.style.display = 'none';
    }

    if (allHabitsContainer) {
        const allHabits = await getHabitsFromAPI('/habits/');
        renderHabitsTable(allHabits);
    }

    if (todayHabitsContainer) {
        if (todayDateSpan) {
            todayDateSpan.textContent = new Date().toLocaleDateString('pl-PL', { dateStyle: 'long' });
        }
        const todayHabits = await getHabitsFromAPI('/habits/today');
        renderHabitsList(todayHabits);
    }
});