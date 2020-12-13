"use strict";

const Msg = require("../../models/msg");

exports.commands = ["quit"];
exports.allowDisconnected = true;

exports.input = function (network, chan) {
	chan.pushMessage(
		this,
		new Msg({
			type: Msg.Type.ERROR,
			text:
				"You can not use /quit. Please use /znc disconnect <message> instead to disconnect from a network. Or type /disconnect to disconnect webchat from IRCManager.",
		})
	);
};
