const apiBaseUrl = 'http://127.0.0.1:8000';
const responseDiv = document.getElementById('response');
const habitsList = document.getElementById('habits-list');
const addHabitForm = document.getElementById('addHabitForm');

async function fetchAndDisplayHabits() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }
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
                    <td><button class="small-btn">Oznacz</button></td>
                `;
                habitsList.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Błąd pobierania nawyków:', error);
        habitsList.innerHTML = '<tr><td colspan="3" style="text-align:center;">Wystąpił błąd.</td></tr>';
    }
}

addHabitForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const name = document.getElementById('habitName').value;
    const frequency = document.getElementById('habitFrequency').value;
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

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
            fetchAndDisplayHabits();
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
});
document.addEventListener('DOMContentLoaded', fetchAndDisplayHabits);
