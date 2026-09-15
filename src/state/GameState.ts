export interface GameState {
    unlockedDisciples: string[];
    unlockedPassages: string[];
    unlockedContexts: string[];
    scrolls: number;
    activeCharacter: string;
}

const defaultState: GameState = {
    unlockedDisciples: ['peter'],
    unlockedPassages: [],
    unlockedContexts: [],
    scrolls: 0,
    activeCharacter: 'peter'
};

class StateManager {
    public state: GameState;
    private storageKey = 'theCallGame_saveData';

    constructor() {
        this.state = this.load();
    }

    public load(): GameState {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                return { ...defaultState, ...JSON.parse(data) };
            }
        } catch (e) {
            console.error('Failed to load save data:', e);
        }
        return { ...defaultState };
    }

    public save(): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save data:', e);
        }
    }

    public reset(): void {
        this.state = { ...defaultState };
        this.save();
    }
}

export const gameStateManager = new StateManager();
export const state = gameStateManager.state;
