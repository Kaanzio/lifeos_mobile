/**
 * Life OS - Main App Module v2.2
 * Login sistemi ve ana uygulama kontrolü
 */

const App = {
    currentPage: 'dashboard',
    userName: '',
    clockInterval: null,

    startOSClock() {
        const update = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            const fullTimeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const dateStr = now.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            document.querySelectorAll('.os-status-clock').forEach(el => el.textContent = timeStr);
            document.querySelectorAll('.os-clock-large').forEach(el => el.textContent = fullTimeStr);
            document.querySelectorAll('.os-date-large').forEach(el => el.textContent = dateStr);
        };
        update();
        if (this.clockInterval) clearInterval(this.clockInterval);
        this.clockInterval = setInterval(update, 1000);
    },

    initMatrixBackground() {
        if (this.matrixInterval) clearInterval(this.matrixInterval);

        let canvas = document.getElementById('matrixCanvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'matrixCanvas';
            document.body.appendChild(canvas);
        }
        const ctx = canvas.getContext('2d');

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const purpleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";
        const specialData = [
            "IP: 192.168.1.104", "LOC: ZURICH, CH", "AES-256-GCM",
            "PROXY: ENCRYPTED", "VPN: ACTIVE", "DNS: SECURE",
            "LAT: 47.3769 N", "LON: 8.5417 E", "USER: ADMIN",
            "CPU: 3.2GHz", "RAM: 32GB", "KERN: v2.2.0"
        ];

        const fontSize = 14;
        const columns = width / fontSize;
        const drops = [];

        for (let x = 0; x < columns; x++) drops[x] = 1;

        const draw = () => {
            ctx.fillStyle = 'rgba(5, 5, 16, 0.05)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#a78bfa';
            ctx.font = fontSize + 'px "JetBrains Mono"';

            for (let i = 0; i < drops.length; i++) {
                const text = Math.random() > 0.95
                    ? specialData[Math.floor(Math.random() * specialData.length)]
                    : purpleChars.charAt(Math.floor(Math.random() * purpleChars.length));

                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        };

        this.matrixInterval = setInterval(draw, 45); // Slower rain (~25% reduction)
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            const newCols = width / fontSize;
            while (drops.length < newCols) drops.push(1);
        });
    },

    requestFullScreen() {
        const doc = window.document;
        const docEl = doc.documentElement;
        const requestFS = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        if (!doc.fullscreenElement && requestFS) {
            requestFS.call(docEl).catch(() => { });
        }
    },

    showBootSequence(callback) {
        const overlay = document.getElementById('login-overlay');
        overlay.style.display = 'flex';
        overlay.innerHTML = `
            <div class="boot-sequence" id="bootSequence"></div>
            <div class="boot-skip-prompt">ATLAMA: ÇİFT TIKLA | TAM EKRAN: TUŞA BAS</div>
            <div class="scanline"></div>
        `;
        const bootContainer = document.getElementById('bootSequence');
        bootContainer.style.display = 'flex';

        this.initMatrixBackground();

        const genHex = (l) => Math.random().toString(16).substr(2, l).toUpperCase();
        const lines = [
            "LIFEOS KERNEL V2.2.0-STABLE (X86_64) ON BROWSER_INSTANCE_9",
            "----------------------------------------------------------",
            `[ OK ] KERNEL_CORE: INITIALIZING CPU AT 0x${genHex(8)}`,
            `[ OK ] MMU: MEMORY MANAGEMENT UNIT (PAGING ACTIVE, 48-BIT)`,
            `[ OK ] ACPID: POWER MANAGEMENT DAEMON STARTED`,
            `[ OK ] PCI_BUS: SCANNING DEVICES (VENDOR_ID: 0x8086, 0x10DE)`,
            `[ OK ] SATAD: DETECTING LOCAL STORAGE PERIPHERALS...`,
            `[ OK ] STORAGE: MOUNTING /DEV/LOCAL_DB (LEVELDB) TO /DATA_SECURE`,
            `[ INFO ] CRYPTO_CORE: AES-256-GCM HARDWARE ACCELERATION ENABLED`,
            `[ OK ] NET_DAEMON: ESTABLISHING OFFLINE_AIRGAP_BRIDGE...`,
            `[ OK ] ROOT_FS: CHECKING FILESYSTEM INTEGRITY... 100%`,
            `[ INFO ] SECURE_SESSION: RSA-4096 HANDSHAKE [COMPLETED]`,
            `[ INFO ] MOD_LOADER: DASHBOARD_CORE_m [v.2.2.4]`,
            `[ INFO ] MOD_LOADER: HABIT_CHAIN_e [v.1.1.0]`,
            `[ INFO ] MOD_LOADER: NOTES_V3_p [v.0.9.8]`,
            `[ OK ] SYSCALL: 486 SYSTEM CALLS REGISTERED`,
            `[ OK ] SCHED: SYSTEM SCHEDULER INITIALIZED`,
            `[ INFO ] PERIPHERAL: KEYBOARD_HID DETECTED`,
            `[ INFO ] PERIPHERAL: MOUSE_HID DETECTED`,
            `[ OK ] UI_SUBSYSTEM: LOADING ASSETS...`,
            `[ OK ] UI_SUBSYSTEM: ATTACHING GPU BUFFER...`,
            `[ OK ] ENCRYPTION: KEYRING_v4 LOADED`,
            `[ INFO ] KERNEL: DUMPING VRAM STATE... DONE`,
            `[ INFO ] KERNEL: ALLOCATING HEAP MEMORY... 4096MB`,
            `[ OK ] NETWORK: LOOPBACK_V4 ACTIVE`,
            `[ OK ] SECURITY: SELINUX_ENFORCING`,
            `[ OK ] VFS: VIRTUAL FILE SYSTEM MOUNTED`,
            `[ INFO ] KERNEL: LOADING BOOT_UI_m...`,
            "----------------------------------------------------------",
            `[ OK ] RUNLEVEL: SYSTEM READY. SESSION UUID: ${genHex(8)}`,
            `[ INFO ] STARTING USER_INTERFACE_DAEMON...`,
            "SİSTEM ÇEKİRDEĞİ BAŞLATILDI. GİRİŞ MODÜLÜ AKTİF..."
        ];

        // Uzun olması için bazı sahte loop'lar ekleyelim
        for (let j = 0; j < 30; j++) {
            lines.splice(20, 0, `[ DEBUG ] SYSLOG: SCANNING BLOCK ${genHex(4)}... VERIFIED`);
        }

        let i = 0;
        let active = true;
        let bootInterval;

        const finish = () => {
            if (!active) return;
            active = false;
            clearTimeout(bootInterval);
            window.removeEventListener('keydown', full);
            window.removeEventListener('click', full);
            window.removeEventListener('dblclick', skip);
            bootContainer.style.transition = 'opacity 0.4s ease';
            bootContainer.style.opacity = '0';
            document.querySelector('.boot-skip-prompt')?.remove();
            setTimeout(() => { bootContainer.remove(); callback(); }, 400);
        };

        const full = () => { this.requestFullScreen(); };
        const skip = () => { finish(); };

        window.addEventListener('keydown', full);
        window.addEventListener('click', full);
        window.addEventListener('dblclick', skip);

        const addLine = () => {
            if (!active) return;
            if (i < lines.length) {
                const line = document.createElement('div');
                line.className = 'boot-line';
                line.textContent = `> ${lines[i]}`;
                bootContainer.appendChild(line);
                bootContainer.scrollTop = bootContainer.scrollHeight;
                i++;
                bootInterval = setTimeout(addLine, 20 + Math.random() * 40);
            } else {
                setTimeout(finish, 800);
            }
        };
        addLine();
    },

    getSystemSummary() {
        const username = localStorage.getItem('lifeos_remember_me') || '';
        const oldPrefix = Storage.userPrefix;
        Storage.setUser(username);

        const summary = {
            books: (Storage.load(Storage.KEYS.BOOKS) || []).length,
            shows: (Storage.load(Storage.KEYS.SHOWS) || []).length,
            games: (Storage.load(Storage.KEYS.GAMES) || []).length
        };

        Storage.userPrefix = oldPrefix;
        return summary;
    },

    init() {
        // Clear loading overlay
        const loader = document.getElementById('loading-overlay');
        if (loader) loader.style.display = 'none';

        // Get remembered user to load correct settings immediately
        const rememberedUser = localStorage.getItem('lifeos_remember_me');
        if (rememberedUser) {
            Storage.setUser(rememberedUser);
        }

        // Auth modülünü başlat
        Auth.init();

        // Start Global Service
        this.startOSClock();

        // OS Boot Sequence — always skip on mobile for instant load
        const settings = Storage.load(Storage.KEYS.SETTINGS, {});
        const isMobile = window.innerWidth <= 991;
        const skipAnimation = isMobile || settings.layout?.disableEntryAnimations === true;

        if (isMobile) {
            // Mobile: Skip ALL login animations, show auth form directly
            this.renderMobileDirectLogin();
            const isBarHidden = localStorage.getItem('lifeos_statusbar_hidden') === 'true';
            if (isBarHidden) {
                document.getElementById('globalStatusBar')?.classList.add('hidden');
            }
        } else if (skipAnimation) {
            this.renderOSLoginExperience();
            const isBarHidden = localStorage.getItem('lifeos_statusbar_hidden') === 'true';
            if (isBarHidden) {
                document.getElementById('globalStatusBar')?.classList.add('hidden');
            }
        } else {
            this.showBootSequence(() => {
                this.renderOSLoginExperience();
                const isBarHidden = localStorage.getItem('lifeos_statusbar_hidden') === 'true';
                if (isBarHidden) {
                    document.getElementById('globalStatusBar')?.classList.add('hidden');
                }
            });
        }
    },

    toggleStatusBar() {
        const bar = document.getElementById('globalStatusBar');
        if (!bar) return;

        const isHidden = bar.classList.toggle('hidden');
        localStorage.setItem('lifeos_statusbar_hidden', isHidden);
    },

    renderOSLoginExperience() {
        const overlay = document.getElementById('login-overlay');
        overlay.style.display = 'flex';

        // Update global bar for login feel
        const statusMode = document.getElementById('osSystemMode');
        if (statusMode) statusMode.textContent = "Biometric Lock Active";

        const users = Auth.getUsers();
        const isSetup = users.length === 0;
        const rememberedUser = localStorage.getItem('lifeos_remember_me');

        // Eğer kullanıcı varsa ama "beni hatırla" yoksa bile ilk kullanıcıyı lock ekrana koyabiliriz
        const activeUser = rememberedUser || (users.length > 0 ? users[0].username : null);

        overlay.innerHTML = `
            <div class="landing-wrapper" style="justify-content: center; align-items: center;">
                <div class="lock-screen-content" id="lockScreen" style="max-width: 900px;">
                    <div class="os-clock-large">--:--:--</div>
                    <div class="os-date-large">SİSTEM BAŞLATILIYOR...</div>

                    ${activeUser ? `
                        <div class="os-system-identity">
                            <div class="os-user-name">${activeUser}</div>
                            
                            <div class="os-identity-item">
                                <span class="os-identity-label">Sistem Yetkisi</span>
                                <span class="os-identity-value">ROOT_USER / ADMIN</span>
                            </div>
                            <div class="os-identity-item">
                                <span class="os-identity-label">Ağ Durumu</span>
                                <span class="os-identity-value">IP: 192.168.1.${Math.floor(Math.random() * 255)}</span>
                            </div>
                            <div class="os-identity-item">
                                <span class="os-identity-label">Lokasyon</span>
                                <span class="os-identity-value">${Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[1]?.toUpperCase() || 'ISTANBUL'}</span>
                            </div>
                            <div class="os-identity-item">
                                <span class="os-identity-label">Güvenlik</span>
                                <span class="os-identity-value">AES-256 / SSL_ACTIVE</span>
                            </div>
                            <div class="os-identity-item">
                                <span class="os-identity-label">Çekirdek</span>
                                <span class="os-identity-value">LifeOS v2.2-STABLE</span>
                            </div>
                            <div class="os-identity-item">
                                <span class="os-identity-label">Oturum ID</span>
                                <span class="os-identity-value">${Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
                            </div>

                            <div class="os-scanning-overlay" id="scanEffect" style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: var(--accent-purple); box-shadow: 0 0 15px var(--accent-purple); z-index: 2; display: none; animation: scanAnimation 1.5s linear infinite;"></div>
                        </div>
                    ` : ''}
                    
                    <div class="os-unlock-prompt">Oturum açmak için bir tuşa basın veya tıklayın</div>
                </div>

                <div id="authContainer" class="lock-screen-hidden" style="width: 100%; display: flex; align-items: stretch; justify-content: space-between; gap: 40px; transform: scale(0.95); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);">
                    <!-- Auth UI will be rendered here -->
                </div>
            </div>
            <div class="scanline"></div>
        `;

        this.startOSClock();

        const unlock = () => {
            const lockScreen = document.getElementById('lockScreen');
            const authContainer = document.getElementById('authContainer');
            const scanEffect = document.getElementById('scanEffect');

            if (!lockScreen || lockScreen.classList.contains('lock-screen-hidden')) return;

            // Scanning Effect
            if (scanEffect) {
                scanEffect.style.display = 'block';
                const prompt = document.querySelector('.os-unlock-prompt');
                if (prompt) prompt.textContent = "Biyometrik Veri Taranıyor...";

                setTimeout(() => {
                    proceedUnlock();
                }, 1200);
            } else {
                proceedUnlock();
            }

            function proceedUnlock() {
                lockScreen.classList.add('lock-screen-hidden');

                setTimeout(() => {
                    lockScreen.style.display = 'none';
                    authContainer.classList.remove('lock-screen-hidden');
                    authContainer.style.transform = 'scale(1)';

                    if (isSetup) {
                        App.renderRegisterUI('setup', true);
                    } else {
                        App.renderLoginUI(true);
                    }
                }, 400); // Overlay kalsın ama lockscreen gitsin
            }

            window.removeEventListener('keydown', unlock);
            window.removeEventListener('click', unlock);
        };

        window.addEventListener('keydown', unlock);
        window.addEventListener('click', unlock);
    },

    /**
     * Mobile: Show auth form directly without lock screen or animations
     */
    renderMobileDirectLogin() {
        const overlay = document.getElementById('login-overlay');
        overlay.style.display = 'flex';

        const users = Auth.getUsers();
        const isSetup = users.length === 0;

        overlay.innerHTML = `
            <div class="landing-wrapper" style="justify-content: center; align-items: center;">
                <div id="authContainer" style="width: 100%; display: flex; align-items: stretch; justify-content: center;">
                    <!-- Auth UI will be rendered here -->
                </div>
            </div>
        `;

        this.startOSClock();

        if (isSetup) {
            this.renderRegisterUI('setup', true);
        } else {
            this.renderLoginUI(true);
        }
    },

    /**
     * Giriş Ekranını Render Et
     */
    renderLoginUI(isInsideOS = false) {
        const overlay = document.getElementById('login-overlay');
        const container = isInsideOS ? document.getElementById('authContainer') : null;

        if (!isInsideOS) overlay.style.display = 'flex';
        const stats = this.getSystemSummary();

        const content = `
                <div class="landing-info">
                    <div class="os-clock-large">--:--:--</div>
                    <div class="landing-tagline stagger-2">Sisteminize <span>Yeniden Hoş Geldiniz.</span></div>
                    <p class="landing-description stagger-3">Tüm öğrenme akışlarınız, görev yükünüz ve dijital kütüphaneniz güvenli LifeOS çekirdeği altında sizi bekliyor.</p>
                    
                    <div class="landing-stats-grid">
                        <div class="landing-stat-card stagger-4">
                            <div class="stat-icon" style="background: rgba(var(--accent-rgb), 0.1); color: var(--accent-purple);"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
                            <div class="stat-value">${stats.books}</div>
                            <div class="stat-label">Kitap Arşivi</div>
                        </div>
                        <div class="landing-stat-card stagger-5">
                            <div class="stat-icon" style="background: rgba(var(--accent-rgb), 0.1); color: var(--accent-purple);"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg></div>
                            <div class="stat-value">${stats.shows}</div>
                            <div class="stat-label">İçerik Listesi</div>
                        </div>
                        <div class="landing-stat-card stagger-6">
                            <div class="stat-icon" style="background: rgba(var(--accent-rgb), 0.1); color: var(--accent-purple);"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h.01M9 12h.01M15 12h.01M18 12h.01"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg></div>
                            <div class="stat-value">${stats.games}</div>
                            <div class="stat-label">Oyun Kütüphanesi</div>
                        </div>
                    </div>

                    <div class="stagger-7" style="margin-top: 20px; padding: 25px; background: rgba(var(--accent-rgb), 0.05); border-radius: 24px; border: 1px dashed rgba(var(--accent-rgb), 0.2); position: relative; overflow: hidden;">
                        <div style="font-weight: 700; font-size: 16px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; color: #fff;">
                            <span style="display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981;"></span>
                            Kernel Durumu: Yerel Şifreleme Aktif
                        </div>
                        <div style="font-size: 14px; color: var(--text-muted); line-height: 1.5;">
                            Tüm verileriniz 256-bit şifreleme ile yerel depolama biriminizde güvende. İnternet bağlantısı olmasa bile tüm sistem özelliklerine tam erişim sağlayabilirsiniz.
                        </div>
                    </div>
                </div>

                <div class="auth-card">
                    <div class="auth-logo-container">
                        <img src="assets/logo.png" alt="LifeOS Logo" class="auth-logo-premium">
                        <span class="logo-text-modern">Life<span class="logo-accent">OS</span></span>
                    </div>
                    
                    <h2 class="auth-title">Oturum Açın</h2>
                    <p class="auth-subtitle">Sisteme erişmek için kimliğinizi doğrulayın.</p>
                    
                    <div id="authError" class="auth-error"></div>

                    <form id="loginForm" class="auth-form">
                        <div class="form-group">
                            <input type="text" id="username" class="form-input" placeholder="Kullanıcı Adı" required>
                        </div>
                        <div class="form-group">
                            <input type="password" id="password" class="form-input" placeholder="Şifre" required>
                        </div>
                        
                        <div class="form-group-checkbox" style="display: flex; align-items: center; margin-bottom: 20px;">
                            <input type="checkbox" id="rememberMe" style="width: auto; margin-right: 10px; accent-color: var(--accent-purple);">
                            <label for="rememberMe" style="color: var(--text-muted); font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 4px;">Beni hatırla</label>
                        </div>

                        <button type="submit" class="btn btn-primary auth-btn" id="loginBtn">GİRİŞ YAP</button>
                        
                        <div class="auth-switch">
                            Henüz bir hesabınız yok mu? <a onclick="App.renderRegisterUI('normal', true)">Hesap Oluştur</a>
                        </div>
                    </form>
                </div>
        `;

        if (isInsideOS && container) {
            container.innerHTML = content;
        } else {
            overlay.innerHTML = `
                <div class="landing-wrapper">${content}</div>
                <div class="scanline"></div>
            `;
        }

        // Pre-fill if remembered
        const rememberedUser = localStorage.getItem('lifeos_remember_me');
        if (rememberedUser) {
            setTimeout(() => {
                const userInput = document.getElementById('username');
                const rememberCheckbox = document.getElementById('rememberMe');
                if (userInput && rememberCheckbox) {
                    userInput.value = rememberedUser;
                    rememberCheckbox.checked = true;
                }
            }, 100);
        }

        // Lockout kontrolü
        if (Auth.isLockedOut()) {
            this.showLockoutMessage();
            return;
        }

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        this.startOSClock();
    },

    /**
     * Kayıt Ekranını Render Et
     */
    renderRegisterUI(mode = 'normal', isInsideOS = false) {
        const overlay = document.getElementById('login-overlay');
        const container = isInsideOS ? document.getElementById('authContainer') : null;

        if (!isInsideOS) overlay.style.display = 'flex';
        const isSetup = mode === 'setup';

        const content = `
                <div class="landing-info">
                    <div class="os-clock-large">--:--:--</div>
                    <div class="landing-tagline stagger-2">Hayatınızı <span>Optimize</span> Edin.</div>
                    <p class="landing-description stagger-3">Modern, hızlı ve güvenli kişisel asistanınızla tanışın. Tüm verileriniz AES-256 standartlarında tarayıcınızda, tamamen size özel olarak saklanır.</p>
                    
                    <div class="landing-stats-grid">
                        <div class="landing-stat-card stagger-4">
                            <div class="stat-icon" style="background: rgba(167, 139, 250, 0.1); color: #a78bfa;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg></div>
                            <div style="font-weight: 600; font-size: 14px; color: #fff;">Tam Gizlilik</div>
                            <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">Zero-Knowledge yerel depolama.</div>
                        </div>
                        <div class="landing-stat-card stagger-5">
                            <div class="stat-icon" style="background: rgba(124, 58, 237, 0.1); color: #a78bfa;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="2" ry="2"/><path d="M7 2v20"/><path d="M17 2v20"/><path d="M2 12h20"/><path d="M2 7h20"/><path d="M2 17h20"/></svg></div>
                            <div style="font-weight: 600; font-size: 14px; color: #fff;">Dinamik Plan</div>
                            <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">Haftalık akıllı program yönetimi.</div>
                        </div>
                        <div class="landing-stat-card stagger-6">
                            <div class="stat-icon" style="background: rgba(var(--accent-rgb), 0.1); color: var(--accent-purple);"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
                            <div style="font-weight: 600; font-size: 14px; color: #fff;">Öğrenme Takibi</div>
                            <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">Akademik ve kişisel gelişim.</div>
                        </div>
                    </div>

                    <div class="stagger-7" style="margin-top: 20px; padding: 25px; background: rgba(124, 58, 237, 0.05); border-radius: 24px; border: 1px dashed rgba(124, 58, 237, 0.2);">
                        <div style="font-weight: 700; font-size: 16px; margin-bottom: 12px; color: #fff; display: flex; align-items: center; gap: 10px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                            Güvenlik ve Gizlilik Deklarasyonu
                        </div>
                        <div style="font-size: 14px; color: var(--text-muted); line-height: 1.6;">
                            LifeOS çekirdeği, kişisel verilerinizin gizliliğini en üst seviyede tutar. Hesabınızı oluşturduğunuzda, tarayıcınız dışında hiçbir noktaya veri akışı gerçekleşmez. Sisteminiz <strong>v2.2-STABLE</strong> sürümüyle tamamen hazırdır.
                        </div>
                    </div>
                </div>

                <div class="auth-card">
                    <div class="auth-logo-container">
                        <img src="assets/logo.png" alt="LifeOS Logo" class="auth-logo-premium">
                        <span class="logo-text-modern">Life<span class="logo-accent">OS</span></span>
                    </div>

                    <h2 class="auth-title">${isSetup ? 'Sistem Başlat' : 'Hesap Oluştur'}</h2>
                    <p class="auth-subtitle">${isSetup ? 'Yönetici kimliğinizi tanımlayarak kurulumu tamamlayın.' : 'Kendinize ait güvenli alanınızı oluşturun.'}</p>
                    
                    <div id="authError" class="auth-error"></div>

                    <form id="registerForm" class="auth-form">
                        <div class="form-group">
                            <input type="text" id="regUsername" class="form-input" placeholder="Kullanıcı Adı" required>
                        </div>
                        <div class="form-group">
                            <input type="password" id="regPassword" class="form-input" placeholder="Şifre" required>
                        </div>
                        <div class="form-group">
                            <input type="password" id="regPasswordConfirm" class="form-input" placeholder="Şifre Onay" required>
                        </div>

                        <button type="submit" class="btn btn-primary auth-btn" id="registerBtn">${isSetup ? 'KURULUMU TAMAMLA' : 'HESAP OLUŞTUR'}</button>
                        
                        ${!isSetup ? `
                        <div class="auth-switch">
                            Zaten bir hesabınız var mı? <a onclick="App.renderLoginUI(true)">Giriş Yap</a>
                        </div>
                        ` : ''}
                    </form>
                </div>
        `;

        if (isInsideOS && container) {
            container.innerHTML = content;
        } else {
            overlay.innerHTML = `
                <div class="landing-wrapper">${content}</div>
                <div class="scanline"></div>
            `;
        }

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        this.startOSClock();
    },

    /**
     * Giriş İşlemi
     */
    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const errorEl = document.getElementById('authError');
        const btn = document.getElementById('loginBtn');

        const result = Auth.login(username, password, rememberMe);

        if (result.success) {
            this.userName = result.user.username;
            // UI Render
            this.showApp();
            Notifications.showToast('Hoşgeldin ' + this.userName, 'Başarıyla giriş yapıldı.', 'success');
        } else {
            errorEl.style.display = 'block';
            errorEl.textContent = result.message;

            // Animasyon (salla)
            const card = document.querySelector('.auth-card');
            if (card) {
                card.classList.add('shake');
                setTimeout(() => card.classList.remove('shake'), 500);
            }

            if (Auth.isLockedOut()) {
                this.showLockoutMessage();
            }
        }
    },

    /**
     * Lockout Mesajı
     */
    showLockoutMessage() {
        const btn = document.getElementById('loginBtn');
        const errorEl = document.getElementById('authError');
        if (btn) btn.disabled = true;

        const updateTimer = () => {
            const remaining = Math.ceil((Auth.getLockoutTime() - Date.now()) / 1000);
            if (remaining <= 0) {
                if (btn) btn.disabled = false;
                if (btn) btn.textContent = 'Giriş Yap';
                if (errorEl) errorEl.style.display = 'none';
                return;
            }
            if (btn) btn.textContent = `Bekleyin (${Math.ceil(remaining / 60)} dk)`;
            if (errorEl) {
                errorEl.style.display = 'block';
                errorEl.textContent = `Çok fazla hatalı deneme. ${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')} sonra tekrar deneyin.`;
            }
            setTimeout(updateTimer, 1000);
        };
        updateTimer();
    },

    /**
     * Kayıt İşlemi
     */
    handleRegister() {
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regPasswordConfirm').value;
        const errorEl = document.getElementById('authError');

        if (password !== confirm) {
            errorEl.style.display = 'block';
            errorEl.textContent = 'Şifreler eşleşmiyor.';
            return;
        }

        const result = Auth.register(username, password);

        if (result.success) {
            // Kayıt başarılı, otomatik giriş veya login ekranına yönlendir
            // UX kararı: Otomatik giriş yaptıralım
            Auth.login(username, password);
            this.userName = username;

            errorEl.style.display = 'none';
            Notifications.add('Hoşgeldiniz', result.message, 'success', true);

            this.showApp();
        } else {
            errorEl.style.display = 'block';
            errorEl.textContent = result.message;
        }
    },

    /**
     * Uygulamayı Göster (Giriş Başarılı)
     */
    showApp() {
        const overlay = document.getElementById('login-overlay');
        overlay.classList.add('overlay-exit');

        // Update global bar for active session
        const statusMode = document.getElementById('osSystemMode');
        if (statusMode) statusMode.textContent = "System Online";

        setTimeout(() => {
            overlay.style.display = 'none';
            document.getElementById('app').classList.add('visible');
        }, 1000);

        // Storage Defaults (artık user prefix ile çalışacak)
        Storage.initializeDefaults();

        // Save last user to settings (optional, for auto-fill maybe?)
        // Storage.save(Storage.KEYS.SETTINGS, { ...Storage.load(Storage.KEYS.SETTINGS), userName: this.userName });

        this.loadTheme();

        // Initialize all modules (wrapped individually to prevent cascade failures)
        const modules = [
            ['Notifications', () => Notifications.init()],
            ['Lessons', () => Lessons.init()],
            ['Books', () => Books.init()],
            ['Sites', () => Sites.init()],
            ['Games', () => Games.init()],
            ['YouTube', () => YouTube.init()],
            ['Planning', () => Planning.init()],
            ['Profile', () => Profile.init()],
            ['HabitTracker', () => HabitTracker.init()],
            ['Exams', () => Exams.init()],
            ['Schedule', () => Schedule.init()],
            ['Shows', () => Shows.init()],
            ['Pomodoro', () => Pomodoro.init()],
            ['WeeklyPlanner', () => WeeklyPlanner.init()],
            ['Notes', () => Notes.init()],
            ['Dashboard', () => Dashboard.init()],
        ];

        modules.forEach(([name, initFn]) => {
            try { initFn(); } catch (e) { console.error(`[LifeOS] ${name}.init() failed:`, e); }
        });

        // Optional Drive Sync
        try { if (window.DriveSync) DriveSync.init(); } catch (e) { console.error('[LifeOS] DriveSync.init() failed:', e); }

        this.bindEvents();
        this.updateUserInfo();
        this.showWelcomeNotification();
        this.updateWelcomeDate();
        this.startGlobalTimer();

        // Initialize Mobile Filter FAB
        if (typeof MobileFilterFab !== 'undefined') {
            MobileFilterFab.init();
            MobileFilterFab.updateVisibility();
        }

        console.log('🎯 Life OS v2.5 başlatıldı!');
    },

    /**
     * Küresel zamanlayıcı - Gün değişimini takip eder
     */
    lastCheckDate: null,
    startGlobalTimer() {
        this.lastCheckDate = this.getLocalDateString();

        setInterval(() => {
            const today = this.getLocalDateString();
            if (this.lastCheckDate !== today) {
                console.log('📅 Gün değişimi algılandı: ' + today);
                this.lastCheckDate = today;

                // Günü etkileyen modülleri yenile
                this.updateWelcomeDate();
                if (typeof Dashboard !== 'undefined') Dashboard.render();
                if (typeof HabitTracker !== 'undefined') {
                    HabitTracker.render();
                    if (HabitTracker.checkDailyReminders) HabitTracker.checkDailyReminders();
                }
                if (typeof Planning !== 'undefined') Planning.updateTodayTasks();
                if (typeof Schedule !== 'undefined') Schedule.render();
                if (typeof WeeklyPlanner !== 'undefined') WeeklyPlanner.render();
            }
        }, 60000); // Her dakika kontrol et
    },

    updateWelcomeDate() {
        const profile = Storage.load('lifeos_profile', {});

        // Custom Date or Auto Date
        let dateStr;
        if (profile.customDate) {
            dateStr = profile.customDate;
        } else {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateStr = now.toLocaleDateString('tr-TR', options);
        }

        const dateEl = document.getElementById('welcomeDate');
        if (dateEl) dateEl.textContent = dateStr;

        // Settings Preview
        const previewDate = document.querySelector('#settingsBannerPreview .welcome-date');
        if (previewDate) previewDate.textContent = dateStr;
    },

    getLocalDateString(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },


    /**
     * Kullanıcı Bilgilerini Güncelle (Global)
     * Profile.js tarafından çağrılır
     */
    updateUserInfo() {
        this.renderDashboard();
    },

    updateUserDisplay() {
        this.renderDashboard();
    },

    setTheme(theme) {
        const settings = Storage.load(Storage.KEYS.SETTINGS, {});
        settings.theme = theme;
        Storage.save(Storage.KEYS.SETTINGS, settings);
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcon(theme);
    },

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(item.dataset.page);
            });
        });

        // Quick actions on dashboard - new style
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Panel links
        document.querySelectorAll('.panel-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(link.dataset.page);
            });
        });

        // Old style quick actions (keep for compatibility)
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                if (page) {
                    this.navigateTo(page);
                    setTimeout(() => {
                        const addBtns = {
                            lessons: 'addLessonBtn',
                            books: 'addBookBtn',
                            games: 'addGameBtn',
                            planning: 'addTaskBtn'
                        };
                        document.getElementById(addBtns[page])?.click();
                    }, 100);
                }
            });
        });

        // Card links
        document.querySelectorAll('.card-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(link.dataset.page);
            });
        });

        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Logout: handled by inline onclick="Auth.logout()" in HTML

        // Export button
        document.getElementById('exportBtn')?.addEventListener('click', () => {
            this.exportData();
        });

        // Mobile menu
        document.getElementById('menuToggle')?.addEventListener('click', () => {
            document.getElementById('sidebar')?.classList.toggle('open');
            document.getElementById('sidebarOverlay')?.classList.toggle('active');
        });

        // Sidebar overlay click
        document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
            document.getElementById('sidebar')?.classList.remove('open');
            document.getElementById('sidebarOverlay')?.classList.remove('active');
        });

        // Modal
        document.getElementById('closeModal')?.addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'modalOverlay') {
                this.closeModal();
            }
        });

        // Notifications button - use dropdown on mobile, panel on desktop
        const notifBtn = document.getElementById('notificationBtn');
        if (notifBtn) {
            notifBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isMobile = window.innerWidth <= 991;
                if (isMobile) {
                    const dropdown = document.getElementById('notificationDropdown');
                    if (dropdown) {
                        dropdown.classList.toggle('active');
                        if (dropdown.classList.contains('active')) {
                            Notifications.renderDropdown();
                        }
                    }
                } else {
                    Notifications.togglePanel();
                }
            });
        }

        document.getElementById('closeNotifications')?.addEventListener('click', () => {
            Notifications.closePanel();
        });

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                Notifications.closePanel();
                document.getElementById('notificationDropdown')?.classList.remove('active');
            }
        });

        // Close dropdowns & sidebar on outside click
        document.addEventListener('click', (e) => {
            // Sidebar close (mobile)
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.getElementById('menuToggle');
            const overlay = document.getElementById('sidebarOverlay');
            if (window.innerWidth <= 1024 && sidebar?.classList.contains('open') &&
                !sidebar.contains(e.target) && !menuToggle?.contains(e.target) && !overlay?.contains(e.target)) {
                sidebar.classList.remove('open');
                overlay?.classList.remove('active');
            }

            // Notification dropdown close on outside click
            const notifDropdown = document.getElementById('notificationDropdown');
            const notifBtnEl = document.getElementById('notificationBtn');
            if (notifDropdown?.classList.contains('active') &&
                !notifDropdown.contains(e.target) && !notifBtnEl?.contains(e.target)) {
                notifDropdown.classList.remove('active');
            }
        });

        // Profile Dropdown Toggle
        const profileTrigger = document.getElementById('headerProfileTrigger');
        const profileDropdown = document.getElementById('profileDropdown');

        if (profileTrigger) {
            profileTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                profileTrigger.classList.toggle('active');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (profileTrigger && !profileTrigger.contains(e.target)) {
                profileTrigger.classList.remove('active');
            }
        });

        // Initialize user info in dropdown
        this.updateDropdownInfo();

    },

    handleQuickAction(action) {
        const actionMap = {
            addSeries: {
                page: 'shows',
                handler: () => {
                    if (typeof Shows !== 'undefined') {
                        Shows.showAddModal();
                        setTimeout(() => {
                            const typeSelect = document.querySelector('#showForm select[name="type"]');
                            if (typeSelect) {
                                typeSelect.value = 'dizi';
                                // Trigger change to update UI if needed
                                typeSelect.dispatchEvent(new Event('change'));
                            }
                        }, 50);
                    }
                }
            },
            addMovie: {
                page: 'shows',
                handler: () => {
                    if (typeof Shows !== 'undefined') {
                        Shows.showAddModal();
                        setTimeout(() => {
                            const typeSelect = document.querySelector('#showForm select[name="type"]');
                            if (typeSelect) {
                                typeSelect.value = 'film';
                                typeSelect.dispatchEvent(new Event('change'));
                            }
                        }, 50);
                    }
                }
            },
            addTask: {
                page: 'planning',
                handler: () => {
                    if (typeof Planning !== 'undefined') Planning.showAddModal();
                }
            },
            addGame: {
                page: 'games',
                handler: () => {
                    if (typeof Games !== 'undefined') Games.showAddModal();
                }
            },
            addSite: {
                page: 'sites',
                handler: () => {
                    if (typeof Sites !== 'undefined') Sites.showAddModal();
                }
            },
            addChannel: {
                page: 'youtube',
                handler: () => {
                    if (typeof YouTube !== 'undefined') YouTube.showAddModal();
                }
            }
        };

        const config = actionMap[action];
        if (config) {
            if (config.handler) {
                config.handler();
            }
        }
    },

    navigateTo(page) {
        // Guard: check unsaved changes when leaving profile/settings
        if (this.currentPage === 'profile' && page !== 'profile') {
            const canLeave = Profile.confirmLeave(() => {
                this._doNavigate(page);
            });
            if (!canLeave) return; // Waiting for user confirmation
        }
        this._doNavigate(page);
    },

    _doNavigate(page) {
        this.currentPage = page;

        // Update nav
        document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Show page
        document.querySelectorAll('.page').forEach(p => {
            p.classList.toggle('active', p.id === `page-${page}`);
        });

        const titles = {
            dashboard: 'Kontrol Merkezi',
            lessons: 'Dersler',
            books: 'Kitaplar',
            sites: 'Siteler',
            games: 'Oyunlar',
            youtube: 'YouTube',
            planning: 'Görevler',
            profile: 'Ayarlar',
            habits: 'Zinciri Kırma',
            exams: 'Sınavlar',
            shows: 'Dizi / Film',
            schedule: 'Ders Programı',
            pomodoro: 'Pomodoro',
            'weekly-planner': 'Haftalık Program',
            notes: 'Not Defteri'
        };

        const title = titles[page] || 'Dashboard';
        document.getElementById('pageTitle').textContent = title;
        document.title = `${title} - LifeOS`;

        // Close sidebar on mobile
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay')?.classList.remove('active');

        // Scroll to top on page change (native app behavior)
        document.querySelector('.main-content')?.scrollTo(0, 0);

        // Refresh page
        this.refreshPage(page);

        // Update mobile filter FAB visibility
        if (typeof MobileFilterFab !== 'undefined') {
            MobileFilterFab.updateVisibility();
        }
    },

    refreshPage(page) {
        switch (page) {
            case 'dashboard': this.renderDashboard(); break;
            case 'lessons': Lessons.render(); break;
            case 'books': Books.render(); break;
            case 'sites': Sites.render(); break;
            case 'games': Games.render(); break;
            case 'youtube': YouTube.render(); break;
            case 'planning': Planning.render(); break;
            case 'habits': HabitTracker.render(); break;
            case 'exams': Exams.render(); break;
            case 'shows': Shows.render(); break;
            case 'schedule': Schedule.render(); break;
            case 'pomodoro': Pomodoro.render(); break;
            case 'weekly-planner': WeeklyPlanner.render(); break;
            case 'notes': Notes.render(); break;
            case 'profile': Profile.render(); break;
        }
    },

    loadTheme() {
        const settings = Storage.load(Storage.KEYS.SETTINGS, {});
        const theme = settings.theme || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcon(theme);
    },

    toggleTheme() {
        const settings = Storage.load(Storage.KEYS.SETTINGS, {});
        const currentTheme = settings.theme || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        settings.theme = newTheme;
        Storage.save(Storage.KEYS.SETTINGS, settings);

        document.documentElement.setAttribute('data-theme', newTheme);
        if (typeof this.updateThemeIcon === 'function') {
            this.updateThemeIcon(newTheme);
        }

        Notifications.showToast(
            'Tema Değiştirildi',
            newTheme === 'dark' ? 'Karanlık mod aktif' : 'Aydınlık mod aktif',
            'info'
        );
    },

    /**
     * Dashboard Sayfasını Render Et
     */
    renderDashboard() {
        const currentUser = Auth.getCurrentUser();
        // Fallback if no user is logged in (shouldn't happen on dashboard)
        if (!currentUser && !Auth.userExists('admin')) return;

        // Load specific profile data (user-specific via Storage prefix)
        const profileData = Storage.load('lifeos_profile', null);

        // Name priority: Profile name > Auth username > 'Kullanıcı'
        let displayName = (currentUser && currentUser.username) || 'Kullanıcı';
        let headerTitle = 'LifeOS Üyesi';
        let bannerSubtitle = 'LifeOS Üyesi';

        // Override with Profile Data if available (user-specific)
        if (profileData) {
            if (profileData.name && profileData.name.trim() !== '') displayName = profileData.name;

            // 1. Title Selection (Full Title > Fallback)
            const displayTitle = (profileData.title && profileData.title.trim() !== '')
                ? profileData.title
                : 'LifeOS Üyesi';

            // 2. Header Title Logic (Priority: Title)
            headerTitle = displayTitle;

            // 3. Banner Subtitle Logic (Title + Education)
            const bannerParts = [displayTitle];
            if (profileData.university) bannerParts.push(profileData.university);
            if (profileData.department) bannerParts.push(profileData.department);
            if (profileData.year) bannerParts.push(profileData.year);

            bannerSubtitle = bannerParts.join('<br>');
        }

        // Update Dashboard Profile (Large Card) -> Banner
        const profileName = document.getElementById('dashboardProfileName');
        const profileTitle = document.getElementById('dashboardProfileTitle');

        if (profileName) profileName.textContent = displayName;
        if (profileTitle) profileTitle.innerHTML = bannerSubtitle;

        // Update Header Profile (Small)
        const headerName = document.getElementById('headerProfileName');
        const headerTitleEl = document.getElementById('headerProfileTitle');
        const headerInitial = document.getElementById('userInitial');
        if (headerName) headerName.textContent = displayName;
        if (headerTitleEl) headerTitleEl.textContent = headerTitle;

        // Greeting
        const hour = new Date().getHours();
        let greeting = 'Merhaba!';
        if (hour >= 5 && hour < 12) greeting = 'Günaydın!';
        else if (hour >= 12 && hour < 18) greeting = 'Tünaydın!';
        else if (hour >= 18 && hour < 22) greeting = 'İyi Akşamlar!';
        else greeting = 'İyi Geceler!';

        const welcomeText = document.getElementById('welcomeText');
        if (welcomeText) welcomeText.textContent = `${greeting} ${displayName}`;
        const initial = displayName.charAt(0).toUpperCase();
        const initialIds = ['bannerInitial', 'settingsBannerInitial', 'userInitial'];
        initialIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = initial;
        });

        // Date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const welcomeDate = document.getElementById('welcomeDate');
        if (welcomeDate) welcomeDate.textContent = new Date().toLocaleDateString('tr-TR', options);

        // Render Full Dashboard
        if (typeof Dashboard !== 'undefined' && Dashboard.render) {
            Dashboard.render();
        }
    },

    updateDropdownInfo() {
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) return;

        const nameEl = document.getElementById('dropdownUserName');
        const emailEl = document.getElementById('dropdownUserEmail'); // Actually 'Subtitle' now

        // 1. Get Display Name (Profile Name > Username)
        const profileData = Storage.load('lifeos_profile', {});
        const displayName = (profileData.name && profileData.name.trim() !== '') ? profileData.name : currentUser.username;

        // 2. Get Subtitle (Title > Department > University > Username)

        let subtitle = '@' + currentUser.username;

        if (profileData.title && profileData.title.trim() !== '') {
            subtitle = profileData.title;
        } else if (profileData.department && profileData.department.trim() !== '') {
            subtitle = profileData.department;
        } else if (profileData.university && profileData.university.trim() !== '') {
            subtitle = profileData.university;
        }

        if (nameEl) nameEl.textContent = displayName;

        if (emailEl) {
            emailEl.textContent = subtitle;
            emailEl.style.opacity = '0.8';
            emailEl.style.fontSize = '12px';
            emailEl.style.fontWeight = '400';
        }
    },

    updateThemeIcon(theme) {
        const icon = document.querySelector('.theme-icon');
        if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    },

    openModal() {
        document.getElementById('modalOverlay').classList.add('open');
    },

    closeModal() {
        document.getElementById('modalOverlay').classList.remove('open');
        // Reset modal width
        document.getElementById('modal').classList.remove('modal-wide');
    },

    showWelcomeNotification() {
        const settings = Storage.load(Storage.KEYS.SETTINGS, {});
        const today = new Date().toDateString();

        if (settings.lastVisit !== today) {
            const hour = new Date().getHours();
            let greeting;

            if (hour >= 5 && hour < 12) {
                greeting = 'Günaydın! Harika bir gün olsun.';
            } else if (hour >= 12 && hour < 18) {
                greeting = 'İyi günler! Verimli bir öğleden sonra dileriz.';
            } else if (hour >= 18 && hour < 22) {
                greeting = 'İyi akşamlar! Günü değerlendirme zamanı.';
            } else {
                greeting = 'İyi geceler! Yarın için planlarınızı gözden geçirin.';
            }

            Notifications.add(`Hoşgeldin, ${this.userName}! 🎯`, greeting, 'info', true);

            settings.lastVisit = today;
            Storage.save(Storage.KEYS.SETTINGS, settings);
        }
    },

    async exportData() {
        Notifications.showToast('Yedek Hazırlanıyor', 'Büyük dosyalar işleniyor, lütfen bekleyin...', 'info');
        const data = await Storage.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lifeos-backup-${this.getLocalDateString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        Notifications.add(
            'Veri Dışa Aktarıldı 💾',
            'Yedek dosyası indirildi. Google Drive\'a yükleyebilirsiniz.',
            'success',
            true
        );
    },

    /**
     * Özel Onay Penceresi Köprüsü
     */
    confirm(title, message, onConfirm, confirmText) {
        if (typeof Notifications !== 'undefined' && Notifications.confirm) {
            Notifications.confirm(title, message, onConfirm, confirmText);
        } else {
            if (window.confirm(message)) {
                if (onConfirm) onConfirm();
            }
        }
    },

    /**
     * Çıkış yap - oturumu kapat
     */
    logout() {
        this.confirm('Çıkış Yap', 'Çıkış yapmak istediğinizden emin misiniz?', () => {
            // Kullanıcı adını temizle (veriler korunur)
            const settings = Storage.load(Storage.KEYS.SETTINGS, {});
            delete settings.userName;
            Storage.save(Storage.KEYS.SETTINGS, settings);

            // UI'ı gizle ve login'e dön
            document.getElementById('app').classList.remove('visible');
            this.renderLoginUI();

            Notifications.showToast('Çıkış Yapıldı', 'Oturum kapatıldı.', 'info');
        }, 'Evet, Çıkış Yap');
    }
};

// Start app
document.addEventListener('DOMContentLoaded', () => {
    App.init();

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('Service Worker Registered 📡', reg.scope))
            .catch(err => console.log('Service Worker Fail ❌', err));
    }

    // PWA Install Prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        // Optional: show a banner or button to install
        console.log('PWA Install Prompt available 📦');
    });

    // Handle background sync or other PWA features if needed
});
