/**
 * Système de gestion offline pour le POS
 * Utilise IndexedDB pour stocker les données localement
 */

interface OfflineVente {
    id: string;
    data: any;
    timestamp: number;
    synced: boolean;
}

class OfflineStorage {
    private dbName = 'pos-offline-db';
    private dbVersion = 1;
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Store pour les ventes offline
                if (!db.objectStoreNames.contains('ventes')) {
                    const ventesStore = db.createObjectStore('ventes', { keyPath: 'id' });
                    ventesStore.createIndex('timestamp', 'timestamp', { unique: false });
                    ventesStore.createIndex('synced', 'synced', { unique: false });
                }

                // Store pour les mouvements de stock offline
                if (!db.objectStoreNames.contains('stock_movements')) {
                    const stockStore = db.createObjectStore('stock_movements', { keyPath: 'id' });
                    stockStore.createIndex('timestamp', 'timestamp', { unique: false });
                    stockStore.createIndex('synced', 'synced', { unique: false });
                }
            };
        });
    }

    async saveVente(venteData: any): Promise<string> {
        if (!this.db) {
            await this.init();
        }

        const id = `vente_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const offlineVente: OfflineVente = {
            id,
            data: venteData,
            timestamp: Date.now(),
            synced: false,
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['ventes'], 'readwrite');
            const store = transaction.objectStore('ventes');
            const request = store.add(offlineVente);

            request.onsuccess = () => resolve(id);
            request.onerror = () => reject(request.error);
        });
    }

    async getUnsyncedVentes(): Promise<OfflineVente[]> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['ventes'], 'readonly');
            const store = transaction.objectStore('ventes');
            const index = store.index('synced');
            const request = index.getAll(false);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async markVenteAsSynced(id: string): Promise<void> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['ventes'], 'readwrite');
            const store = transaction.objectStore('ventes');
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const vente = getRequest.result;
                if (vente) {
                    vente.synced = true;
                    const updateRequest = store.put(vente);
                    updateRequest.onsuccess = () => resolve();
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    resolve();
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async deleteVente(id: string): Promise<void> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['ventes'], 'readwrite');
            const store = transaction.objectStore('ventes');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async isOnline(): Promise<boolean> {
        return navigator.onLine;
    }

    async syncPendingVentes(): Promise<void> {
        if (!(await this.isOnline())) {
            return;
        }

        const unsyncedVentes = await this.getUnsyncedVentes();

        for (const offlineVente of unsyncedVentes) {
            try {
                // Tenter de synchroniser avec le backend
                const response = await fetch('/vente', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                    },
                    body: JSON.stringify(offlineVente.data),
                });

                if (response.ok) {
                    await this.markVenteAsSynced(offlineVente.id);
                    await this.deleteVente(offlineVente.id);
                }
            } catch (error) {
                console.error('Erreur lors de la synchronisation:', error);
            }
        }
    }
}

export const offlineStorage = new OfflineStorage();

// Initialiser le stockage offline au chargement
if (typeof window !== 'undefined') {
    offlineStorage.init().catch(console.error);

    // Écouter les changements de connexion
    window.addEventListener('online', () => {
        offlineStorage.syncPendingVentes().catch(console.error);
    });

    // Synchroniser périodiquement
    setInterval(() => {
        offlineStorage.syncPendingVentes().catch(console.error);
    }, 30000); // Toutes les 30 secondes
}


