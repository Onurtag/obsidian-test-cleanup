import { Plugin } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		console.log("-----LOAD-----");

		/**
		 * --- Plugin: obsidian-test-cleanup-cache ---
		 * Obsidian -cache databases leak your vault data (such as tags, headings, lists...)
		 * (See: https://forum.obsidian.md/t/security-vault-contents-exposed-outside-the-vaults-directory/28886 )
		 * 
		 * This is an experimental plugin that tries to clear that cache.
		 * The goal: cache should not exist after closing obsidian.
		 * 
		 * P.S: This does not mean that no data is going to leak. There might be more leaked data in a database somewhere else.
		 * P.P.S: I do not know what the cache is used for. It might just be used for a shorter startup time or maybe its used for something more important.
		 * 
		 */

		//TODO: optimize method of clearing the cache (doing it once on load doesn't cut it) 
		//either observe or log when its created (on load, on file creation, on deletion etc?) and clear only when needed.
		//Or connect to db and check for the tables (empty the store) and clear only if theres any data
		await this.clearCaches();

		this.registerInterval(window.setInterval(async () => {
			//This might be overkill if the cache doesn't have any data.
			await this.clearCaches();
		}, 2 * 1000));
	}

	async onunload() {
		console.log("-----UNLOAD-----");
		await this.clearCaches();
	}

	async clearCaches() {
		const dbs = await window.indexedDB.databases();
		dbs.forEach(db => {
			//Delete indexedDB databases with names that contain "cache"
			if (db.name.contains("cache")) {
				window.indexedDB.deleteDatabase(db.name);
				console.log('Cache deleted:', db.name);
			}
		});
	}
	
}
