"use strict";

const Chan = require("../../models/chan");
const Msg = require("../../models/msg");

exports.commands = ["mode", "voice", "devoice", "hop", "dehop", "op", "deop", "admin", "deadmin", "owner", "deowner", "operadmin", "deoperadmin"];

exports.input = function ({irc, nick}, chan, cmd, args) {
	if (cmd !== "mode") {
		if (chan.type !== Chan.Type.CHANNEL) {
			chan.pushMessage(
				this,
				new Msg({
					type: Msg.Type.ERROR,
					text: `${cmd} command can only be used in channels.`,
				})
			);

			return;
		}

		if (args.length === 0) {
			chan.pushMessage(
				this,
				new Msg({
					type: Msg.Type.ERROR,
					text: `Usage: /${cmd} <nick> [...nick]`,
				})
			);

			return;
		}

		const mode = {
			voice: "+v",
			devoice: "-v",
			hop: "+h",
			dehop: "-h",
			op: "+o",
			deop: "-o",
			admin: "+a",
			deadmin: "-a",
			owner: "+q",
			deowner: "-q",
			operadmin: "+Y",
			deoperadmin: "-Y",			
		}[cmd];

		args.forEach(function (target) {
			irc.raw("MODE", chan.name, mode, target);
		});

		return;
	}

	if (args.length === 0 || args[0][0] === "+" || args[0][0] === "-") {
		args.unshift(
			chan.type === Chan.Type.CHANNEL || chan.type === Chan.Type.QUERY ? chan.name : nick
		);
	}

	irc.raw("MODE", ...args);
};
