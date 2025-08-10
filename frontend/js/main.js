const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const authSection = document.getElementById('auth-section');
    const responseDiv = document.getElementById('response');
    const apiBaseUrl = 'http://127.0.0.1:8000';

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
        const token = localStorage.getItem('accessToken');

        if(!token){
            responseDiv.style.display='block';
            responseDiv.innerText="Token wygasł, zaloguj się ponownie.";
            return;
        }
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