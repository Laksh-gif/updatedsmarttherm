/**
 * Simulator to mock ESP32 hardware data.
 * Generates random variations for temperature and power based on AC status,
 * and simulates occupancy events.
 */
class ESP32Simulator {
    constructor() {
        this.rooms = {
            room1: {
                name: 'Prototype Room',
                temp: 24.5,
                humidity: 48,
                power: 0.8,
                occupied: true,
                acState: { on: true, mode: 'cool', targetTemp: 24 },
                lastMovement: Date.now()
            }
        };
        
        this.listeners = [];
        this.interval = null;
    }

    start() {
        // Emit initial data
        this.emit();
        
        // Update data every 2 seconds
        this.interval = setInterval(() => {
            this.updateSimulatedData();
            this.emit();
        }, 2000);

        // Randomly change occupancy to demonstrate adaptive prototype behavior.
        setInterval(() => {
            this.randomizeOccupancy();
        }, 22000);
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    emit() {
        // Deep copy to prevent reference issues
        this.listeners.forEach(cb => cb(JSON.parse(JSON.stringify(this.rooms))));
    }

    updateSimulatedData() {
        Object.keys(this.rooms).forEach(roomId => {
            let room = this.rooms[roomId];
            
            let tempDelta = 0;
            if (room.acState.on) {
                if (room.acState.mode === 'cool' && room.temp > room.acState.targetTemp) {
                    tempDelta = -0.1;
                } else if (room.acState.mode === 'eco') {
                    if (room.temp > room.acState.targetTemp + 1) tempDelta = -0.05;
                    else tempDelta = 0.05;
                } else if (room.acState.mode === 'fan') {
                    tempDelta = 0.02;
                }
            } else {
                if (room.temp < 28) tempDelta = +0.1;
            }
            
            tempDelta += (Math.random() - 0.5) * 0.05;
            room.temp = Math.max(16, Math.min(35, room.temp + tempDelta));

            let humidityDelta = (Math.random() - 0.5) * 0.8;
            if (room.acState.on && room.acState.mode === 'cool') humidityDelta -= 0.15;
            if (room.acState.on && room.acState.mode === 'fan') humidityDelta += 0.05;
            if (!room.acState.on) humidityDelta += 0.18;
            if (room.occupied) humidityDelta += 0.08;
            room.humidity = Math.max(35, Math.min(75, room.humidity + humidityDelta));

            let basePower = room.occupied ? 0.28 : 0.16;

            let acPower = 0;
            if (room.acState.on) {
                if (room.acState.mode === 'cool') {
                    let diff = Math.max(0, room.temp - room.acState.targetTemp);
                    acPower = 1.0 + (diff * 0.2); 
                } else if (room.acState.mode === 'eco') {
                    acPower = 0.6;
                } else if (room.acState.mode === 'fan') {
                    acPower = 0.2;
                }
            }

            let noise = (Math.random() * 0.1);
            let simulatedPower = basePower + acPower + noise;

            if (Math.random() < 0.025 && room.acState.on) {
                simulatedPower += 2.5; 
            }

            room.power = simulatedPower;
        });
    }

    randomizeOccupancy() {
        let room = this.rooms.room1;
        room.occupied = !room.occupied;
        room.lastMovement = Date.now();
        
        this.emit();
    }

    // Methods for UI/Automation to interact with hardware
    setACState(roomId, newState) {
        if (this.rooms[roomId]) {
            this.rooms[roomId].acState = { ...this.rooms[roomId].acState, ...newState };
            this.emit();
        }
    }
}

// Export for module use if needed, else attached to window
window.ESP32Simulator = ESP32Simulator;
