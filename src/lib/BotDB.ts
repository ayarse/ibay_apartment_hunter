import Database from "better-sqlite3";

export class BotDB {

    private static instance: BotDB;
    protected conn: Database.Database = null;

    private constructor() { }

    public static getInstance(): BotDB {
        if (!BotDB.instance) {
            BotDB.instance = new BotDB();
        }
        return BotDB.instance;
    }

    get db(): Database.Database {
        if (!this.conn) {
            this.conn = Database('./ibay_apartment_hunter.db', {
                // verbose: console.log
            });
            this.initialize();
        }
        return this.conn;
    }

    lastChecked(locationPref: string): string {
        if (globalThis.debugMode) return process.env.DEBUG_LAST_CHECKED;
        return this.getConfig("last_checked_" + locationPref) ?? "0";
    }

    lastCheckedNoDebug(locationPref: string) {
        return this.getConfig("last_checked_" + locationPref);
    }

    updateLastChecked(locationPref: string, val: string) {
        this.updateConfig("last_checked_" + locationPref, val);
    }

    initialize(): void {
        this.db.exec(`CREATE TABLE IF NOT EXISTS subscribers (
            subscriber_id INTEGER NOT NULL PRIMARY KEY,
            tg_id INT(255) NOT NULL UNIQUE,
            pref_location VARCHAR(255) DEFAULT 'male'
            );`);
        this.db.exec(`CREATE TABLE IF NOT EXISTS config (
            config_key VARCHAR(255) NOT NULL UNIQUE,
            config_value VARCHAR(255)
            );`);
    }

    addSubscriber(tgId: string): boolean {
        const stmt = this.db.prepare(`INSERT INTO subscribers (tg_id) VALUES (@tgId)`);
        const insert = stmt.run({
            tgId
        });
        return insert.changes === 1;
    }

    hasSubscriber(tgId: string): boolean {
        let count = this.db.prepare(`SELECT COUNT(*) as count FROM subscribers WHERE tg_id = @tgId`)
            .get({
                tgId
            })
            .count;
        return count > 0;
    }

    removeSubscriber(tgId: string): boolean {
        const stmt = this.db
            .prepare('DELETE FROM subscribers WHERE tg_id = @tgId');
        const remove = stmt
            .run({ tgId });
        return remove.changes === 1;
    }

    updateConfig(configKey: string, configValue: string): boolean {
        const stmt = this.db
            .prepare(`INSERT OR REPLACE INTO config (
                config_key, 
                config_value
                ) VALUES (
                    @configKey, 
                    @configValue
                    );`);
        const update = stmt.run({
            configKey,
            configValue
        });
        return update.changes === 1;
    }

    getConfig(configKey: string): any {
        let row = this.db
            .prepare(`SELECT config_value FROM config WHERE config_key = @configKey`)
            .get({ configKey });
        if (typeof row !== "undefined") {
            return row["config_value"];
        } else {
            return null;
        }
    }

    getUsersByPref(locationPref: string): any[] {
        let rows = this.db
            .prepare(`SELECT tg_id FROM subscribers WHERE pref_location = @locationPref`)
            .all({ locationPref });
        return rows ?? [];
    }

    updateUserPref(tg_id: string, val: string) {
        const stmt = this.db
            .prepare(`UPDATE subscribers SET pref_location = @val WHERE tg_id = @tg_id`);
        const update = stmt.run({
            val,
            tg_id
        });
        return update.changes === 1;
    }

    countUsers(): any {
        return this.db
            .prepare(`SELECT COUNT(*) FROM subscribers`).get()["COUNT(*)"];
    }

}