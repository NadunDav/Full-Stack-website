
        // --- PASSWORD HASHING FUNCTION (using SHA-256) ---
        async function hashPassword(password) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        }

        async function verifyPassword(password, hash) {
            const hashedPassword = await hashPassword(password);
            return hashedPassword === hash;
        }

        // --- NOTIFICATION ENGINE ---
        function notify(text, type = 'success') {
            const toast = document.getElementById('notification');
            toast.innerText = text;
            toast.style.backgroundColor = type === 'success' ? 'var(--success)' : 'var(--error)';
            toast.classList.add('show');
            setTimeout(() => { toast.classList.remove('show'); }, 3000);
        }

        // --- THEME LOGIC ---
        function toggleTheme() {
            const current = document.documentElement.getAttribute('data-theme');
            const target = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', target);
            localStorage.setItem('theme', target);
            notify(`Switched to ${target} mode`);
        }

        // --- FORM NAVIGATION ---
        function showForm(id) {
            document.querySelectorAll('.card').forEach(c => c.classList.add('hidden'));
            document.getElementById(id).classList.remove('hidden');
        }

        // --- CORE LOGIC ---
        async function handleRegister() {
            const user = document.getElementById('regUser').value.trim();
            const pass = document.getElementById('regPass').value.trim();

            if (!user || !pass) return notify("Please fill all fields", "error");

            let db = JSON.parse(localStorage.getItem('userDB')) || [];
            if (db.find(u => u.user === user)) return notify("User already exists", "error");

            const hashedPass = await hashPassword(pass);
            db.push({ user, pass: hashedPass });
            localStorage.setItem('userDB', JSON.stringify(db));
            notify("Account created! You can now login.");
            showForm('loginBox');
        }

        async function handleLogin() {
            const user = document.getElementById('logUser').value;
            const pass = document.getElementById('logPass').value;

            let db = JSON.parse(localStorage.getItem('userDB')) || [];
            const found = db.find(u => u.user === user);

            if (found && await verifyPassword(pass, found.pass)) {
                localStorage.setItem('activeUser', user);
                notify("Welcome back!");
                renderDashboard(user);
            } else {
                notify("Invalid username or password", "error");
            }
        }

        function renderDashboard(user) {
            showForm('dashboardBox');
            document.getElementById('userNameDisplay').innerText = user;
            document.getElementById('userAvatar').innerText = user.charAt(0).toUpperCase();
            document.getElementById('userAvatar1').innerText = user.charAt(0).toUpperCase();
            
            const quotes = [
                "Your security score is 98% today.",
                "AI has optimized your layout for 2025.",
                "Ready to start your next session?"
            ];
            document.getElementById('aiQuote').innerText = quotes[Math.floor(Math.random() * quotes.length)];
        }
    

        function handleLogout() {
            localStorage.removeItem('activeUser');
            notify("Logged out safely");
            setTimeout(() => location.reload(), 500);
        }

        // ON STARTUP
        window.onload = () => {
            const theme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', theme);

            const session = localStorage.getItem('activeUser');
            if (session) renderDashboard(session);
        };


    