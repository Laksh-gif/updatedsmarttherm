
class UIManager {
    constructor(simulator, automation) {
        this.simulator = simulator;
        this.automation = automation;
        this.currentRoomId = 'room1';
        this.roomsData = null;
        
       
        this.history = {
            labels: [],
            tempData: [],
            powerData: [],
            comfortData: []
        };
        this.maxHistoryPoints = 30;

        this.initDOM();
        this.initChart();
        this.initAnalyticsCharts();
        this.bindEvents();
    }

    initDOM() {
       
        this.els = {
            roomSelector: document.getElementById('room-selector'),
            roomTitle: document.getElementById('current-room-title'),
            clock: document.getElementById('clock'),
            alertBadge: document.getElementById('alert-badge'),
            
            
            valTemp: document.getElementById('val-temp'),
            valPower: document.getElementById('val-power'),
            valOcc: document.getElementById('val-occ'),
            valAc: document.getElementById('val-ac'),
            acIcon: document.getElementById('ac-icon'),
            
            trendTemp: document.getElementById('trend-temp'),
            trendPower: document.getElementById('trend-power'),
            trendOcc: document.getElementById('trend-occ'),
            trendAc: document.getElementById('trend-ac'),
            
            
            autoToggle: document.getElementById('auto-toggle'),
            btnPower: document.getElementById('btn-power'),
            btnTempDown: document.getElementById('btn-temp-down'),
            btnTempUp: document.getElementById('btn-temp-up'),
            valTargetTemp: document.getElementById('val-target-temp'),
            btnModes: document.querySelectorAll('.btn-mode'),
            
            
            eventLog: document.getElementById('event-log'),
            toastContainer: document.getElementById('toast-container'),
            
            
            navItems: document.querySelectorAll('.nav-item[data-target]'),
            views: document.querySelectorAll('.view'),
            mobileMenuBtn: document.getElementById('mobile-menu-btn'),
            navLinks: document.getElementById('nav-links'),
            
            
            btnSaveSettings: document.getElementById('btn-save-settings'),
            settingTimeout: document.getElementById('setting-timeout'),
            settingOverload: document.getElementById('setting-overload'),

            thermalCard: document.getElementById('thermal-room-card'),
            thermalRoomName: document.getElementById('thermal-room-name'),
            thermalTemp: document.getElementById('thermal-room-temp'),
            thermalState: document.getElementById('thermal-room-state'),
            thermalStatusPill: document.getElementById('thermal-status-pill'),
            thermalHumidity: document.getElementById('thermal-humidity'),
            thermalPower: document.getElementById('thermal-power'),
            thermalOccupancy: document.getElementById('thermal-occupancy'),
            thermalAcMode: document.getElementById('thermal-ac-mode'),
            comfortScore: document.getElementById('comfort-score'),
            comfortStatus: document.getElementById('comfort-status'),
            comfortScoreBar: document.getElementById('comfort-score-bar'),
            comfortTempFactor: document.getElementById('comfort-temp-factor'),
            comfortHumidityFactor: document.getElementById('comfort-humidity-factor'),
            comfortOccupancyFactor: document.getElementById('comfort-occupancy-factor'),
            comfortEnergyFactor: document.getElementById('comfort-energy-factor'),
            comfortInsight: document.getElementById('comfort-insight')
        };
        
        
        setInterval(() => {
            const now = new Date();
            this.els.clock.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }, 1000);
    }

