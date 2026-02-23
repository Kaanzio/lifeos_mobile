/**
 * Life OS - Dashboard Module v2.3
 * Ana panel istatistikleri ve özet görünümü - Canlı geri sayım güncellemesi
 */

const Dashboard = {
    timerInterval: null,
    quickSitesEditMode: false,
    selectedHabitChainId: null,

    // Site Icons moved to dynamic favicon fetching
    siteIcons: [],

    init() {
        this.loadQuickSites();
        this.loadHabitSettings();
        this.initBannerVisibility();
        this.render();
        this.renderQuickSites();
    },

    initBannerVisibility() {
        const settings = Storage.load('lifeos_settings', {});
        const showBanner = settings.layout?.showBanner !== false; // Default true
        const banner = document.getElementById('dashboardBanner');
        if (banner) {
            banner.style.display = showBanner ? 'block' : 'none';
        }
    },

    render() {
        this.updateStats();
        this.updateDate();
        this.updateTodayTasks();
        this.updateHabitChain();
        this.updateUpcoming();
    },

    // ... (quotes array skipped)


    // Quick Sites - Moved to bottom




    loadHabitSettings() {
        this.selectedHabitChainId = Storage.load('lifeos_dashboard_selected_chain', null);
    },

    saveHabitSettings() {
        Storage.save('lifeos_dashboard_selected_chain', this.selectedHabitChainId);
    },

    updateDate() {
        const dateEl = document.getElementById('bannerDate');
        if (!dateEl) return;

        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('tr-TR', options);
    },

    updateHabitChain() {
        const container = document.getElementById('dashboardHabitChain');
        const selectorContainer = document.getElementById('dashboardHabitSelector');
        if (!container) return;

        // Hide selector since we show top 3
        if (selectorContainer) selectorContainer.innerHTML = '';

        if (typeof HabitTracker !== 'undefined' && HabitTracker.chains?.length > 0) {
            // Sort by streak (descending)
            const topChains = [...HabitTracker.chains]
                .sort((a, b) => HabitTracker.calculateStreak(b) - HabitTracker.calculateStreak(a))
                .slice(0, 3);

            // Image match: Show numbered boxes for last 14 days
            const last14Days = [];
            for (let i = 13; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                last14Days.push({
                    dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
                    dayNum: d.getDate()
                });
            }

            container.innerHTML = `
                <div class="habit-top-list">
                    ${topChains.map(chain => {
                const streak = HabitTracker.calculateStreak(chain);
                const last30 = (HabitTracker.getLast30Days ? HabitTracker.getLast30Days() : HabitTracker.getLastNDays(30));
                const completedInLast30 = last30.filter(d => chain.completedDays.includes(d.dateStr)).length;
                const rate = Math.round((completedInLast30 / 30) * 100);

                return `
                        <div class="habit-dashboard-item">
                            <div class="habit-icon-mini" style="background: ${chain.color}15; color: ${chain.color};">
                                ${chain.emoji.startsWith('<') ? chain.emoji : `<span>${chain.emoji}</span>`}
                            </div>
                            <div class="habit-details">
                                <div class="habit-name ellipsis-text">${chain.name}</div>
                                <div class="habit-stats">
                                    <span class="active-streak" style="color: ${chain.color};">🔥 ${streak} Gün</span>
                                    <span class="stat-separator">|</span>
                                    <span>%${rate} Ort.</span>
                                </div>
                            </div>
                            <div class="dashboard-habit-mini-grid">
                                ${last14Days.map(d => {
                    const isCompleted = chain.completedDays.includes(d.dateStr);
                    return `
                                    <div title="${d.dateStr}"
                                         onclick="HabitTracker.toggleDay('${chain.id}', '${d.dateStr}'); Dashboard.updateHabitChain();"
                                         class="habit-day-box ${isCompleted ? 'completed' : ''}"
                                         style="--day-color: ${chain.color}">
                                         ${d.dayNum}
                                    </div>
                                    `;
                }).join('')}
                            </div>
                        </div>
                        `;
            }).join('')}
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Henüz alışkanlık zinciri yok</p>
                    <button class="btn btn-primary" style="margin-top: 12px;" onclick="App.navigateTo('habits')">Zincir Oluştur</button>
                </div>
            `;
        }
    },

    changeHabitChain(chainId) {
        this.selectedHabitChainId = chainId;
        this.saveHabitSettings();
        this.updateHabitChain();
    },

    calculateStreak() {
        // Obsolete login streak calculation removed as per user request
        return 0;
    },

    selectedTaskIds: new Set(),

    toggleDropdown(menuId, btnId) {
        const menu = document.getElementById(menuId);
        const btn = document.getElementById(btnId);

        // Close other dropdowns
        document.querySelectorAll('.task-dropdown-menu.active').forEach(el => {
            if (el.id !== menuId) {
                el.classList.remove('active');

                // Find corresponding button to deactivate
                // We need to match the button that controls this specific menu
                // Since we can't easily reference back, we'll brute force clear active buttons
                // except the one we are about to toggle (if it's the same)
            }
        });

        // Remove active class from all dropdown buttons to be safe, except current one
        document.querySelectorAll('.task-dropdown-btn.active').forEach(b => {
            if (b.id !== btnId) b.classList.remove('active');
        });

        if (menu) {
            menu.classList.toggle('active');
            btn?.classList.toggle('active');
        }
    },

    toggleTaskSelection(taskId) {
        // Ensure ID is string for consistency
        const idStr = String(taskId);
        if (this.selectedTaskIds.has(idStr)) {
            this.selectedTaskIds.delete(idStr);
        } else {
            this.selectedTaskIds.add(idStr);
        }
        this.updateTodayTasks();
    },

    async completeSelectedTasks() {
        if (this.selectedTaskIds.size === 0) return;

        const tasks = Planning.tasks || [];
        Planning.tasks = tasks.map(t => {
            if (this.selectedTaskIds.has(String(t.id))) {
                return { ...t, status: 'done', completedDate: new Date().toISOString() };
            }
            return t;
        });

        Planning.saveTasks();
        this.selectedTaskIds.clear();
        Dashboard.updateTodayTasks();
    },

    deleteSelectedTasks() {
        if (this.selectedTaskIds.size === 0) return;

        Notifications.confirm('Seçili Görevleri Sil', 'Seçilen görevleri silmek istediğinize emin misiniz?', () => {
            Planning.tasks = Planning.tasks.filter(t => !this.selectedTaskIds.has(String(t.id)));
            Planning.saveTasks();
            this.selectedTaskIds.clear();
            Dashboard.updateTodayTasks();
        }, 'Evet, Sil');
    },

    async postponeSelectedTasks() {
        if (this.selectedTaskIds.size === 0) return;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

        Planning.tasks = Planning.tasks.map(t => {
            if (this.selectedTaskIds.has(String(t.id))) {
                return { ...t, dueDate: tomorrowStr };
            }
            return t;
        });

        Planning.saveTasks();
        this.selectedTaskIds.clear();
        Dashboard.updateTodayTasks();
    },

    updateTodayTasks() {
        const container = document.getElementById('todayTasks');
        if (!container) return;

        const now = new Date();
        const todayStr = App.getLocalDateString();

        const priorityWeight = { high: 3, medium: 2, low: 1 };

        const tasks = (Planning?.tasks || []).filter(t => {
            if (!t.dueDate) return false;
            // Sadece bugünün görevleri (Tamamlanmamış)
            return t.dueDate === todayStr && t.status !== 'done';
        }).sort((a, b) => {
            // Önce tarihe göre (eskiler en üstte)
            if (a.dueDate !== b.dueDate) {
                return a.dueDate.localeCompare(b.dueDate);
            }
            // Sonra önceliğe göre (Yüksek -> Düşük)
            return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        });

        if (tasks.length === 0) {
            container.innerHTML = '<p class="empty-state">Bugün için görev yok 🎉</p>';
            return;
        }

        container.innerHTML = tasks.slice(0, 8).map(task => {
            const priorityData = Planning.getPriorityData(task.priority);

            return `
                <div class="task-item-dashboard">
                    <label class="task-checkbox-container">
                        <input type="checkbox" 
                               onchange="Planning.changeStatus('${task.id}', 'done')">
                         <span class="task-checkmark"></span>
                    </label>
                    <span class="task-title ellipsis-text">${task.title}</span>
                    <div class="task-priority-indicator" style="color: ${priorityData.color}; flex-shrink: 0; display: flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 5px; background: ${priorityData.color}15; margin-left: auto; margin-right: 8px; font-size: 8px; font-weight: 800;" title="${priorityData.text} Öncelik">
                        ${priorityData.icon}
                        <span>${priorityData.text}</span>
                    </div>
                    <button class="task-dropdown-btn" onclick="event.stopPropagation(); Planning.showTaskDetails('${task.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                </div>
            `;
        }).join('');
    },

    getStatusLabel(status) {
        const labels = { todo: 'Aktif', inProgress: 'Devam', done: 'Tamamlandı' };
        return labels[status] || status;
    },



    updateUpcoming() {
        const container = document.getElementById('upcomingItems');
        if (!container) return;

        // Clear existing interval
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // Get upcoming tasks (next 7 days)
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const upcomingTasks = (Planning?.tasks || [])
            .filter(t => {
                if (!t.dueDate) return false;
                // Only include tasks that have a specific time set
                // Include today's tasks
                return t.dueDate >= todayStr && t.dueDate <= nextWeek.toISOString().split('T')[0] && t.status !== 'done';
            })
            .map(t => {
                let date;
                if (t.dueTime) {
                    date = new Date(`${t.dueDate}T${t.dueTime}`);
                } else {
                    // Task due date is end of that day if no time specified
                    date = new Date(t.dueDate);
                    date.setHours(23, 59, 59, 999);
                }

                return {
                    type: 'task',
                    icon: '📋',
                    title: t.title,
                    date: date,
                    priority: t.priority
                };
            })
            .filter(t => t.date >= now);

        // Get upcoming exams (next 14 days)
        const twoWeeks = new Date(now);
        twoWeeks.setDate(twoWeeks.getDate() + 14);

        const upcomingExams = (Exams?.exams || [])
            .map(e => {
                // Exam has specific date and time
                const date = new Date(`${e.date}T${e.time}`);
                // Build title from exam name and lesson name
                const examTitle = e.lessonName
                    ? `${e.lessonName} - ${e.name}`
                    : e.name;
                return {
                    type: 'exam',
                    icon: '📝',
                    title: examTitle,
                    date: date,
                    lessonId: e.lessonId,
                    rawDate: e.date // Keep raw date for filtering
                };
            })
            .filter(e => {
                const examDate = new Date(e.rawDate);
                const endDate = new Date(twoWeeks);
                // Basic date range check works better with raw date for day comparison or just timestamp
                return e.date >= now && e.date <= endDate;
            });

        // Combine and sort
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const allUpcoming = [...upcomingTasks, ...upcomingExams]
            .sort((a, b) => {
                // Önce tarihe göre
                if (a.date.getTime() !== b.date.getTime()) {
                    return a.date - b.date;
                }
                // Aynı zaman dilimindeyse (veya saat yoksa) önceliğe göre
                const weightA = a.type === 'task' ? (priorityWeight[a.priority] || 0) : 4; // Exam > Task same time
                const weightB = b.type === 'task' ? (priorityWeight[b.priority] || 0) : 4;
                return weightB - weightA;
            })
            .slice(0, 4); // Limit to max 4 items as per user request

        if (allUpcoming.length === 0) {
            container.innerHTML = '<p class="empty-state">Yaklaşan etkinlik yok</p>';
            return;
        }

        // Render initial HTML - Horizontal Cards Match
        container.innerHTML = `
            <div class="upcoming-items">
                ${allUpcoming.map((item, index) => {
            return `
                        <div id="upcoming-item-${index}" class="upcoming-item-box">
                            <span class="upcoming-title">${item.title}</span>
                            <span id="dashboard-countdown-${index}" class="upcoming-countdown-value">--:--:--</span>
                        </div>
                    `;
        }).join('')}
            </div>
        `;

        // Update function
        const updateCountdowns = () => {
            allUpcoming.forEach((item, index) => {
                const time = this.getCountdown(item.date, item.type);
                const countEl = document.getElementById(`dashboard-countdown-${index}`);

                if (countEl) {
                    countEl.textContent = time.display;
                    // Urgent if less than 24h
                    countEl.style.color = time.urgent ? 'var(--danger)' : 'var(--primary)';
                }
            });
        };

        // Run immediately and then interval
        updateCountdowns();
        this.timerInterval = setInterval(updateCountdowns, 1000);
    },

    getCountdown(targetDate, type) {
        const now = new Date();
        const diff = targetDate - now;

        // If passed
        if (diff < 0) {
            return { display: 'Geçti', label: '', urgent: false };
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days === 0) {
            // Less than 24h: Urgent and show HH:MM:SS
            return {
                display: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
                label: 'kaldı',
                urgent: true
            };
        } else {
            // More than 24h: Not urgent
            return {
                display: `${days}g ${hours}sa ${minutes}dk`,
                label: 'kaldı',
                urgent: false
            };
        }
    },

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        return date.toLocaleDateString('tr-TR', options);
    },

    formatTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Şimdi';
        if (minutes < 60) return `${minutes} dk önce`;
        if (hours < 24) return `${hours} saat önce`;
        if (days < 7) return `${days} gün önce`;
        return date.toLocaleDateString('tr-TR');
    },



    // Record a completion for today
    recordCompletion() {
        const weeklyProgress = Storage.load('lifeos_weekly_progress', {});
        const dateStr = App.getLocalDateString();

        if (!weeklyProgress[dateStr]) {
            weeklyProgress[dateStr] = { completed: 0 };
        }
        weeklyProgress[dateStr].completed++;

        Storage.save('lifeos_weekly_progress', weeklyProgress);
    },

    // Quick Sites Management
    quickSites: [],

    loadQuickSites() {
        this.quickSites = Storage.load('lifeos_quick_sites', [
            { id: 1, name: 'Google', url: 'https://google.com', icon: '' },
            { id: 2, name: 'YouTube', url: 'https://youtube.com', icon: '' },
            { id: 3, name: 'GitHub', url: 'https://github.com', icon: '' },
            { id: 4, name: 'ChatGPT', url: 'https://chat.openai.com', icon: '' }
        ]);

        // Clean up any old "Site Ekle" placeholders if they exist in storage
        this.quickSites = this.quickSites.filter(s => s.name !== 'Site Ekle');
    },

    saveQuickSites() {
        Storage.save('lifeos_quick_sites', this.quickSites);
    },

    renderQuickSites() {
        const grid = document.getElementById('quickSitesGrid');
        const container = document.querySelector('.dashboard-quick-sites');
        if (!grid) return;

        // Toggle edit mode class on container
        if (container) {
            if (this.quickSitesEditMode) {
                container.classList.add('edit-mode');
            } else {
                container.classList.remove('edit-mode');
            }
        }

        let html = '';

        if (this.quickSites.length === 0 && !this.quickSitesEditMode) {
            html = '<p class="empty-state" style="width: 100%; text-align: center; font-size: 13px;">Henüz uygulama eklenmedi</p>';
        } else {
            // Render sites
            html = this.quickSites.map((site, index) => {
                const actionOnClick = this.quickSitesEditMode
                    ? `event.preventDefault(); Dashboard.showQuickSiteModal(${index})`
                    : '';
                const href = this.quickSitesEditMode ? '#' : site.url;

                let domain = '';
                try {
                    domain = new URL(site.url).hostname;
                } catch {
                    domain = '';
                }

                const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                const effectiveIcon = site.icon || faviconUrl;

                // Fallback SVG if image fails
                const fallbackSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';

                return `
                    <a href="${href}" target="_blank" class="quick-site-btn" title="${site.name}" onclick="${actionOnClick}">
                        <div class="quick-site-icon">
                            <img src="${effectiveIcon}" alt="${site.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                            <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; color:var(--text-muted);">${fallbackSvg}</div>
                        </div>
                        <span class="quick-site-name">${site.name}</span>
                        ${this.quickSitesEditMode ? `
                            <button class="quick-site-delete-badge" onclick="event.stopPropagation(); event.preventDefault(); Dashboard.deleteQuickSite(${index})">×</button>
                        ` : ''
                    }
                    </a>
                `;
            }).join('');
        }

        // Add "Add New" button if in edit mode and limit not reached
        if (this.quickSitesEditMode && this.quickSites.length < 9) {
            html += `
                <button class="quick-site-btn add-new" onclick="Dashboard.showQuickSiteModal(-1)" title="Yeni Ekle">
                    <span class="quick-site-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>
                        </svg>
                    </span>
                    <span class="quick-site-name">Ekle</span>
                </button>
            `;
        }

        grid.innerHTML = html;
    },

    toggleQuickSitesEdit() {
        this.quickSitesEditMode = !this.quickSitesEditMode;
        this.renderQuickSites();

        // Update manage button State
        // Update manage button State
        const btn = document.getElementById('quickSitesBtn');
        if (btn) {
            if (this.quickSitesEditMode) {
                // Show Checkmark (Done)
                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--success);"><polyline points="20 6 9 17 4 12"/></svg>`;
                btn.title = 'Tamamla';
            } else {
                // Show 3-dots (Edit)
                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>`;
                btn.title = 'Düzenle';
            }
            btn.classList.toggle('active', this.quickSitesEditMode);
        }
    },

    showQuickSiteModal(index) {
        const isNew = index === -1;
        const site = isNew
            ? { id: Date.now(), name: '', url: '', icon: '' }
            : this.quickSites[index];

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');

        modalTitle.textContent = isNew ? 'Yeni Uygulama Ekle' : 'Uygulamayı Düzenle';
        modalBody.innerHTML = `
            <form id="quickSiteForm">
                <div class="form-group">
                    <label class="form-label">🏷️ Uygulama Adı</label>
                    <input type="text" class="form-input" name="name" required
                           placeholder="Google, YouTube, vb."
                           value="${isNew ? '' : site.name}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">🔗 URL / Bağlantı</label>
                    <input type="url" class="form-input" name="url" required
                           placeholder="https://..."
                           value="${isNew ? '' : site.url}">
                </div>

                <div class="form-group">
                    <label class="form-label">🎨 İkon URL (Opsiyonel)</label>
                    <input type="url" class="form-input" name="icon" 
                           placeholder="https://example.com/icon.png"
                           value="${site.icon}">
                    <small style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 4px;">Boş bırakırsanız favicon otomatik çekilir.</small>
                </div>

                <div class="modal-footer" style="padding: 0; border: none; margin-top: 24px;">
                    ${!isNew ? `<button type="button" class="btn btn-danger" onclick="Dashboard.deleteQuickSite(${index})">Sil</button>` : ''}
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()">İptal</button>
                    <button type="submit" class="btn btn-primary">Kaydet</button>
                </div>
            </form>
        `;

        App.openModal();

        document.getElementById('quickSiteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            const newSiteData = {
                id: site.id || Date.now(),
                name: formData.get('name'),
                url: formData.get('url'),
                icon: formData.get('icon') || ''
            };

            if (isNew) {
                if (this.quickSites.length >= 9) {
                    Notifications.add('Limit Ulaşıldı', 'En fazla 9 site ekleyebilirsiniz.', 'warning');
                    App.closeModal();
                    return;
                }
                this.quickSites.push(newSiteData);
            } else {
                this.quickSites[index] = newSiteData;
            }

            this.saveQuickSites();
            this.renderQuickSites();
            App.closeModal();
            Notifications.add('Uygulama Kaydedildi', `"${formData.get('name')}" ${isNew ? 'eklendi' : 'güncellendi'}.`, 'success', true);
        });
    },

    updateStats() {
        // 1. Tasks Stat & Trend
        if (typeof Planning !== 'undefined' && Planning.tasks) {
            const todayStr = App.getLocalDateString();
            const activeTasks = Planning.tasks.filter(t => t.status !== 'done' && t.dueDate >= todayStr);
            this.setEl('activeTaskCount', activeTasks.length);

            // Task Trend: Active tasks created in last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const newTasksCount = activeTasks.filter(t => {
                const created = new Date(t.createdAt || t.date || new Date()); // Fallback
                return created >= sevenDaysAgo;
            }).length;

            this.updateTrend('taskTrend', newTasksCount, 'Yeni');
        }

        // 2. Books Stat
        if (typeof Books !== 'undefined' && Books.books) {
            this.setEl('totalBooks', Books.books.length);
            // Assuming no createdAt for books yet, show neutral
            this.updateTrend('bookTrend', 0, '');
        }

        // 3. Series & Movies Stat (From Shows Module)
        if (typeof Shows !== 'undefined' && Shows.shows) {
            const seriesCount = Shows.shows.filter(s => s.type === 'dizi').length;
            const moviesCount = Shows.shows.filter(s => s.type === 'film').length;

            this.setEl('totalSeries', seriesCount);
            this.updateTrend('seriesTrend', 0, '');

            this.setEl('totalMovies', moviesCount);
            this.updateTrend('movieTrend', 0, '');
        }

        // 5. Games Stat
        let gameCount = 0;
        if (typeof Games !== 'undefined' && Games.games) {
            gameCount = Games.games.length;
            this.setEl('totalGames', gameCount);
            this.updateTrend('gameTrend', 0, '');
        }

        // 6. Total Sites Stat (Using Global Sites Module)
        const siteCount = (typeof Sites !== 'undefined' && Sites.sites) ? Sites.sites.length : 0;
        this.setEl('totalStatsCombined', siteCount);
        this.updateTrend('totalStatsTrend', 0, 'Site');
    },

    setEl(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    },

    updateTrend(elementId, value, label = '') {
        const el = document.getElementById(elementId);
        if (!el) return;

        // Reset classes
        el.className = 'stat-trend';

        if (value > 0) {
            el.classList.add('positive');
            el.innerHTML = `
                <span>+${value} ${label}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            `;
        } else if (value < 0) {
            el.classList.add('negative');
            el.innerHTML = `
                <span>${value} ${label}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            `;
        } else {
            el.classList.add('neutral');
            el.innerHTML = `
                <span>-</span>
            `;
        }
    },

    selectSiteIcon(icon, btn) {
        // Obsolete
    },

    deleteQuickSite(index) {
        Notifications.confirm('Uygulamayı Sil', 'Bu uygulamayı silmek istiyor musunuz?', () => {
            this.quickSites.splice(index, 1);
            this.saveQuickSites();
            this.renderQuickSites();
            Notifications.add('Uygulama Silindi', 'Uygulama kaldırıldı.', 'info', true);
        }, 'Evet, Sil');
    }
};

// Make Dashboard globally available
window.Dashboard = Dashboard;
