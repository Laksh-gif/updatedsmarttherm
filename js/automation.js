
class AutomationEngine {
    constructor(simulator) {
        this.simulator = simulator;
        
        this.settings = {
            unoccupiedTimeoutMs: 15000, 
            powerOverloadThreshold: 4.0,
            autoEnabled: {
                room1: true
            }
        };

        this.eventLog = [];
        this.onEventCallback = null;
        this.onAlertCallback = null;

       
        this.lastState = {};

        
        this.simulator.subscribe((data) => this.processData(data));
    }

    setEventCallback(cb) { this.onEventCallback = cb; }
    setAlertCallback(cb) { this.onAlertCallback = cb; }

    toggleAuto(roomId, isEnabled) {
        this.settings.autoEnabled[roomId] = isEnabled;
        this.logEvent(roomId, `Automation ${isEnabled ? 'enabled' : 'disabled'}`, 'info');
    }

    processData(roomsData) {
        const now = Date.now();

        Object.keys(roomsData).forEach(roomId => {
            let room = roomsData[roomId];
            
            
            if (room.power > this.settings.powerOverloadThreshold) {
                if (!this.lastState[`${roomId}_overload`]) {
                    this.triggerAlert(roomId, 'High Power Consumption Detected!', `Power usage in ${room.name} exceeded ${this.settings.powerOverloadThreshold} kW.`, 'danger');
                    this.lastState[`${roomId}_overload`] = true;
                    
                    
                    if (room.acState.on && room.acState.mode !== 'eco') {
                        this.logEvent(roomId, 'Safety Override: Forcing ECO mode to reduce load.', 'warning');
                        this.simulator.setACState(roomId, { mode: 'eco' });
                    }
                }
            } else {
                this.lastState[`${roomId}_overload`] = false;
            }

           
            if (!this.settings.autoEnabled[roomId]) return;

           
            if (!room.occupied) {
                this.lastState[`${roomId}_occupied_cool_triggered`] = false;

                const timeSinceMovement = now - room.lastMovement;
                if (timeSinceMovement > this.settings.unoccupiedTimeoutMs && room.acState.on && room.acState.mode === 'cool') {
                
                    if (!this.lastState[`${roomId}_eco_triggered`]) {
                        this.logEvent(roomId, 'Room unoccupied. Switching AC to ECO mode to save energy.', 'success');
                        this.simulator.setACState(roomId, { mode: 'eco' });
                        this.lastState[`${roomId}_eco_triggered`] = true;
                        this.triggerAlert(roomId, 'Energy Saving Active', `${room.name} unoccupied. AC switched to ECO.`, 'warning');
                    }
                }
            } else {
                
                this.lastState[`${roomId}_eco_triggered`] = false;

                if (room.acState.on && room.acState.mode === 'eco' && !this.lastState[`${roomId}_overload`]) {
                     if (!this.lastState[`${roomId}_occupied_cool_triggered`]) {
                         this.logEvent(roomId, 'Occupancy detected. Switching ECO -> COOL for comfort.', 'info');
                         this.simulator.setACState(roomId, { mode: 'cool' });
                         this.lastState[`${roomId}_occupied_cool_triggered`] = true;
                     }

                     return;
                }
                
                if (!room.acState.on && room.temp > room.acState.targetTemp + 0.5) {
                     if (!this.lastState[`${roomId}_auto_on`]) {
                         this.logEvent(roomId, 'Occupancy detected and temp high. Turning AC ON.', 'info');
                         this.simulator.setACState(roomId, { on: true, mode: 'cool' });
                         this.lastState[`${roomId}_auto_on`] = true;
                     }
                } else {
                     this.lastState[`${roomId}_auto_on`] = false;
                }

                if (room.acState.mode !== 'eco') {
                    this.lastState[`${roomId}_occupied_cool_triggered`] = false;
                }
            }
        });
    }

    logEvent(roomId, message, type = 'info') {
        const event = {
            id: Date.now() + Math.random(),
            roomId,
            time: new Date(),
            message,
            type
        };
        this.eventLog.unshift(event);
        if (this.eventLog.length > 50) this.eventLog.pop();
        
        if (this.onEventCallback) this.onEventCallback(event);
    }

    triggerAlert(roomId, title, message, type) {
        if (this.onAlertCallback) {
            this.onAlertCallback({ roomId, title, message, type });
        }
    }
}

window.AutomationEngine = AutomationEngine;