    initChart() {
        const ctx = document.getElementById('mainChart').getContext('2d');

        if (typeof Chart === 'undefined') {
            this.chart = { update: () => {} };
            return;
        }
        
       
        Chart.defaults.color = '#a1a1aa';
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(9, 9, 11, 0.9)';
        Chart.defaults.plugins.tooltip.padding = 12;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
        Chart.defaults.plugins.tooltip.titleFont = { size: 14, weight: 'bold' };

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.history.labels,
                datasets: [
                    {
                        label: 'Power (kW)',
                        data: this.history.powerData,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        borderWidth: 3,
                        tension: 0.5,
                        yAxisID: 'y',
                        fill: true,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Temperature (\u00B0C)',
                        data: this.history.tempData,
                        borderColor: '#06b6d4',
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        tension: 0.5,
                        yAxisID: 'y1',
                        pointRadius: 0,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: false } 
                },
                scales: {
                    x: { grid: { display: false }, border: { display: false } },
                    y: {
                        type: 'linear', display: true, position: 'left', min: 0, max: 6,
                        grid: { color: 'rgba(255,255,255,0.03)', borderDash: [5, 5] },
                        border: { display: false }
                    },
                    y1: {
                        type: 'linear', display: true, position: 'right', min: 15, max: 35,
                        grid: { display: false }, border: { display: false }
                    }
                }
            }
        });
    }

    initAnalyticsCharts() {
        if (typeof Chart === 'undefined') return;

        const ctxTemp = document.getElementById('analyticsTempChart')?.getContext('2d');
        const ctxOcc = document.getElementById('analyticsOccChart')?.getContext('2d');
        const ctxEnergy = document.getElementById('energyTrendChart')?.getContext('2d');

        if (ctxTemp) {
            this.analyticsComfortChart = new Chart(ctxTemp, {
                type: 'line',
                data: {
                    labels: this.history.labels,
                    datasets: [{
                        label: 'Comfort Score',
                        data: this.history.comfortData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        borderWidth: 3,
                        tension: 0.45,
                        fill: true,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    }]
                },
                options: { 
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, border: { display: false } },
                        y: {
                            min: 0,
                            max: 100,
                            ticks: { callback: value => `${value}%` },
                            grid: { color: 'rgba(255,255,255,0.04)', borderDash: [5, 5] },
                            border: { display: false }
                        }
                    }
                }
            });
        }

        if (ctxOcc) {
            this.analyticsFactorChart = new Chart(ctxOcc, {
                type: 'radar',
                data: {
                    labels: ['Temperature', 'Humidity', 'Occupancy', 'Energy'],
                    datasets: [{
                        data: [90, 90, 90, 90],
                        backgroundColor: 'rgba(6, 182, 212, 0.18)',
                        borderColor: '#06b6d4',
                        borderWidth: 2,
                        pointBackgroundColor: '#f8fafc',
                        pointBorderColor: '#06b6d4'
                    }]
                },
                options: { 
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        r: {
                            min: 0,
                            max: 100,
                            ticks: { display: false, stepSize: 25 },
                            grid: { color: 'rgba(255,255,255,0.08)' },
                            angleLines: { color: 'rgba(255,255,255,0.08)' },
                            pointLabels: { color: '#cbd5e1', font: { size: 12 } }
                        }
                    }
                }
            });
        }

        if (ctxEnergy) {
            new Chart(ctxEnergy, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Energy Usage (kWh)',
                        data: [1200, 1150, 1080, 950, 890, 780],
                        backgroundColor: 'rgba(6, 182, 212, 0.8)',
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                },
                options: { 
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, border: { display: false } },
                        y: { grid: { color: 'rgba(255,255,255,0.03)', borderDash: [5, 5] }, border: { display: false } }
                    }
                }
            });
        }
    }

    bindEvents() {
       
        if (this.els.roomSelector) {
            this.els.roomSelector.addEventListener('change', (e) => {
                this.currentRoomId = e.target.value;
                
                this.history.labels = [];
                this.history.tempData = [];
                this.history.powerData = [];
                this.history.comfortData = [];
                this.updateUI(); 
            });
        }

        
        this.els.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                
                this.els.navItems.forEach(nav => nav.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
               
                const targetId = e.currentTarget.dataset.target;
                this.els.views.forEach(view => {
                    if (view.id === targetId) {
                        view.classList.add('active');
                    } else {
                        view.classList.remove('active');
                    }
                });

                
                if (this.els.navLinks && this.els.navLinks.classList.contains('active')) {
                    this.els.navLinks.classList.remove('active');
                    this.els.mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
                }
            });
        });

        
        if (this.els.mobileMenuBtn && this.els.navLinks) {
            this.els.mobileMenuBtn.addEventListener('click', () => {
                this.els.navLinks.classList.toggle('active');
                if (this.els.navLinks.classList.contains('active')) {
                    this.els.mobileMenuBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                } else {
                    this.els.mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
                }
            });
        }

       
        this.els.autoToggle.addEventListener('change', (e) => {
            this.automation.toggleAuto(this.currentRoomId, e.target.checked);
        });

        this.els.btnPower.addEventListener('click', () => {
            if(!this.roomsData) return;
            const currentOn = this.roomsData[this.currentRoomId].acState.on;
        
            this.simulator.setACState(this.currentRoomId, { on: !currentOn });
        });

        this.els.btnTempDown.addEventListener('click', () => {
            if(!this.roomsData) return;
            let t = this.roomsData[this.currentRoomId].acState.targetTemp;
            if(t > 16) this.simulator.setACState(this.currentRoomId, { targetTemp: t - 1 });
        });

        this.els.btnTempUp.addEventListener('click', () => {
            if(!this.roomsData) return;
            let t = this.roomsData[this.currentRoomId].acState.targetTemp;
            if(t < 30) this.simulator.setACState(this.currentRoomId, { targetTemp: t + 1 });
        });

        this.els.btnModes.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.simulator.setACState(this.currentRoomId, { mode: mode, on: true }); 
            });
        });

        
        this.simulator.subscribe((data) => {
            this.roomsData = data;
            this.updateUI();
        });

      
        this.automation.setEventCallback((event) => this.addLogEntry(event));
        this.automation.setAlertCallback((alert) => this.showToast(alert.title, alert.message, alert.type));

    
        if (this.els.btnSaveSettings) {
            this.els.btnSaveSettings.addEventListener('click', () => {
                const timeout = parseInt(this.els.settingTimeout.value, 10);
                const overload = parseFloat(this.els.settingOverload.value);
                
                if (timeout && timeout > 0) this.automation.settings.unoccupiedTimeoutMs = timeout * 1000;
                if (overload && overload > 0) this.automation.settings.powerOverloadThreshold = overload;
                
                this.showToast('Settings Saved', 'Automation thresholds updated successfully.', 'success');
            });
        }
    }

    updateUI() {
        if (!this.roomsData || !this.roomsData[this.currentRoomId]) return;
        
        const room = this.roomsData[this.currentRoomId];
        const ac = room.acState;
        const comfort = this.calculateComfort(room);
        const thermal = this.getThermalState(room.temp);

        
        this.els.roomTitle.textContent = room.name;

  
        this.els.valTemp.textContent = room.temp.toFixed(1);
        this.els.valPower.textContent = room.power.toFixed(2);

        this.els.trendTemp.className = `trend ${thermal.trendClass}`;
        this.els.trendTemp.innerHTML = `<i class="fa-solid ${thermal.icon}"></i> ${thermal.label}`;
        
        if (room.power > 3.0) {
            this.els.trendPower.className = 'trend danger';
            this.els.trendPower.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> High Load';
        } else if (room.power > 1.5) {
            this.els.trendPower.className = 'trend warning';
            this.els.trendPower.innerHTML = '<i class="fa-solid fa-bolt"></i> Moderate';
        } else {
            this.els.trendPower.className = 'trend';
            this.els.trendPower.innerHTML = '<i class="fa-solid fa-check"></i> Normal';
        }

        if (room.occupied) {
            this.els.valOcc.textContent = 'Occupied';
            this.els.trendOcc.className = 'trend neutral';
            this.els.trendOcc.textContent = 'Movement detected';
        } else {
            this.els.valOcc.textContent = 'Empty';
            this.els.trendOcc.className = 'trend warning';
            const secEmpty = Math.floor((Date.now() - room.lastMovement)/1000);
            this.els.trendOcc.textContent = `Empty for ${secEmpty}s`;
        }

        if (ac.on) {
            this.els.valAc.textContent = `ON (${ac.mode.toUpperCase()})`;
            this.els.acIcon.style.animationPlayState = 'running';
            this.els.acIcon.style.color = ac.mode === 'eco' ? 'var(--accent-green)' : 'var(--accent-cyan)';
            this.els.trendAc.textContent = ac.mode === 'eco' ? 'Energy Saving Active' : `Target: ${ac.targetTemp}\u00B0C`;
        } else {
            this.els.valAc.textContent = 'OFF';
            this.els.acIcon.style.animationPlayState = 'paused';
            this.els.acIcon.style.color = 'var(--text-muted)';
            this.els.trendAc.textContent = 'Standby';
        }

        this.updateThermalMapping(room, comfort, thermal);

     
        this.els.autoToggle.checked = this.automation.settings.autoEnabled[this.currentRoomId];
        this.els.valTargetTemp.textContent = ac.targetTemp;
        
        if (ac.on) {
            this.els.btnPower.classList.add('active');
            this.els.btnPower.innerHTML = '<i class="fa-solid fa-power-off"></i>';
        } else {
            this.els.btnPower.classList.remove('active');
            this.els.btnPower.innerHTML = '<i class="fa-solid fa-power-off"></i>';
        }

        this.els.btnModes.forEach(btn => {
            if (btn.dataset.mode === ac.mode && ac.on) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        
        const timeLabel = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        this.history.labels.push(timeLabel);
        this.history.powerData.push(room.power);
        this.history.tempData.push(room.temp);
        this.history.comfortData.push(comfort.score);

        if (this.history.labels.length > this.maxHistoryPoints) {
            this.history.labels.shift();
            this.history.powerData.shift();
            this.history.tempData.shift();
            this.history.comfortData.shift();
        }

        this.chart.update('none'); 
        if (this.analyticsComfortChart) this.analyticsComfortChart.update('none');
        if (this.analyticsFactorChart) {
            this.analyticsFactorChart.data.datasets[0].data = [
                comfort.factors.temperature,
                comfort.factors.humidity,
                comfort.factors.occupancy,
                comfort.factors.energy
            ];
            this.analyticsFactorChart.update('none');
        }
    }

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    getThermalState(temp) {
        if (temp >= 22 && temp <= 26) {
            return {
                key: 'safe',
                className: 'thermal-safe',
                label: 'Safe Zone',
                detail: 'Balanced cooling envelope',
                icon: 'fa-circle-check',
                trendClass: ''
            };
        }

        if ((temp > 26 && temp < 29) || (temp >= 19 && temp < 22)) {
            return {
                key: 'caution',
                className: 'thermal-caution',
                label: 'Watch Zone',
                detail: temp > 26 ? 'Warm drift detected' : 'Cooling below comfort band',
                icon: 'fa-triangle-exclamation',
                trendClass: 'warning'
            };
        }

        return {
            key: 'critical',
            className: 'thermal-critical',
            label: 'Action Zone',
            detail: temp >= 29 ? 'High temperature intervention needed' : 'Temperature outside comfort range',
            icon: 'fa-circle-exclamation',
            trendClass: 'danger'
        };
    }

    calculateComfort(room) {
        const ac = room.acState;
        const humidity = typeof room.humidity === 'number' ? room.humidity : 50;
        const overloadLimit = this.automation.settings.powerOverloadThreshold || 4;

        const temperature = Math.round(this.clamp(100 - Math.abs(room.temp - 24) * 13, 0, 100));
        const humidityScore = Math.round(this.clamp(100 - Math.abs(humidity - 50) * 2.8, 0, 100));
        const occupancy = Math.round(room.occupied ? (ac.on ? 96 : 68) : ((!ac.on || ac.mode === 'eco') ? 94 : 72));
        const energy = Math.round(this.clamp(100 - (room.power / overloadLimit) * 60, 0, 100));
        const modeFit = Math.round(
            room.occupied
                ? (ac.on && ac.mode !== 'eco' ? 94 : ac.on ? 84 : 62)
                : (!ac.on ? 96 : ac.mode === 'eco' ? 94 : 74)
        );

        const score = Math.round(
            temperature * 0.34 +
            humidityScore * 0.22 +
            occupancy * 0.18 +
            energy * 0.18 +
            modeFit * 0.08
        );

        let status = 'Excellent comfort balance';
        let level = 'high';
        let insight = 'The room is inside the preferred thermal range with efficient appliance activity.';

        if (score < 70) {
            status = 'Needs attention';
            level = 'low';
            insight = 'Temperature, humidity, or power load is pulling the room away from the ideal comfort band.';
        } else if (score < 85) {
            status = 'Comfort stabilizing';
            level = 'medium';
            insight = 'The room is usable, with minor thermal or efficiency drift being corrected by automation.';
        }

        return {
            score,
            status,
            level,
            insight,
            factors: {
                temperature,
                humidity: humidityScore,
                occupancy,
                energy
            }
        };
    }

    updateThermalMapping(room, comfort, thermal) {
        if (!this.els.thermalCard) return;

        const ac = room.acState;
        this.els.thermalCard.classList.remove('thermal-safe', 'thermal-caution', 'thermal-critical');
        this.els.thermalCard.classList.add(thermal.className);

        this.els.thermalRoomName.textContent = room.name;
        this.els.thermalTemp.textContent = `${room.temp.toFixed(1)}\u00B0C`;
        this.els.thermalState.textContent = thermal.detail;
        this.els.thermalStatusPill.textContent = thermal.label;
        this.els.thermalStatusPill.className = `thermal-status-pill ${thermal.key}`;
        this.els.thermalHumidity.textContent = `${Math.round(room.humidity)}% RH`;
        this.els.thermalPower.textContent = `${room.power.toFixed(2)} kW`;
        this.els.thermalOccupancy.textContent = room.occupied ? 'Occupied' : 'Empty';
        this.els.thermalAcMode.textContent = ac.on ? ac.mode.charAt(0).toUpperCase() + ac.mode.slice(1) : 'Off';

        this.els.comfortScore.textContent = comfort.score;
        this.els.comfortStatus.textContent = comfort.status;
        this.els.comfortInsight.textContent = comfort.insight;
        this.els.comfortScoreBar.style.width = `${comfort.score}%`;
        this.els.comfortScoreBar.className = `comfort-meter-fill comfort-${comfort.level}`;
        this.els.comfortTempFactor.textContent = `Temp ${comfort.factors.temperature}`;
        this.els.comfortHumidityFactor.textContent = `Humidity ${comfort.factors.humidity}`;
        this.els.comfortOccupancyFactor.textContent = `Occupancy ${comfort.factors.occupancy}`;
        this.els.comfortEnergyFactor.textContent = `Energy ${comfort.factors.energy}`;
    }

    addLogEntry(event) {
        
        if (event.roomId !== this.currentRoomId) return;

        const li = document.createElement('li');
        li.className = 'log-item';
        
        let iconHtml = '';
        if (event.type === 'info') iconHtml = '<i class="fa-solid fa-circle-info log-icon info"></i>';
        else if (event.type === 'warning') iconHtml = '<i class="fa-solid fa-triangle-exclamation log-icon warning"></i>';
        else if (event.type === 'danger') iconHtml = '<i class="fa-solid fa-circle-xmark log-icon danger"></i>';
        else if (event.type === 'success') iconHtml = '<i class="fa-solid fa-circle-check log-icon success"></i>';

        const timeStr = event.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});

        li.innerHTML = `
            ${iconHtml}
            <div class="log-content">
                <span class="log-time">${timeStr}</span>
                <p>${event.message}</p>
            </div>
        `;
        
        this.els.eventLog.prepend(li);
    }

    showToast(title, message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconClass = 'fa-circle-info';
        if (type === 'warning') iconClass = 'fa-triangle-exclamation';
        if (type === 'danger') iconClass = 'fa-radiation';
        
        toast.innerHTML = `
            <i class="fa-solid ${iconClass} fa-lg"></i>
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;
        
        this.els.toastContainer.appendChild(toast);
        
     
        let currentCount = parseInt(this.els.alertBadge.textContent);
        this.els.alertBadge.textContent = currentCount + 1;
        this.els.alertBadge.style.display = 'block';

        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 5000);
    }
}

window.UIManager = UIManager;
